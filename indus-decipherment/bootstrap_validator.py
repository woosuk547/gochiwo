"""
인더스 문자 통계 유의성 검증 모듈
Bootstrap 신뢰구간 + Permutation test

결과가 우연인지 아닌지 정량화 → 논문 게재 가능한 p-value 제공
"""
import math
import random
from collections import Counter


def _entropy(counter: Counter) -> float:
    total = sum(counter.values())
    if total == 0:
        return 0.0
    return -sum((c / total) * math.log2(c / total) for c in counter.values() if c > 0)


def _norm_slots(corpus) -> dict:
    slots = {i: Counter() for i in range(5)}
    for insc in corpus:
        seq = insc.sign_sequence
        L = len(seq)
        if L == 0:
            continue
        for i, s in enumerate(seq):
            slot = min(4, int(i / max(L - 1, 1) * 4.0))
            slots[slot][s] += 1
    return slots


def _grammar_evidence(corpus) -> float:
    """어두-중위 엔트로피 차이 (문법 슬롯 지표)"""
    slots = _norm_slots(corpus)
    all_signs = {s for insc in corpus for s in insc.sign_sequence}
    max_ent = math.log2(max(len(all_signs), 2))
    init_e = _entropy(slots[0])
    med_e  = _entropy(slots[2])
    return (med_e - init_e) / max(max_ent, 1)


def bootstrap_positional_entropy(corpus, n_bootstrap: int = 500, seed: int = 42) -> list:
    """
    비문을 500회 재샘플링하여 위치별 엔트로피 95% 신뢰구간 계산.
    CI가 좁을수록 패턴이 안정적으로 관찰됨을 의미.
    """
    rng = random.Random(seed)
    slot_ents = [[] for _ in range(5)]
    slot_names = ['INIT', 'Q2', 'MED', 'Q4', 'TERM']

    for _ in range(n_bootstrap):
        sample = rng.choices(corpus, k=len(corpus))
        slots = _norm_slots(sample)
        for i in range(5):
            slot_ents[i].append(_entropy(slots[i]))

    results = []
    for i in range(5):
        ents = sorted(slot_ents[i])
        n = len(ents)
        results.append({
            'slot': slot_names[i],
            'mean':  round(sum(ents) / n, 3),
            'ci_lo': round(ents[int(n * 0.025)], 3),
            'ci_hi': round(ents[int(n * 0.975)], 3),
            'stable': (ents[int(n * 0.975)] - ents[int(n * 0.025)]) < 0.5,
        })
    return results


def permutation_test_grammar(corpus, n_perm: int = 500, seed: int = 42) -> dict:
    """
    기호 순서를 n_perm회 무작위로 섞어서 grammar_slot_evidence 분포를 생성.
    p-value = 관측값 이상이 나오는 비율.
    p < 0.05 → 문법 슬롯 패턴이 통계적으로 유의함.
    """
    rng = random.Random(seed)
    observed = _grammar_evidence(corpus)

    class _Insc:
        def __init__(self, seq):
            self.sign_sequence = seq

    count_ge = 0
    for _ in range(n_perm):
        shuffled = []
        for insc in corpus:
            seq = list(insc.sign_sequence)
            rng.shuffle(seq)
            shuffled.append(_Insc(seq))
        if _grammar_evidence(shuffled) >= observed:
            count_ge += 1

    p_val = count_ge / n_perm
    return {
        'observed': round(observed, 4),
        'p_value':  round(p_val, 4),
        'n_perm':   n_perm,
        'significant': p_val < 0.05,
        'interpretation': (
            f'관측값 {observed:.4f} | p={p_val:.4f} (n={n_perm}) → '
            f'{"통계적으로 유의함 (**)" if p_val < 0.01 else "유의함 (*)" if p_val < 0.05 else "유의하지 않음"}'
        ),
    }


def permutation_test_pairs(corpus, pairs: list, n_perm: int = 200, seed: int = 42) -> list:
    """
    skipgram/대체클래스 유사 쌍 각각에 대해 permutation test.
    공출현 빈도가 우연보다 높은지 검증.
    """
    rng = random.Random(seed)
    vocab = list({s for insc in corpus for s in insc.sign_sequence})
    seqs  = [insc.sign_sequence for insc in corpus]

    def _cooccur(seq_list, a, b, window=2):
        count = 0
        for seq in seq_list:
            for i, s in enumerate(seq):
                if s == a:
                    nb = seq[max(0, i - window):i] + seq[i + 1:i + window + 1]
                    if b in nb:
                        count += 1
        return count

    results = []
    for pair in pairs[:12]:
        a_str = pair.get('sign_a') or pair.get('a', '')
        b_str = pair.get('sign_b') or pair.get('b', '')
        try:
            a_id = int(a_str.replace('P', ''))
            b_id = int(b_str.replace('P', ''))
        except (ValueError, AttributeError):
            continue

        obs = _cooccur(seqs, a_id, b_id)
        count_ge = sum(
            1 for _ in range(n_perm)
            if _cooccur(seqs, rng.choice(vocab), b_id) >= obs
        )
        p_val = count_ge / n_perm
        results.append({
            'pair': f'{a_str}↔{b_str}',
            'observed_cooccurrence': obs,
            'p_value': round(p_val, 4),
            'significant': p_val < 0.05,
        })
    return results


def run_all(corpus, discovery_results: dict = None) -> dict:
    """전체 통계 검증 실행. discovery_results는 /api/discovery-real/results 응답."""
    out = {
        'bootstrap_entropy':    bootstrap_positional_entropy(corpus),
        'permutation_grammar':  permutation_test_grammar(corpus),
        'pair_significance':    [],
    }

    if discovery_results:
        pairs = (discovery_results.get('methods', {})
                 .get('skipgram', {}).get('similar_pairs', []))
        if pairs:
            out['pair_significance'] = permutation_test_pairs(corpus, pairs)

    grammar_sig   = out['permutation_grammar']['significant']
    sig_pairs     = sum(1 for p in out['pair_significance'] if p['significant'])
    stable_slots  = sum(1 for s in out['bootstrap_entropy'] if s['stable'])

    out['overall'] = {
        'grammar_slot_significant': grammar_sig,
        'significant_pairs':        sig_pairs,
        'stable_entropy_slots':     stable_slots,
        'publish_ready':            grammar_sig and sig_pairs >= 3,
        'recommendation': (
            '논문 투고 가능 — 핵심 결과 통계적으로 유의함'
            if grammar_sig and sig_pairs >= 3
            else '추가 코퍼스 확보 필요 — 일부 결과만 유의함'
        ),
    }
    return out


# ── 비동기 실행 상태 ───────────────────────────────────────────
_state = {'status': 'idle', 'progress': 0, 'message': '', 'results': {}}


def start_validation(corpus, discovery_results=None) -> bool:
    import threading
    if _state['status'] == 'running':
        return False
    _state.update({'status': 'running', 'progress': 0, 'results': {}, 'message': '검증 시작...'})

    def _run():
        try:
            _state['message'] = 'Bootstrap 엔트로피 계산 중 (500회)...'
            _state['progress'] = 20
            r = run_all(corpus, discovery_results)
            _state.update({'status': 'done', 'progress': 100,
                           'message': f'완료. {r["overall"]["recommendation"]}',
                           'results': r})
        except Exception as e:
            import traceback
            _state.update({'status': 'error',
                           'message': f'오류: {e}\n{traceback.format_exc()[:200]}'})

    threading.Thread(target=_run, daemon=True).start()
    return True


def get_state() -> dict:
    return {k: v for k, v in _state.items() if k != 'results'}


def get_results() -> dict:
    return _state.get('results', {})
