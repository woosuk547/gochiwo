"""
음가 할당 일관성 점수 + 유전 알고리즘 최적화

음가 할당이 얼마나 "드라비다어처럼" 읽히는지 정량화.
3가지 필터로 점수를 매기고, 유전 알고리즘으로 최적 조합 탐색.

Filter 1: 위치 일관성 — 어두 기호가 접두사처럼, 어말이 접미사처럼 행동하는가
Filter 2: 공출현 일관성 — 같은 기능 기호끼리 서로 인접하는가
Filter 3: 형태소 경계 일관성 — 고빈도 기호 쌍이 안정적 패턴을 형성하는가
"""
import math
import random
from collections import Counter, defaultdict
from typing import Dict, List


# ── 드라비다어 형태론 기반 역할 기대값 ──────────────────────────
# phoneme_prefix: 어두에 기대되는 음가 패턴
# phoneme_suffix: 어말에 기대되는 음가 패턴
DRAVIDIAN_MORPHOLOGY = {
    'prefix_phonemes': {'a:ɳ', 'a:n', 'man'},      # 칭호/주격 접두사
    'suffix_phonemes': {'ve:l', 've:r', 'toʈi'},   # 씨족/소유격 접미사
    'numeral_phonemes':{'mi:n', 'kaɳ', 'oɳɽu',
                        'iraɳʈu', 'mu:ɳɽu'},        # 수량/회계
}


def _positional_consistency(assignments: Dict[int, str], corpus: List) -> float:
    """
    접두사 음가 → 실제로 어두에 많이 나타나는가?
    접미사 음가 → 실제로 어말에 많이 나타나는가?
    """
    if not corpus:
        return 0.5

    freq  = Counter(s for insc in corpus for s in insc.sign_sequence)
    init  = Counter(insc.sign_sequence[0]  for insc in corpus if insc.sign_sequence)
    term  = Counter(insc.sign_sequence[-1] for insc in corpus if insc.sign_sequence)

    score = 0.0
    n     = 0

    for sid, phoneme in assignments.items():
        f = freq.get(sid, 0)
        if f == 0:
            continue
        init_pct = init.get(sid, 0) / f
        term_pct = term.get(sid, 0) / f

        if phoneme in DRAVIDIAN_MORPHOLOGY['prefix_phonemes']:
            score += init_pct      # 어두에 많을수록 좋음
            n += 1
        elif phoneme in DRAVIDIAN_MORPHOLOGY['suffix_phonemes']:
            score += term_pct      # 어말에 많을수록 좋음
            n += 1

    return score / max(n, 1)


def _cooccurrence_consistency(assignments: Dict[int, str], corpus: List) -> float:
    """
    같은 기능군(수량/칭호/접미사) 기호끼리 공출현하는가?
    동일 음가를 가진 기호들이 같은 비문에 함께 나타나면 점수 올라감.
    """
    if not corpus:
        return 0.5

    phoneme_groups: Dict[str, List[int]] = defaultdict(list)
    for sid, ph in assignments.items():
        if ph != '?':
            phoneme_groups[ph].append(sid)

    score = 0.0
    n     = 0

    for ph, signs in phoneme_groups.items():
        if len(signs) < 2:
            continue
        cooccur = 0
        total   = 0
        for insc in corpus:
            seq = set(insc.sign_sequence)
            present = [s for s in signs if s in seq]
            if len(present) >= 2:
                cooccur += 1
            if any(s in seq for s in signs):
                total += 1
        if total > 0:
            score += cooccur / total
            n += 1

    return score / max(n, 1)


def _morpheme_boundary_consistency(assignments: Dict[int, str], corpus: List) -> float:
    """
    접두사 뒤에 어근, 어근 뒤에 접미사 순서가 지켜지는가?
    T(칭호) → U(어근?) → S(접미사) 패턴 비율 측정.
    """
    if not corpus:
        return 0.5

    prefix_signs = {s for s, p in assignments.items()
                    if p in DRAVIDIAN_MORPHOLOGY['prefix_phonemes']}
    suffix_signs = {s for s, p in assignments.items()
                    if p in DRAVIDIAN_MORPHOLOGY['suffix_phonemes']}

    correct = 0
    total   = 0

    for insc in corpus:
        seq = insc.sign_sequence
        if not seq:
            continue
        has_prefix = seq[0] in prefix_signs
        has_suffix = seq[-1] in suffix_signs
        total += 1
        if has_prefix or has_suffix:
            correct += 1

    return correct / max(total, 1)


def score_assignment(assignments: Dict[int, str], corpus: List) -> dict:
    """전체 일관성 점수 계산 (0~1, 높을수록 좋음)"""
    p = _positional_consistency(assignments, corpus)
    c = _cooccurrence_consistency(assignments, corpus)
    m = _morpheme_boundary_consistency(assignments, corpus)

    # 가중 평균: 위치(40%) + 공출현(30%) + 형태소(30%)
    total = p * 0.4 + c * 0.3 + m * 0.3

    return {
        'positional':   round(p, 4),
        'cooccurrence': round(c, 4),
        'morpheme':     round(m, 4),
        'total':        round(total, 4),
    }


