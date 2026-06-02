"""
유전 알고리즘 자율 학습 엔진

파라미터 공간을 진화 알고리즘으로 탐색:
  - Population: 20개 개체 (파라미터 세트)
  - Fitness   : site_aware_voter 해독률
  - Selection : 토너먼트 (k=3)
  - Crossover : 균일 교차 (50% 확률)
  - Mutation  : Gaussian 노이즈 (σ=0.05, p=0.15)
  - Elite     : 상위 2개 무조건 보존
"""
import json, math, random, time, threading, copy
from pathlib import Path
from typing import List, Dict, Tuple

import numpy as np
from corpus import Inscription
import improved_engine as imp
import discovery_algorithms as disc

STATUS_FILE = Path('genetic_status.json')

genetic_state = {
    'status': 'idle', 'generation': 0, 'total_generations': 0,
    'best_rate': 0.0, 'avg_rate': 0.0, 'worst_rate': 0.0,
    'best_params': {}, 'diversity': 0.0,
    'history': [], 'message': '',
}
_lock = threading.Lock()


def _upd(**kw):
    with _lock:
        genetic_state.update(kw)
    STATUS_FILE.write_text(json.dumps(genetic_state, ensure_ascii=False), encoding='utf-8')


# ── 파라미터 공간 (auto_improve.py 와 동일)
PARAM_SPACE = {
    'cr_pr_mult':        (1.00, 1.60, 0.05),
    'cr_affix_mult':     (1.00, 1.60, 0.05),
    'cr_hmm_mult':       (1.00, 1.50, 0.05),
    'cr_mdl_mult':       (1.00, 1.45, 0.05),
    'cr_corevocab_mult': (1.00, 1.45, 0.05),
    'cr_markov_mult':    (1.00, 1.40, 0.05),
    'sv_high_cov':       (0.25, 0.80, 0.05),
    'sv_high_cons':      (0.25, 0.80, 0.05),
    'sv_high_mult':      (1.00, 1.60, 0.05),
    'sv_mid_cov':        (0.15, 0.70, 0.05),
    'sv_mid_mult':       (1.00, 1.50, 0.05),
    'db_crf_mult':       (1.00, 1.50, 0.05),
    'db_msp_mult':       (1.00, 1.50, 0.05),
    'db_bsc_mult':       (1.00, 1.40, 0.05),
    'db_msp_thresh':     (0.20, 0.60, 0.05),
}


def _snap(v: float, lo: float, hi: float, step: float) -> float:
    """격자점으로 스냅"""
    snapped = round(round((v - lo) / step) * step + lo, 3)
    return float(np.clip(snapped, lo, hi))


def _random_individual() -> dict:
    ind = {}
    for k, (lo, hi, step) in PARAM_SPACE.items():
        n = round((hi - lo) / step)
        ind[k] = round(lo + random.randint(0, n) * step, 3)
    return ind


def _fast_rate(base_conf: dict, site_modifiers: dict, params: dict) -> float:
    """
    사전 계산된 base_conf 와 집합 정보를 재사용해 배율만 교체 → O(N) 빠른 fitness.
    site_modifiers: {sign_id: m} — params 독립적인 배율 컴포넌트
    """
    sv_high_mult = params.get('sv_high_mult', 1.15)
    sv_mid_mult  = params.get('sv_mid_mult',  1.08)
    sv_excl_mult = params.get('sv_excl_mult', 0.95)

    adjusted = {}
    for s, conf in base_conf.items():
        raw_m = site_modifiers.get(s, 1.0)
        # site_modifiers 내 값을 현재 params 배율로 스케일
        if raw_m >= 1.14:
            m = sv_high_mult
        elif raw_m >= 1.07:
            m = sv_mid_mult
        elif raw_m < 1.0:
            m = sv_excl_mult
        else:
            m = 1.0
        adjusted[s] = min(conf * m, 100.0)

    confirmed = sum(1 for v in adjusted.values() if v >= 80)
    partial   = sum(1 for v in adjusted.values() if 50 <= v < 80)
    clue      = sum(1 for v in adjusted.values() if 20 <= v < 50)
    total     = len(adjusted)
    return round((confirmed + partial * 0.5 + clue * 0.2) / max(total, 1) * 100, 2)


def _fitness(params: dict, base_conf: dict, site_modifiers: dict, **_) -> float:
    return _fast_rate(base_conf, site_modifiers, params)


def _tournament(pop_fitness: list, k: int = 3) -> int:
    candidates = random.sample(range(len(pop_fitness)), min(k, len(pop_fitness)))
    return max(candidates, key=lambda i: pop_fitness[i])


def _crossover(p1: dict, p2: dict) -> Tuple[dict, dict]:
    c1, c2 = {}, {}
    for k in p1:
        if random.random() < 0.5:
            c1[k], c2[k] = p1[k], p2[k]
        else:
            c1[k], c2[k] = p2[k], p1[k]
    return c1, c2


def _mutate(params: dict, sigma: float = 0.05, p: float = 0.15) -> dict:
    new_p = copy.copy(params)
    for k, (lo, hi, step) in PARAM_SPACE.items():
        if random.random() < p:
            new_val = params[k] + np.random.normal(0, sigma)
            new_p[k] = _snap(new_val, lo, hi, step)
    return new_p


def _diversity(population: list) -> float:
    """집단 다양성: 파라미터 표준편차 평균"""
    if len(population) < 2:
        return 0.0
    keys = list(PARAM_SPACE.keys())
    stds = []
    for k in keys:
        vals = [ind[k] for ind in population]
        stds.append(float(np.std(vals)))
    return round(float(np.mean(stds)), 4)


