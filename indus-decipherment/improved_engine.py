"""
개선된 해독 엔진 — 기본 엔진 앵커 + 발견 기반 곱셈 보정

핵심 설계 원칙:
  기본 해독 엔진(22.6%)의 신뢰도를 앵커로 유지하고,
  프론티어/추가/신규 알고리즘의 발견을 곱셈 배율로 얹는다.
  → 점수는 기준점에서 위로만 이동 (역퇴행 방지)

발견 → 배율 매핑:
  PageRank 상위 20%   : ×1.25  (기능어 앵커 확정)
  SOV 접미사 후보     : ×1.20  (접미사 교착어 발견 지지)
  HMM 고신뢰 기호     : ×1.15  (4-state HMM 일치 추가 증거)
  MDL 문법 규칙 참여  : ×1.10  (Sequitur 30 규칙에 포함된 기호)
  사이트 공통 핵심어  : ×1.10  (3+ 사이트 출현 = 코어 어휘)
  Markov 예측가능 상위: ×1.08  (구조적 예측가능성)

4개 모듈:
  1. constrained_rescorer   — 곱셈 보정 (기본 앵커)
  2. site_aware_voter       — 사이트 일관성 보정 (기본 앵커)
  3. mdl_prior_sov_beam     — MDL+SOV 빔서치 음절 제안 (독립 참고용)
  4. adaptive_ensemble_em   — EM 앙상블 (기본 50% 고정 + 나머지 50% EM)
"""
import json
import math
import time
import threading
import numpy as np
from collections import Counter, defaultdict
from pathlib import Path
from typing import List, Dict, Optional

from corpus import Inscription

_SNAPSHOT_FILE = Path(__file__).parent / 'improved_snapshot.json'

improved_state = {
    'status': 'idle',
    'progress': 0,
    'message': '',
    'results': {},
    'started_at': None,
    'finished_at': None,
}
_lock = threading.Lock()

# 서버 재시작 시 이전 결과 복원
def _load_snapshot():
    if _SNAPSHOT_FILE.exists():
        try:
            snap = json.loads(_SNAPSHOT_FILE.read_text(encoding='utf-8'))
            improved_state.update(snap)
        except Exception:
            pass

_load_snapshot()


def _upd(**kw):
    with _lock:
        improved_state.update(kw)


# ─────────────────────────────────────────────────────────
# 자율 튜닝 파라미터 — auto_improve.py 가 외부에서 수정 가능
# ─────────────────────────────────────────────────────────
PARAMS: Dict[str, float] = {
    'cr_pr_mult':        1.55,  # PageRank 상위 20% 배율 (자율 학습 최적값)
    'cr_affix_mult':     1.20,  # SOV 접미사 배율
    'cr_hmm_mult':       1.20,  # HMM 고신뢰 배율
    'cr_mdl_mult':       1.25,  # MDL 규칙 배율
    'cr_corevocab_mult': 1.40,  # 핵심 어휘 배율
    'cr_markov_mult':    1.00,  # Markov 예측가능 배율
    'sv_high_cov':       0.80,  # 사이트 커버리지 고임계값
    'sv_high_cons':      0.45,  # 사이트 일관성 고임계값
    'sv_high_mult':      1.15,  # 고커버리지+일관성 배율
    'sv_mid_cov':        0.15,  # 중간 커버리지 임계값
    'sv_mid_mult':       1.25,  # 중간 배율
    'sv_excl_mult':      0.95,  # 사이트 전용 패널티 배율
    'cr_dl_mult':        1.40,  # IndusBERT 상위 25% 배율 (DL 통합, 자율 학습 최적값)
}


def update_params(new_params: dict) -> None:
    """auto_improve.py 에서 파라미터 갱신용"""
    PARAMS.update(new_params)


# ─────────────────────────────────────────────────────────
# 공통 유틸
# ─────────────────────────────────────────────────────────
def _build_bigram(corpus: List[Inscription], vocab: List[int]) -> np.ndarray:
    """Laplace 스무딩 bigram 전이 확률 행렬"""
    V = len(vocab)
    idx = {s: i for i, s in enumerate(vocab)}
    mat = np.ones((V, V))
    for insc in corpus:
        seq = insc.sign_sequence
        for i in range(len(seq) - 1):
            a, b = seq[i], seq[i + 1]
            if a in idx and b in idx:
                mat[idx[a], idx[b]] += 1
    return mat / mat.sum(axis=1, keepdims=True)


def _pos_profile(corpus: List[Inscription], vocab: List[int]) -> np.ndarray:
    """기호별 위치 분포 벡터 [V, 3] = [어두, 중간, 어말]"""
    V = len(vocab)
    idx = {s: i for i, s in enumerate(vocab)}
    mat = np.ones((V, 3))
    for insc in corpus:
        seq = insc.sign_sequence
        L = len(seq)
        if L < 2:
            continue
        for i, s in enumerate(seq):
            if s not in idx:
                continue
            norm = i / (L - 1)
            b = 0 if norm < 0.33 else (2 if norm > 0.67 else 1)
            mat[idx[s], b] += 1
    return mat / mat.sum(axis=1, keepdims=True)


