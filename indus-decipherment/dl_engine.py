"""
딥러닝 자율 학습 엔진 v2 — PyTorch Transformer (BERT 스타일)

개선 사항 (OBI-CMF + Ithaca 논문 기반):
  1. Zipf 가중 마스킹: 빈도 낮은 기호를 더 자주 마스킹 → 희귀 기호 학습 강화
  2. Contrastive Loss: 같은 위치 역할 기호는 가까이 (OBI-CMF 스타일)
  3. 위치 역할 보조 학습: INIT/MED/TERM 분류 헤드 추가
  4. sign_confidences를 state에 저장 → constrained_rescorer가 직접 참조 가능
  5. 기본 200 에폭 (이전 60에서 증가)
  6. MPS(Apple Silicon GPU) 가속
"""
import json, math, time, threading
from pathlib import Path
from collections import Counter
from typing import List, Dict

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from corpus import Inscription

STATUS_FILE = Path('dl_status.json')

dl_state = {
    'status': 'idle', 'epoch': 0, 'total_epochs': 0,
    'decipherment_rate': 0.0, 'loss': 0.0, 'history': [],
    'message': '', 'best_rate': 0.0,
    'sign_confidences': {},   # {sign_id(str): float} — 외부 통합용
}
_lock = threading.Lock()


def _upd(**kw):
    with _lock:
        dl_state.update(kw)
    STATUS_FILE.write_text(
        json.dumps({k: v for k, v in dl_state.items() if k != 'sign_confidences'},
                   ensure_ascii=False),
        encoding='utf-8')


def get_sign_confidences() -> Dict[int, float]:
    """constrained_rescorer 에서 직접 호출하는 DL 신뢰도 딕셔너리"""
    with _lock:
        raw = dl_state.get('sign_confidences', {})
    return {int(k): float(v) for k, v in raw.items() if v > 0}


# ── 모델 ──────────────────────────────────────────────────
class IndusBERT(nn.Module):
    def __init__(self, vocab_size: int, d_model=128, n_head=4, n_layer=4, max_len=40):
        super().__init__()
        self.vocab_size = vocab_size
        self.mask_id    = vocab_size
        self.pad_id     = vocab_size + 1
        total = vocab_size + 2
        self.embed = nn.Embedding(total, d_model, padding_idx=self.pad_id)
        self.pos   = nn.Embedding(max_len, d_model)
        enc = nn.TransformerEncoderLayer(d_model, n_head, dim_feedforward=512,
                                         dropout=0.1, batch_first=True, norm_first=True)
        self.encoder = nn.TransformerEncoder(enc, num_layers=n_layer)
        self.mlm_head = nn.Linear(d_model, total)           # MLM 헤드
        self.pos_head  = nn.Linear(d_model, 3)              # 위치 역할: INIT/MED/TERM
        nn.init.xavier_uniform_(self.mlm_head.weight)
        nn.init.xavier_uniform_(self.pos_head.weight)

    def forward(self, x: torch.Tensor):
        B, L = x.shape
        pos      = torch.arange(L, device=x.device).unsqueeze(0)
        pad_mask = (x == self.pad_id)
        h = self.embed(x) + self.pos(pos)
        h = self.encoder(h, src_key_padding_mask=pad_mask)
        return self.mlm_head(h), self.pos_head(h), h  # logits, pos_logits, hidden


# ── Zipf 가중 마스킹 ──────────────────────────────────────
def _zipf_mask_probs(vocab: List[int], freq: Counter, base_p=0.15) -> np.ndarray:
    """
    빈도에 반비례하는 마스킹 확률.
    희귀 기호(rank 높음) → 더 자주 마스킹 → 학습 기회 균등화
    """
    ranks = {s: i + 1 for i, (s, _) in enumerate(freq.most_common())}
    probs = np.array([1.0 / math.sqrt(ranks.get(s, len(vocab))) for s in vocab])
    probs = probs / probs.sum() * len(vocab) * base_p
    return np.clip(probs, 0.08, 0.40)