# ── 유전 알고리즘 ──────────────────────────────────────────────

def _mutate(assignments: dict, rebus_map: dict, rate: float = 0.1,
            rng: random.Random = None) -> dict:
    """일부 기호의 음가를 후보 중 무작위 교체"""
    if rng is None:
        rng = random.Random()
    new = dict(assignments)
    for sid, ph in new.items():
        if rng.random() < rate:
            info = rebus_map.get(sid, {})
            candidates = info.get('candidates', [])
            if candidates and len(candidates) > 1:
                new[sid] = rng.choice(candidates)['phoneme']
    return new


def _crossover(a: dict, b: dict, rng: random.Random) -> dict:
    """두 할당을 교배해 새 할당 생성"""
    child = {}
    for sid in a:
        child[sid] = a[sid] if rng.random() < 0.5 else b.get(sid, a[sid])
    return child


def run_genetic(corpus: List, rebus_map: dict,
                n_gen: int = 80, pop_size: int = 30,
                seed: int = 42) -> dict:
    """
    유전 알고리즘으로 최적 음가 할당 탐색.
    초기 집단: rebus_map의 best candidate 할당.
    """
    rng = random.Random(seed)

    # 초기 집단 생성
    def _initial(rng_=None):
        asgn = {}
        for sid, info in rebus_map.items():
            candidates = info.get('candidates', [])
            if candidates:
                # 확정 기호는 고정
                if info.get('status') == 'confirmed':
                    asgn[sid] = info.get('phoneme', '?')
                else:
                    asgn[sid] = rng_.choice(candidates)['phoneme'] if rng_ else candidates[0]['phoneme']
            else:
                asgn[sid] = '?'
        return asgn

    population = [_initial(rng) for _ in range(pop_size)]
    best_score = -1.0
    best_asgn  = None
    history    = []

    for gen in range(n_gen):
        scored = [(score_assignment(ind, corpus)['total'], ind)
                  for ind in population]
        scored.sort(key=lambda x: -x[0])

        gen_best = scored[0][0]
        history.append(round(gen_best, 4))

        if gen_best > best_score:
            best_score = gen_best
            best_asgn  = scored[0][1].copy()

        # 상위 30% 선택 → 교배 + 변이
        elite_n   = max(2, pop_size // 3)
        elites    = [ind for _, ind in scored[:elite_n]]
        new_pop   = list(elites)

        while len(new_pop) < pop_size:
            p1, p2 = rng.choice(elites), rng.choice(elites)
            child  = _crossover(p1, p2, rng)
            child  = _mutate(child, rebus_map, rate=0.12, rng=rng)
            new_pop.append(child)

        population = new_pop

        _genetic_state['progress'] = int(gen / n_gen * 80) + 10
        _genetic_state['message']  = f'세대 {gen+1}/{n_gen} — 최고점수 {gen_best:.4f}'

    # 최종 점수 상세
    final_score = score_assignment(best_asgn, corpus)

    # 확정 기호는 원래 값으로 고정 (GA가 바꾸지 않도록)
    for sid, info in rebus_map.items():
        if info.get('status') == 'confirmed':
            best_asgn[sid] = info.get('phoneme', '?')

    return {
        'best_score':    final_score,
        'best_assignment': {f'P{sid:03d}': ph for sid, ph in best_asgn.items()},
        'history':       history,
        'n_generations': n_gen,
        'pop_size':      pop_size,
        'interpretation': (
            f'유전 알고리즘 {n_gen}세대 최적화 완료. '
            f'일관성 점수: {final_score["total"]:.4f} '
            f'(위치:{final_score["positional"]:.3f} / '
            f'공출현:{final_score["cooccurrence"]:.3f} / '
            f'형태소:{final_score["morpheme"]:.3f})'
        ),
    }


# ── 비동기 실행 ────────────────────────────────────────────────
_genetic_state = {'status': 'idle', 'progress': 0, 'message': '', 'results': {}}


def start_genetic(corpus: List, rebus_map: dict,
                  n_gen: int = 80, pop_size: int = 30) -> bool:
    import threading
    if _genetic_state['status'] == 'running':
        return False
    _genetic_state.update({'status': 'running', 'progress': 5,
                            'results': {}, 'message': '유전 알고리즘 초기화...'})

    def _run():
        try:
            result = run_genetic(corpus, rebus_map, n_gen, pop_size)
            _genetic_state.update({
                'status': 'done', 'progress': 100,
                'message': f'완료. 최적 일관성 점수: {result["best_score"]["total"]:.4f}',
                'results': result,
            })
        except Exception as e:
            import traceback
            _genetic_state.update({'status': 'error',
                                   'message': f'오류: {e}\n{traceback.format_exc()[:300]}'})

    threading.Thread(target=_run, daemon=True).start()
    return True


def get_state() -> dict:
    return {k: v for k, v in _genetic_state.items() if k != 'results'}


def get_results() -> dict:
    return _genetic_state.get('results', {})