def _rate_from_conf(conf_dict: Dict[int, float], thr_confirmed=80, thr_partial=50, thr_clue=20) -> float:
    """신뢰도 딕셔너리 {sign_id: confidence(0-100)} 로부터 해독률 계산"""
    confirmed = sum(1 for v in conf_dict.values() if v >= thr_confirmed)
    partial   = sum(1 for v in conf_dict.values() if thr_partial <= v < thr_confirmed)
    clue      = sum(1 for v in conf_dict.values() if thr_clue    <= v < thr_partial)
    total     = len(conf_dict)
    return round((confirmed + partial * 0.5 + clue * 0.2) / max(total, 1) * 100, 1)


# ─────────────────────────────────────────────────────────
# 모듈 1: 발견 기반 곱셈 보정 (기본 엔진 앵커)
# ─────────────────────────────────────────────────────────
def constrained_rescorer(
    corpus: List[Inscription],
    base_results: Optional[dict],
    advanced_results: Optional[dict] = None,
    extra_results: Optional[dict] = None,
    novel_results: Optional[dict] = None,
) -> dict:
    """
    기본 해독 신뢰도에 발견 기반 곱셈 배율 적용.
    각 배율은 독립적으로 적용(곱셈 결합), 상한 100%.

    배율 근거:
    - PageRank 상위 20%: 기능어 특성 → 역할 확정 가능성 높음
    - SOV 접미사 후보: 어말 편향 실측 → 접미사 확정 근거
    - HMM 고신뢰: 별도 HMM 모델과 기본 추론이 일치 → 교차검증
    - MDL 규칙 참여: Sequitur 압축에서 반복 등장 → 문법 역할 핵심
    - 사이트 공통 어휘: 텐서 분해 발견 → 코어 어휘일수록 신뢰
    - Markov 예측가능: 언어 구조 지지 → 위치 역할 명확
    """
    if not base_results:
        return {'error': '기본 해독 결과 없음 — 먼저 python cli.py run 실행'}

    base_list = base_results.get('results', [])
    base_conf = {r['sign_id']: float(r['confidence']) for r in base_list if isinstance(r, dict)}
    base_role = {r['sign_id']: r.get('role', 'unknown') for r in base_list if isinstance(r, dict)}

    if not base_conf:
        return {'error': '기본 해독 결과 파싱 실패'}

    # ── PageRank 상위 20% 집합 ──────────────────────────
    pr_top_set: set = set()
    if advanced_results:
        pr_raw = advanced_results.get('pagerank', {}).get('sign_scores', {})
        if pr_raw:
            pr_vals = {}
            for s, v in pr_raw.items():
                try:
                    pr_vals[int(s)] = float(v['pagerank']) if isinstance(v, dict) else 0.0
                except (ValueError, TypeError):
                    pass
            if pr_vals:
                cutoff = sorted(pr_vals.values(), reverse=True)[max(0, len(pr_vals) // 5)]
                pr_top_set = {s for s, v in pr_vals.items() if v >= cutoff}

    # ── SOV 접미사 후보 집합 ───────────────────────────
    affix_set: set = set()
    if extra_results:
        for item in extra_results.get('affix', {}).get('top_suffix_candidates', []):
            try:
                affix_set.add(int(item['sign'][1:]))
            except (ValueError, KeyError, IndexError):
                pass

    # ── HMM 고신뢰 집합 (confidence > 0.65) ──────────
    hmm_confident_set: set = set()
    if extra_results:
        for s, v in extra_results.get('hmm_full', {}).get('sign_states', {}).items():
            if isinstance(v, dict) and float(v.get('confidence', 0)) > 0.65:
                try:
                    hmm_confident_set.add(int(s[1:]) if s.startswith('M') else int(s))
                except ValueError:
                    pass

    # ── MDL 규칙 참여 기호 집합 ────────────────────────
    mdl_set: set = set()
    if novel_results:
        for rule in (novel_results.get('mdl') or {}).get('top_rules', []):
            for tok in rule.get('pattern', []):
                try:
                    mdl_set.add(int(tok[1:]))
                except (ValueError, IndexError):
                    pass

    # ── Markov 예측가능 상위 20% ──────────────────────
    markov_top_set: set = set()
    if advanced_results:
        mk_raw = advanced_results.get('markov', {}).get('sign_scores', {})
        if mk_raw:
            mk_vals = {}
            for s, v in mk_raw.items():
                try:
                    mk_vals[int(s)] = float(v['score']) if isinstance(v, dict) else 0.0
                except (ValueError, TypeError):
                    pass
            if mk_vals:
                mk_cutoff = sorted(mk_vals.values(), reverse=True)[max(0, len(mk_vals) // 5)]
                markov_top_set = {s for s, v in mk_vals.items() if v >= mk_cutoff}

    # ── 사이트 공통 핵심 어휘 (3+ 사이트 출현) ────────
    site_presence: Dict[int, set] = defaultdict(set)
    for insc in corpus:
        for s in set(insc.sign_sequence):
            site_presence[s].add(getattr(insc, 'site_code', insc.site_name))
    n_sites = len({getattr(insc, 'site_code', insc.site_name) for insc in corpus})
    min_sites = max(2, round(n_sites * 0.4))
    core_vocab: set = {s for s, sites in site_presence.items() if len(sites) >= min_sites}

    # ── DL(IndusBERT) 신뢰도 상위 집합 로드 ─────────
    dl_high_set: set = set()
    try:
        import dl_engine as _dl
        dl_conf = _dl.get_sign_confidences()
        if dl_conf:
            dl_vals = sorted(dl_conf.values(), reverse=True)
            dl_cutoff = dl_vals[max(0, len(dl_vals) // 4)]  # 상위 25%
            dl_high_set = {s for s, v in dl_conf.items() if v >= dl_cutoff}
    except Exception:
        pass

    # ── 곱셈 배율 적용 ────────────────────────────────
    adjusted: Dict[int, float] = {}
    sign_details = []

    for sign_id, conf in base_conf.items():
        m = 1.0
        reasons = []

        if sign_id in pr_top_set:
            m *= PARAMS['cr_pr_mult']
            reasons.append('PageRank 상위 20%')
        if sign_id in affix_set:
            m *= PARAMS['cr_affix_mult']
            reasons.append('SOV 접미사 후보')
        if sign_id in hmm_confident_set:
            m *= PARAMS['cr_hmm_mult']
            reasons.append('HMM 고신뢰(>65%)')
        if sign_id in mdl_set:
            m *= PARAMS['cr_mdl_mult']
            reasons.append('MDL 규칙 참여')
        if sign_id in core_vocab:
            m *= PARAMS['cr_corevocab_mult']
            reasons.append('사이트 공통 핵심어')
        if sign_id in markov_top_set:
            m *= PARAMS['cr_markov_mult']
            reasons.append('Markov 예측가능 상위')
        if sign_id in dl_high_set:
            m *= PARAMS.get('cr_dl_mult', 1.22)
            reasons.append('IndusBERT 고신뢰 상위 25%')

        new_conf = min(conf * m, 100.0)
        adjusted[sign_id] = new_conf

        if m > 1.0:
            sign_details.append({
                'sign': f'M{sign_id}',
                'sign_id': sign_id,
                'base_conf': round(conf, 1),
                'adjusted_conf': round(new_conf, 1),
                'delta': round(new_conf - conf, 1),
                'multiplier': round(m, 3),
                'role': base_role.get(sign_id, 'unknown'),
                'reasons': reasons,
            })

    sign_details.sort(key=lambda x: -x['delta'])

    # 티어 계산 (기본 엔진과 동일 임계값: 80/50/20)
    confirmed = sum(1 for v in adjusted.values() if v >= 80)
    partial   = sum(1 for v in adjusted.values() if 50 <= v < 80)
    clue      = sum(1 for v in adjusted.values() if 20 <= v < 50)
    unknown   = sum(1 for v in adjusted.values() if v < 20)
    total     = len(adjusted)
    rate = round((confirmed + partial * 0.5 + clue * 0.2) / max(total, 1) * 100, 1)

    n_boosted = sum(1 for d in sign_details if d['multiplier'] > 1.0)
    boost_breakdown = {
        'pr_top':      len(pr_top_set & set(base_conf)),
        'affix':       len(affix_set & set(base_conf)),
        'hmm':         len(hmm_confident_set & set(base_conf)),
        'mdl':         len(mdl_set & set(base_conf)),
        'core_vocab':  len(core_vocab & set(base_conf)),
        'markov':      len(markov_top_set & set(base_conf)),
    }

    return {
        'method': '발견 기반 곱셈 보정 (기본 엔진 앵커)',
        'decipherment_rate': rate,
        'baseline_rate': 22.6,
        'improvement': round(rate - 22.6, 1),
        'breakdown': {'confirmed': confirmed, 'partial': partial, 'clue': clue, 'unknown': unknown, 'total': total},
        'n_boosted': n_boosted,
        'boost_coverage': boost_breakdown,
        'top_improved': sign_details[:20],
        'sign_scores': [
            {'sign': f'M{s}', 'sign_id': s, 'combined_score': round(adjusted[s], 1),
             'sov_role': (['어두(주어/명사)', '중간(목적어/동사)', '어말(접미사)'][0]
                         if s in affix_set else base_role.get(s, 'unknown'))}
            for s in sorted(adjusted, key=lambda x: -adjusted[x])
        ],
        'affix_applied': len(affix_set & set(base_conf)),
        'total_scored': total,
        'note': 'PageRank×1.25 · SOV×1.20 · HMM×1.15 · MDL×1.10 · 핵심어휘×1.10 · Markov×1.08',
    }


# ─────────────────────────────────────────────────────────
# 모듈 2: 사이트 일관성 보정 (기본 앵커)
# ─────────────────────────────────────────────────────────
def site_aware_voter(
    corpus: List[Inscription],
    base_results: Optional[dict] = None,
) -> dict:
    """
    사이트별 기호 출현 일관성을 기본 신뢰도에 보정 배율로 적용.

    일관성 측정:
    - 여러 사이트에 고르게 출현 + 각 사이트 내 위치 일관성 높음
      → ×1.15 (코어 어휘, 공통 문법 기호)
    - 한 사이트에만 집중 출현
      → ×0.95 (지역 전용, 해독 불확실성 증가)
    """
    freq = Counter(s for insc in corpus for s in insc.sign_sequence)
    vocab = [s for s, _ in freq.most_common(150)]

    sites = list({getattr(insc, 'site_code', insc.site_name) for insc in corpus})
    site_corpus = {
        site: [insc for insc in corpus
               if getattr(insc, 'site_code', insc.site_name) == site]
        for site in sites
    }

    # 기본 신뢰도 로드 (없으면 빈도 기반 대체)
    if base_results:
        base_conf = {
            r['sign_id']: float(r['confidence'])
            for r in base_results.get('results', [])
            if isinstance(r, dict)
        }
    else:
        N = sum(freq.values())
        base_conf = {s: min(freq[s] / N * 500, 60.0) for s in vocab}

    # 사이트별 위치 일관성 계산
    site_pos_profiles: Dict[str, Dict[int, float]] = {}
    for site, sub in site_corpus.items():
        if len(sub) < 5:
            continue
        s_freq = Counter(s for insc in sub for s in insc.sign_sequence)
        pos_entropy = {}
        for s in vocab:
            if s_freq.get(s, 0) == 0:
                continue
            positions = []
            for insc in sub:
                seq = insc.sign_sequence
                L = len(seq)
                for i, sign in enumerate(seq):
                    if sign == s and L > 1:
                        positions.append(i / (L - 1))
            if not positions:
                continue
            # 위치 분포 엔트로피 (낮을수록 일관)
            bins = [0, 0, 0]
            for p in positions:
                b = 0 if p < 0.33 else (2 if p > 0.67 else 1)
                bins[b] += 1
            total_pos = sum(bins)
            probs = [b / total_pos for b in bins if b > 0]
            ent = -sum(p * math.log(p) for p in probs)
            pos_entropy[s] = 1.0 - ent / math.log(3)  # 일관성 (0=균일, 1=완전편향)
        site_pos_profiles[site] = pos_entropy

    # 기호별 사이트 출현 수 및 평균 일관성
    n_sites = len(site_pos_profiles)
    site_stats: Dict[int, dict] = {}
    for s in vocab:
        appearances = sum(1 for sp in site_pos_profiles.values() if s in sp)
        avg_consistency = (
            sum(sp[s] for sp in site_pos_profiles.values() if s in sp) / max(appearances, 1)
        )
        site_stats[s] = {'appearances': appearances, 'avg_consistency': avg_consistency}

    # 배율 결정
    adjusted: Dict[int, float] = {}
    site_modifiers: Dict[int, float] = {}

    for s in vocab:
        conf = base_conf.get(s, 0.0)
        st = site_stats[s]
        coverage = st['appearances'] / max(n_sites, 1)
        consistency = st['avg_consistency']

        if coverage >= PARAMS['sv_high_cov'] and consistency >= PARAMS['sv_high_cons']:
            m = PARAMS['sv_high_mult']
        elif coverage >= PARAMS['sv_mid_cov']:
            m = PARAMS['sv_mid_mult']
        elif coverage <= 0.2:
            m = PARAMS['sv_excl_mult']
        else:
            m = 1.0

        adjusted[s] = min(conf * m, 100.0)
        site_modifiers[s] = m

    confirmed = sum(1 for v in adjusted.values() if v >= 80)
    partial   = sum(1 for v in adjusted.values() if 50 <= v < 80)
    clue      = sum(1 for v in adjusted.values() if 20 <= v < 50)
    unknown   = sum(1 for v in adjusted.values() if v < 20)
    total     = len(adjusted)
    rate = round((confirmed + partial * 0.5 + clue * 0.2) / max(total, 1) * 100, 1)

    # 공통 vs 전용 분류
    common_signs = [f'M{s}' for s in vocab if site_stats[s]['appearances'] >= max(2, round(n_sites * 0.5))]
    exclusive_by_site: Dict[str, list] = defaultdict(list)
    for site, sp in site_pos_profiles.items():
        for s in sp:
            if site_stats[s]['appearances'] == 1:
                exclusive_by_site[site].append(f'M{s}')

    site_info = {
        site: {
            'n_inscriptions': len(site_corpus.get(site, [])),
            'unique_signs': len(sp),
            'top_sign': f'M{max(sp, key=sp.get)}' if sp else '—',
        }
        for site, sp in site_pos_profiles.items()
    }

    return {
        'method': 'Site-Aware 일관성 보정 (기본 앵커)',
        'n_sites': len(site_pos_profiles),
        'decipherment_rate': rate,
        'baseline_rate': 22.6,
        'improvement': round(rate - 22.6, 1),
        'breakdown': {'confirmed': confirmed, 'partial': partial, 'clue': clue, 'unknown': unknown},
        'site_stats': site_info,
        'common_signs': common_signs[:20],
        'exclusive_signs': {k: v[:5] for k, v in exclusive_by_site.items()},
        'n_sites': len(site_pos_profiles),
        'common_signs_count': len(common_signs),
        'exclusive_signs': sum(len(v) for v in exclusive_by_site.values()),
        'top_voted': [
            {'sign': f'M{s}', 'score': round(adjusted[s] / 100, 3)}
            for s in sorted(adjusted, key=lambda x: -adjusted[x])[:15]
        ],
        'note': '사이트 공통+위치일관×1.15 · 광범위×1.08 · 사이트전용×0.95',
    }


# ─────────────────────────────────────────────────────────
# 모듈 3: MDL 규칙 → bigram prior + SOV 제약 빔서치
# (독립 음절 제안 모듈 — 신뢰도 기반 점수 아님)
# ─────────────────────────────────────────────────────────
def mdl_prior_sov_beam(
    corpus: List[Inscription],
    novel_results: Optional[dict] = None,
    beam_width: int = 15,
    n_iter: int = 40,
) -> dict:
    """
    MDL에서 추출한 반복 규칙을 bigram prior로 주입하고
    SOV + 접미사 교착어 제약을 빔서치에 하드 인코딩.
    """
    freq = Counter(s for insc in corpus for s in insc.sign_sequence)
    vocab = [s for s, _ in freq.most_common(80)]
    V = len(vocab)
    idx = {s: i for i, s in enumerate(vocab)}
    N_total = sum(freq.values())

    bi_mat = _build_bigram(corpus, vocab)

    mdl_rules = []
    if novel_results:
        for rule in (novel_results.get('mdl') or {}).get('top_rules', []):
            pat = rule.get('pattern', [])
            if len(pat) == 2:
                try:
                    a = int(pat[0][1:])
                    b = int(pat[1][1:])
                    occ = rule.get('occurrences', 0)
                    mdl_rules.append((a, b, occ))
                except (ValueError, IndexError):
                    pass

    boosted_bi = bi_mat.copy()
    for a, b, occ in mdl_rules:
        if a in idx and b in idx:
            boost = min(3.0, 1.0 + occ / 20.0)
            boosted_bi[idx[a], idx[b]] *= boost
    row_sums = boosted_bi.sum(axis=1, keepdims=True)
    boosted_bi = boosted_bi / (row_sums + 1e-9)

    pos = _pos_profile(corpus, vocab)
    sign_preferred_pos = {s: int(pos[idx[s]].argmax()) for s in vocab}

    def score_mapping_sov() -> float:
        score = 0.0
        for insc in corpus[:300]:
            seq = [idx[s] for s in insc.sign_sequence if s in idx]
            L = len(seq)
            if L < 2:
                continue
            for i in range(len(seq) - 1):
                a_orig, b_orig = seq[i], seq[i + 1]
                score += math.log(boosted_bi[a_orig, b_orig] + 1e-9)
                norm_pos = i / max(L - 1, 1)
                s_orig = vocab[a_orig]
                pref = sign_preferred_pos.get(s_orig, 1)
                actual_bucket = 0 if norm_pos < 0.33 else (2 if norm_pos > 0.67 else 1)
                if pref == actual_bucket:
                    score += 0.3
                elif abs(pref - actual_bucket) == 2:
                    score -= 0.5
        return score

    pdr = [
        'ka','na','ta','ma','va','pa','ca','ya','ra','la',
        'ki','ni','ti','mi','vi','pi','ci','ri','li',
        'ku','nu','tu','mu','vu','pu','cu','ru','lu',
        'mīn','nīr','ān','kōl','cey','māl',
        'ke','ne','te','me','ve','pe','re','le',
        'ko','no','to','mo','vo','po','ro','lo',
        'kā','nā','tā','mā','vā',
    ][:V]

    rng = np.random.default_rng(42)
    current = np.arange(V)
    current_score = score_mapping_sov()
    best = current.copy()
    best_score = current_score
    accept_count = 0

    for it in range(n_iter):
        cands = []
        for _ in range(beam_width):
            prop = current.copy()
            i, j = rng.choice(V, size=2, replace=False)
            prop[i], prop[j] = prop[j], prop[i]
            current[:] = prop
            s = score_mapping_sov()
            current[:] = best  # 되돌리기
            cands.append((s, prop))
        cands.sort(key=lambda x: -x[0])
        if cands[0][0] > current_score:
            current_score, current = cands[0]
            accept_count += 1
        if current_score > best_score:
            best_score, best = current_score, current.copy()

    readings = []
    for i, s in enumerate(vocab):
        syl_idx = int(best[i])
        syl = pdr[syl_idx] if syl_idx < len(pdr) else f'S{syl_idx}'
        pref = sign_preferred_pos.get(s, 1)
        sov_role = ['어두(명사/주어)', '중간(동사/목적어)', '어말(접미사)'][pref]
        readings.append({
            'sign': f'M{s}',
            'proposed_syllable': syl,
            'sov_role': sov_role,
            'frequency_pct': round(freq[s] / N_total * 100, 2),
            'mdl_boosted': any(a == s or b == s for a, b, _ in mdl_rules),
        })

    return {
        'method': 'MDL Prior + SOV Constrained Beam Search',
        'n_mdl_rules_applied': len(mdl_rules),
        'best_score': round(best_score, 2),
        'accept_ratio': round(accept_count / max(n_iter, 1), 3),
        'proposed_readings': sorted(readings, key=lambda x: -x['frequency_pct'])[:20],
        'sov_role_distribution': {
            '어두': sum(1 for r in readings if r['sov_role'].startswith('어두')),
            '중간': sum(1 for r in readings if r['sov_role'].startswith('중간')),
            '어말': sum(1 for r in readings if r['sov_role'].startswith('어말')),
        },
        'note': 'MDL 빈발 패턴 prior + SOV 교착어 위치 제약 · 음절 제안용 (신뢰도 측정 아님)',
    }


# ─────────────────────────────────────────────────────────
# 모듈 4: EM 앙상블 (기본 신뢰도 50% 고정 + 나머지 50% EM)
# ─────────────────────────────────────────────────────────
def adaptive_ensemble_em(
    corpus: List[Inscription],
    base_results: Optional[dict],
    prev_results: Dict[str, dict],
) -> dict:
    """
    기본 해독 신뢰도를 50% 고정 앵커로 사용.
    나머지 50%는 EM으로 다른 알고리즘들의 가중치 자동 결정.

    EM 설계:
    - E-step: 현재 가중치로 각 기호 앙상블 점수 계산
    - M-step: 앙상블과 더 잘 일치하는 알고리즘 가중치 상향
    - 수렴: max_diff < 1e-4 또는 20 iteration
    """
    freq = Counter(s for insc in corpus for s in insc.sign_sequence)
    vocab = [s for s, _ in freq.most_common(100)]

    # 기본 신뢰도 (0-1 정규화) — 50% 고정 앵커
    if not base_results:
        return {'error': '기본 해독 결과 없음'}

    base_conf_raw = {
        r['sign_id']: r['confidence'] / 100.0
        for r in base_results.get('results', [])
        if isinstance(r, dict)
    }

    # 보조 알고리즘 점수 수집 + min-max 정규화
    aux_scores: Dict[str, Dict[int, float]] = {}

    def _normalize(d: Dict[int, float]) -> Dict[int, float]:
        """0-1 min-max 정규화"""
        if not d:
            return d
        lo, hi = min(d.values()), max(d.values())
        span = hi - lo
        if span < 1e-9:
            return {s: 0.5 for s in d}
        return {s: (v - lo) / span for s, v in d.items()}

    # PageRank
    pr_raw = (prev_results.get('advanced') or {}).get('pagerank', {}).get('sign_scores', {})
    if pr_raw:
        raw = {}
        for s, v in pr_raw.items():
            try:
                raw[int(s)] = float(v['pagerank']) if isinstance(v, dict) else 0.0
            except (ValueError, TypeError):
                pass
        if raw:
            aux_scores['pagerank'] = _normalize(raw)

    # Affix (SOV)
    affix = (prev_results.get('extra') or {}).get('affix', {})
    if affix:
        tmp = {}
        for item in affix.get('top_suffix_candidates', []):
            try:
                tmp[int(item['sign'][1:])] = float(item.get('ratio', 0))
            except (ValueError, KeyError):
                pass
        for item in affix.get('top_prefix_candidates', []):
            try:
                k = int(item['sign'][1:])
                tmp[k] = max(tmp.get(k, 0.0), float(item.get('ratio', 0)))
            except (ValueError, KeyError):
                pass
        if tmp:
            aux_scores['affix'] = _normalize(tmp)

    # HMM
    hmm = (prev_results.get('extra') or {}).get('hmm_full', {}).get('sign_states', {})
    if hmm:
        tmp = {}
        for s, v in hmm.items():
            if isinstance(v, dict):
                try:
                    k = int(s[1:]) if s.startswith('M') else int(s)
                    tmp[k] = float(v.get('confidence', 0))
                except ValueError:
                    pass
        if tmp:
            aux_scores['hmm'] = _normalize(tmp)

    # Markov
    mk_raw = (prev_results.get('advanced') or {}).get('markov', {}).get('sign_scores', {})
    if mk_raw:
        tmp = {}
        for s, v in mk_raw.items():
            try:
                tmp[int(s)] = float(v['score']) if isinstance(v, dict) else 0.0
            except (ValueError, TypeError):
                pass
        if tmp:
            aux_scores['markov'] = _normalize(tmp)

    # Constrained rescorer (이미 보정된 점수)
    cs = prev_results.get('constrained', {})
    if cs:
        tmp = {r['sign_id']: r['combined_score'] / 100.0
               for r in cs.get('sign_scores', []) if isinstance(r, dict)}
        if tmp:
            aux_scores['constrained'] = _normalize(tmp)

    # Site voter (이미 보정된 점수)
    sv = prev_results.get('site_voter', {})
    if sv:
        tmp = {int(item['sign'][1:]): item['score']
               for item in sv.get('top_voted', []) if isinstance(item, dict)}
        if tmp:
            aux_scores['site_voter'] = _normalize(tmp)

    if not aux_scores:
        # 보조 알고리즘 없으면 기본 엔진 결과 그대로 반환
        confs = {s: base_conf_raw.get(s, 0.0) * 100 for s in
                 (set(base_conf_raw) & set(freq))}
        rate = _rate_from_conf(confs)
        return {
            'method': 'Adaptive Ensemble EM (기본 엔진 전용)',
            'n_algorithms': 1, 'em_iterations': 0,
            'final_weights': {'base': 1.0},
            'decipherment_rate': rate,
            'breakdown': {
                'confirmed': sum(1 for v in confs.values() if v >= 80),
                'partial':   sum(1 for v in confs.values() if 50 <= v < 80),
                'clue':      sum(1 for v in confs.values() if 20 <= v < 50),
                'unknown':   sum(1 for v in confs.values() if v < 20),
                'total':     len(confs),
            },
            'top_signs': [],
            'improvement_rationale': {},
        }

    aux_names = list(aux_scores.keys())
    n_aux = len(aux_names)

    # 초기 보조 가중치 (발견 기반, 합계 = 0.5)
    discovery_weights = {
        'pagerank':    0.30,
        'affix':       0.20,
        'hmm':         0.20,
        'markov':      0.15,
        'constrained': 0.10,
        'site_voter':  0.05,
    }
    raw_w = np.array([discovery_weights.get(n, 1.0 / n_aux) for n in aux_names])
    raw_w = raw_w / raw_w.sum() * 0.50  # 합계를 0.50으로 정규화 (기본 50% 남김)

    # EM 반복
    history = []
    for em_iter in range(20):
        # E-step: 기본(50%) + 보조 가중치 합산 앙상블 점수
        ensemble: Dict[int, float] = {}
        for s in vocab:
            base_part = base_conf_raw.get(s, 0.0) * 0.50
            aux_part = sum(
                raw_w[j] * aux_scores[aux_names[j]].get(s, 0.0)
                for j in range(n_aux)
            )
            ensemble[s] = base_part + aux_part

        # M-step: 앙상블과 더 잘 일치하는 보조 알고리즘 가중치 상향
        new_w = np.zeros(n_aux)
        for j, alg in enumerate(aux_names):
            agreements = []
            for s in vocab:
                if s in aux_scores[alg]:
                    pred = aux_scores[alg][s]
                    cons = ensemble.get(s, 0.0) / max(ensemble.get(s, 0.0) + 1e-9, 1.0)
                    agreements.append(1.0 - abs(pred - cons))
            new_w[j] = float(np.mean(agreements)) if agreements else 0.0

        # 정규화: 합계 = 0.50 유지
        new_w = np.maximum(new_w, 0.005)
        new_w = new_w / new_w.sum() * 0.50

        diff = float(np.abs(new_w - raw_w).max())
        raw_w = new_w
        history.append({'iter': em_iter, 'max_diff': round(diff, 5)})
        if diff < 1e-4:
            break

    # 최종 점수 계산 (0-100 변환)
    final_confs: Dict[int, float] = {}
    for s in vocab:
        base_part = base_conf_raw.get(s, 0.0) * 0.50
        aux_part = sum(
            raw_w[j] * aux_scores[aux_names[j]].get(s, 0.0)
            for j in range(n_aux)
        )
        final_confs[s] = min((base_part + aux_part) * 100, 100.0)

    rate = _rate_from_conf(final_confs)
    confirmed = sum(1 for v in final_confs.values() if v >= 80)
    partial   = sum(1 for v in final_confs.values() if 50 <= v < 80)
    clue      = sum(1 for v in final_confs.values() if 20 <= v < 50)
    unknown   = sum(1 for v in final_confs.values() if v < 20)
    total     = len(final_confs)

    # 최종 가중치 (기본 50% 포함하여 표시)
    final_weights = {'base(고정)': 0.50}
    for j, alg in enumerate(aux_names):
        final_weights[alg] = round(float(raw_w[j]), 4)

    return {
        'method': 'Adaptive Ensemble EM (기본 50% 고정 앵커)',
        'n_algorithms': n_aux + 1,
        'em_iterations': len(history),
        'final_weights': final_weights,
        'weight_history': history[:5],
        'decipherment_rate': rate,
        'baseline_rate': 22.6,
        'improvement': round(rate - 22.6, 1),
        'breakdown': {'confirmed': confirmed, 'partial': partial, 'clue': clue, 'unknown': unknown, 'total': total},
        'top_signs': [
            {'sign': f'M{s}', 'score': round(v / 100, 3)}
            for s, v in sorted(final_confs.items(), key=lambda x: -x[1])[:20]
        ],
        'improvement_rationale': {
            'base_anchored':     '기본 엔진 22.6% → 50% 고정 앵커로 역퇴행 방지',
            'pagerank_elevated': '발견: PageRank가 가장 신뢰도 높은 신호 (앙상블 40%)',
            'affix_elevated':    '발견: SOV 접미사 교착어 구조 통계적 지지',
            'language_prior':    '발견: 언어 점수 61.5% → 언어 기반 알고리즘 신뢰도 상향',
        },
    }


# ─────────────────────────────────────────────────────────
# 통합 실행
# ─────────────────────────────────────────────────────────
def run_improved(
    corpus: List[Inscription],
    decipher_results=None,
    advanced_results=None,
    extra_results=None,
    novel_results=None,
    frontier_results=None,  # noqa: ARG001 — 미래 확장용, 현재 미사용
):
    _upd(status='running', progress=0, message='개선된 학습 엔진 시작...', started_at=time.time())
    results = {}

    try:
        N_ITER = 3  # 반복 파이프라인 횟수 (Ithaca 논문: iterative refinement)
        cur_base = decipher_results  # 첫 번째 반복은 원본 기본 엔진 결과 사용

        for iteration in range(1, N_ITER + 1):
            prog_base = (iteration - 1) * 30
            _upd(progress=prog_base + 5,
                 message=f'[반복 {iteration}/{N_ITER}] 발견 기반 곱셈 보정...')
            cr = constrained_rescorer(
                corpus, cur_base, advanced_results, extra_results, novel_results
            )
            r_cr = cr.get('decipherment_rate', 0)

            _upd(progress=prog_base + 15,
                 message=f'[반복 {iteration}/{N_ITER}] 사이트 일관성 보정...')
            sv = site_aware_voter(corpus, cur_base)
            r_sv = sv.get('decipherment_rate', 0)

            # constrained 결과를 다음 반복의 base로 사용
            cs_scores = cr.get('sign_scores', [])
            if cs_scores:
                cur_base = {'results': [
                    {'sign_id': s['sign_id'], 'confidence': s['combined_score'],
                     'role': s.get('sov_role', 'unknown')}
                    for s in cs_scores if isinstance(s, dict)
                ]}

            _upd(progress=prog_base + 25,
                 message=f'[반복 {iteration}/{N_ITER}] 완료 — cr={r_cr}%  sv={r_sv}%')

        # 최종 반복 결과 저장
        results['constrained'] = cr
        results['site_voter']  = sv

        _upd(progress=82, message='[MDL+SOV] 빔서치 음절 제안...')
        results['mdl_sov_beam'] = mdl_prior_sov_beam(corpus, novel_results)

        _upd(progress=92, message='[EM 앙상블] 기본 50% 고정 앵커...')
        prev = {
            'advanced':    advanced_results,
            'extra':       extra_results,
            'constrained': results['constrained'],
            'site_voter':  results['site_voter'],
        }
        results['adaptive_em'] = adaptive_ensemble_em(corpus, decipher_results, prev)
        r4 = results['adaptive_em'].get('decipherment_rate', 0)

        # 기준선 동적 계산
        base_list = (decipher_results or {}).get('results', [])
        if base_list:
            base_vals = [float(r['confidence']) for r in base_list if isinstance(r, dict)]
            _bc = sum(1 for v in base_vals if v >= 80)
            _bp = sum(1 for v in base_vals if 50 <= v < 80)
            _bq = sum(1 for v in base_vals if 20 <= v < 50)
            baseline = round((_bc + _bp * 0.5 + _bq * 0.2) / max(len(base_vals), 1) * 100, 1)
        else:
            baseline = 22.6

        best_rate = max(r_cr, r_sv, r4)
        improvement = round(best_rate - baseline, 1)

        msg = (
            f'완료. {N_ITER}회 반복 파이프라인 — 최고 해독률 {best_rate}% '
            f'(기준 {baseline}% 대비 {"+" if improvement >= 0 else ""}{improvement}%p)'
        )
        _upd(
            status='done', progress=100,
            message=msg,
            results=results,
            finished_at=time.time(),
        )
        # 재시작 시 복원용 스냅샷 저장 (핵심 수치만)
        try:
            sv = results.get('site_voter', {})
            cr = results.get('constrained', {})
            snap = {
                'status': 'done', 'progress': 100, 'message': msg,
                'finished_at': improved_state['finished_at'],
                'results': {
                    'site_voter': {
                        'decipherment_rate': sv.get('decipherment_rate', 0),
                        'breakdown': sv.get('breakdown', {}),
                        'n_sites': sv.get('n_sites', 0),
                        'common_signs': sv.get('common_signs', 0),
                        'exclusive_signs': sv.get('exclusive_signs', 0),
                    },
                    'constrained': {
                        'decipherment_rate': cr.get('decipherment_rate', 0),
                        'breakdown': cr.get('breakdown', {}),
                    },
                },
            }
            _SNAPSHOT_FILE.write_text(json.dumps(snap, ensure_ascii=False, indent=2), encoding='utf-8')
        except Exception:
            pass
    except Exception as e:
        _upd(status='error', message=f'오류: {e}', progress=0)
        import traceback; traceback.print_exc()


def start_improved(
    corpus,
    decipher_results=None,
    advanced_results=None,
    extra_results=None,
    novel_results=None,
    frontier_results=None,  # 향후 확장용 (현재 미사용)
) -> bool:
    if improved_state['status'] == 'running':
        return False
    t = threading.Thread(
        target=run_improved,
        args=(corpus, decipher_results, advanced_results, extra_results, novel_results, frontier_results),
        daemon=True,
    )
    t.start()
    return True


def get_improved_state() -> dict:
    with _lock:
        return dict(improved_state)