# ── 데이터 준비 ────────────────────────────────────────────
def _build_dataset(corpus: List[Inscription], vocab: List[int], max_len=40):
    idx = {s: i for i, s in enumerate(vocab)}
    seqs, pos_labels = [], []
    for insc in corpus:
        ids = [idx[s] for s in insc.sign_sequence if s in idx]
        if len(ids) < 2:
            continue
        if len(ids) > max_len:
            ids = ids[:max_len]
        L = len(ids)
        # 위치 레이블: 0=INIT, 1=MED, 2=TERM
        pl = []
        for i in range(L):
            norm = i / max(L - 1, 1)
            pl.append(0 if norm < 0.33 else (2 if norm > 0.67 else 1))
        seqs.append(ids)
        pos_labels.append(pl)
    return seqs, pos_labels


def _make_batch(seqs, pos_labels, mask_probs, mask_id, pad_id,
                batch_size=64):
    indices = np.random.randint(0, len(seqs), batch_size)
    batch   = [(seqs[i], pos_labels[i]) for i in indices]
    max_L   = max(len(s) for s, _ in batch)
    X, Y_mlm, Y_pos = [], [], []
    for s, pl in batch:
        L = len(s)
        x, y_mlm, y_pos = s[:], [-100] * L, pl[:]
        for i in range(L):
            # Zipf 가중 마스킹 확률
            p = float(mask_probs[s[i]]) if s[i] < len(mask_probs) else 0.15
            if np.random.random() < p:
                y_mlm[i] = x[i]
                x[i] = mask_id
        pad = max_L - L
        x     += [pad_id] * pad
        y_mlm += [-100]   * pad
        y_pos += [-100]   * pad
        X.append(x); Y_mlm.append(y_mlm); Y_pos.append(y_pos)
    return (torch.tensor(X), torch.tensor(Y_mlm), torch.tensor(Y_pos))


# ── Contrastive Loss (같은 위치 역할끼리 가깝게) ─────────
def _contrastive_loss(hidden: torch.Tensor, y_pos: torch.Tensor,
                      temperature=0.07) -> torch.Tensor:
    """
    OBI-CMF 스타일 대조 학습.
    같은 위치 레이블(INIT/MED/TERM)의 표현은 가깝게, 다른 레이블은 멀게.
    hidden: [B*L, D], y_pos: [B*L]
    """
    B_L, D = hidden.shape
    mask = (y_pos >= 0)
    if mask.sum() < 4:
        return torch.tensor(0.0, device=hidden.device)

    h  = F.normalize(hidden[mask], dim=-1)
    lbl = y_pos[mask]
    sim = h @ h.T / temperature  # [N, N]
    pos_mask = (lbl.unsqueeze(0) == lbl.unsqueeze(1)).float()
    pos_mask.fill_diagonal_(0)   # 자기 자신 제외

    # InfoNCE 스타일
    log_prob = sim - torch.logsumexp(sim, dim=-1, keepdim=True)
    loss_mat = -log_prob * pos_mask
    n_pos    = pos_mask.sum(-1).clamp(min=1)
    return (loss_mat.sum(-1) / n_pos).mean()


# ── 해독률 계산 ────────────────────────────────────────────
@torch.no_grad()
def _eval_rate(model, seqs, vocab, device, n_sample=600) -> tuple:
    model.eval()
    V        = len(vocab)
    sign_conf: Dict[int, list] = {i: [] for i in range(V)}

    sample_seqs = seqs[:n_sample]
    for seq in sample_seqs:
        if len(seq) < 2:
            continue
        for pos in range(len(seq)):
            x = seq[:]
            true_id = x[pos]
            x[pos] = model.mask_id
            t = torch.tensor([x], device=device)
            logits, _, _ = model(t)
            prob    = torch.softmax(logits[0, pos, :V], -1)
            top_p   = float(prob[true_id])
            sign_conf[true_id].append(top_p)

    all_conf = {}
    for i in range(V):
        vals = sign_conf[i]
        all_conf[vocab[i]] = float(np.mean(vals)) if vals else 0.0

    vals = sorted(all_conf.values())
    n    = len(vals)
    p80  = vals[int(n * 0.80)] if n else 0.6
    p50  = vals[int(n * 0.50)] if n else 0.4
    p20  = vals[int(n * 0.20)] if n else 0.2

    confirmed = sum(1 for v in all_conf.values() if v >= p80)
    partial   = sum(1 for v in all_conf.values() if p50 <= v < p80)
    clue      = sum(1 for v in all_conf.values() if p20 <= v < p50)
    rate      = round((confirmed + partial * 0.5 + clue * 0.2) / max(n, 1) * 100, 1)
    return rate, all_conf