# ── 메인 루프 ─────────────────────────────────────────────
def run_genetic(
    corpus: List[Inscription],
    base_r: dict,
    n_generations: int = 100,
    pop_size: int = 20,
    n_elite: int = 2,
):
    _upd(status='running', generation=0, total_generations=n_generations,
         history=[], message=f'사전 계산 중...')

    # ── base_conf 와 site_modifiers 사전 계산 (fitness 평가마다 재계산 불필요)
    base_list = base_r.get('results', [])
    base_conf: Dict[int, float] = {
        r['sign_id']: float(r['confidence']) for r in base_list if isinstance(r, dict)
    }

    # site_aware_voter 와 동일한 로직으로 site_modifiers 한 번만 계산
    from collections import defaultdict as _dd
    site_corpus: Dict[str, list] = _dd(list)
    for insc in corpus:
        site_corpus[getattr(insc, 'site_code', insc.site_name)].append(insc)
    n_sites = max(len(site_corpus), 1)

    site_pos: Dict[str, Dict[int, float]] = {}
    for site, inscs in site_corpus.items():
        pos_ent: Dict[int, float] = {}
        sign_positions: Dict[int, list] = _dd(list)
        for insc in inscs:
            L = len(insc.sign_sequence)
            for i, s in enumerate(insc.sign_sequence):
                sign_positions[s].append(i / max(L - 1, 1))
        for s, positions in sign_positions.items():
            bins = [0, 0, 0]
            for p in positions:
                bins[0 if p < 0.33 else (2 if p > 0.67 else 1)] += 1
            tot = sum(bins)
            probs = [b / tot for b in bins if b > 0]
            ent = -sum(p * math.log(p) for p in probs if p > 0)
            pos_ent[s] = 1.0 - ent / math.log(3)
        site_pos[site] = pos_ent

    site_modifiers: Dict[int, float] = {}
    for s in base_conf:
        appearances = sum(1 for sp in site_pos.values() if s in sp)
        avg_cons    = sum(sp[s] for sp in site_pos.values() if s in sp) / max(appearances, 1)
        coverage    = appearances / n_sites
        if coverage >= 0.60 and avg_cons >= 0.50:
            site_modifiers[s] = 1.15
        elif coverage >= 0.40:
            site_modifiers[s] = 1.08
        elif coverage <= 0.20:
            site_modifiers[s] = 0.95
        else:
            site_modifiers[s] = 1.0

    # 초기 집단: 현재 최적값(imp+disc 합침) + 랜덤
    seed_params = {**imp.PARAMS, **disc.DISC_PARAMS}
    population = [copy.copy(seed_params)]
    population.extend([_random_individual() for _ in range(pop_size - 1)])

    best_rate     = 0.0
    best_params   = copy.copy(seed_params)
    history       = []
    _upd(message=f'초기 집단 {pop_size}개 준비 완료. 진화 시작...')

    try:
        for gen in range(1, n_generations + 1):
            t0 = time.time()

            # 적합도 평가 (O(N) 빠른 버전)
            fitness_vals = [_fitness(ind, base_conf, site_modifiers)
                            for ind in population]

            # 통계
            best_idx    = int(np.argmax(fitness_vals))
            gen_best    = fitness_vals[best_idx]
            gen_avg     = round(float(np.mean(fitness_vals)), 2)
            gen_worst   = round(float(np.min(fitness_vals)), 2)
            diversity   = _diversity(population)

            if gen_best > best_rate:
                best_rate   = gen_best
                best_params = copy.copy(population[best_idx])

            history.append({'gen': gen, 'best': gen_best, 'avg': gen_avg,
                            'worst': gen_worst, 'diversity': diversity})

            elapsed = round(time.time() - t0, 1)
            _upd(generation=gen, best_rate=best_rate, avg_rate=gen_avg,
                 worst_rate=gen_worst, best_params=best_params,
                 diversity=diversity, history=history[-80:],
                 message=f'Gen {gen}/{n_generations}  best={gen_best:.1f}%  avg={gen_avg:.1f}%  ({elapsed}s)')

            # 엘리트 보존
            sorted_idx = sorted(range(pop_size), key=lambda i: -fitness_vals[i])
            elites     = [copy.copy(population[i]) for i in sorted_idx[:n_elite]]

            # 다음 세대 생성
            new_pop = elites[:]
            while len(new_pop) < pop_size:
                i1 = _tournament(fitness_vals)
                i2 = _tournament(fitness_vals)
                c1, c2 = _crossover(population[i1], population[i2])
                c1 = _mutate(c1); c2 = _mutate(c2)
                new_pop.append(c1)
                if len(new_pop) < pop_size:
                    new_pop.append(c2)

            # 다양성 붕괴 시 이민 개체 추가
            if diversity < 0.01 and gen < n_generations - 10:
                for i in range(n_elite, min(n_elite + 4, pop_size)):
                    new_pop[i] = _random_individual()

            population = new_pop[:pop_size]

        # 최적 파라미터 복원
        imp.update_params(best_params)
        disc.update_disc_params(best_params)
        _upd(status='done', best_rate=best_rate, best_params=best_params,
             message=f'완료. 최고 해독률 {best_rate:.1f}%  ({n_generations} 세대)')
        Path('genetic_best_params.json').write_text(
            json.dumps({'best_rate': best_rate, 'params': best_params},
                       ensure_ascii=False, indent=2))

    except Exception as e:
        import traceback
        _upd(status='error', message=f'오류: {e}\n{traceback.format_exc()[:300]}')


def start_genetic(corpus, base_r, n_generations=100, pop_size=20) -> bool:
    if genetic_state['status'] == 'running':
        return False
    t = threading.Thread(
        target=run_genetic,
        args=(corpus, base_r, n_generations, pop_size),
        daemon=True,
    )
    t.start()
    return True


def get_genetic_state() -> dict:
    with _lock:
        return dict(genetic_state)