# ── 훈련 루프 ──────────────────────────────────────────────
def run_dl(corpus: List[Inscription], epochs=200, batch_size=64):
    _upd(status='running', epoch=0, total_epochs=epochs, history=[], message='초기화 중...')

    device  = torch.device('mps' if torch.backends.mps.is_available() else 'cpu')
    freq    = Counter(s for insc in corpus for s in insc.sign_sequence)
    vocab   = [s for s, _ in freq.most_common(300)]
    V       = len(vocab)

    seqs, pos_labels = _build_dataset(corpus, vocab)
    mask_probs = _zipf_mask_probs(vocab, freq)

    model   = IndusBERT(V).to(device)
    opt     = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    sched   = torch.optim.lr_scheduler.CosineAnnealingWarmRestarts(opt, T_0=50, eta_min=1e-5)
    loss_fn = nn.CrossEntropyLoss(ignore_index=-100)

    best_rate    = 0.0
    best_conf    = {}
    history      = []
    lambda_cont  = 0.3   # contrastive loss 가중치
    lambda_pos   = 0.2   # 위치 역할 헤드 가중치

    _upd(message=f'IndusBERT v2 — vocab={V}  device={device}  seqs={len(seqs)}  '
                  f'Zipf마스킹+ContrastiveLoss+위치역할헤드')

    for ep in range(1, epochs + 1):
        model.train()
        epoch_losses = []

        steps = max(1, len(seqs) // batch_size)
        for _ in range(steps):
            X, Y_mlm, Y_pos = _make_batch(
                seqs, pos_labels, mask_probs,
                model.mask_id, model.pad_id, batch_size
            )
            X, Y_mlm, Y_pos = X.to(device), Y_mlm.to(device), Y_pos.to(device)

            logits, pos_logits, hidden = model(X)

            # MLM loss
            loss_mlm = loss_fn(logits.view(-1, V + 2), Y_mlm.view(-1))

            # 위치 역할 분류 loss
            loss_pos = loss_fn(pos_logits.view(-1, 3), Y_pos.view(-1))

            # Contrastive loss (flat hidden)
            loss_cont = _contrastive_loss(hidden.view(-1, hidden.shape[-1]), Y_pos.view(-1))

            loss = loss_mlm + lambda_pos * loss_pos + lambda_cont * loss_cont
            opt.zero_grad(); loss.backward(); opt.step()
            epoch_losses.append(float(loss_mlm))  # MLM loss만 리포트

        sched.step()
        avg_loss = round(float(np.mean(epoch_losses)), 4)

        if ep % 10 == 0 or ep <= 5:
            rate, conf = _eval_rate(model, seqs, vocab, device)
            if rate > best_rate:
                best_rate = rate
                best_conf = conf
                torch.save(model.state_dict(), 'dl_best_model.pt')
            entry = {'epoch': ep, 'loss': avg_loss, 'rate': rate, 'best_rate': best_rate}
            history.append(entry)
            # sign_confidences: {sign_id(str): float}
            sign_conf_export = {str(s): round(v, 4) for s, v in best_conf.items()}
            _upd(epoch=ep, loss=avg_loss, decipherment_rate=rate, best_rate=best_rate,
                 history=history[-80:], sign_confidences=sign_conf_export,
                 message=f'Ep {ep}/{epochs}  MLM_loss={avg_loss}  rate={rate}%  best={best_rate}%')
        else:
            _upd(epoch=ep, loss=avg_loss,
                 message=f'Ep {ep}/{epochs}  loss={avg_loss}')

    rate, conf = _eval_rate(model, seqs, vocab, device)
    best_rate  = max(best_rate, rate)
    best_conf  = conf if rate >= best_rate else best_conf
    sign_conf_export = {str(s): round(v, 4) for s, v in best_conf.items()}
    _upd(status='done', decipherment_rate=rate, best_rate=best_rate,
         sign_confidences=sign_conf_export,
         message=f'완료. 최고 해독률 {best_rate}%  ({epochs} 에폭  Zipf+Contrastive)')


def start_dl(corpus: List[Inscription], epochs=200) -> bool:
    if dl_state['status'] == 'running':
        return False
    t = threading.Thread(target=run_dl, args=(corpus, epochs), daemon=True)
    t.start()
    return True


def get_dl_state() -> dict:
    with _lock:
        return dict(dl_state)
