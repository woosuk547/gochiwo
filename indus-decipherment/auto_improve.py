"""
자율 반복 개선 루프
- coordinate descent 로 파라미터 공간 탐색
- 결과 분석 → 약점 파악 → 파라미터 조정 → 재실행
- Ctrl+C 로 종료, 최고 파라미터는 best_params.json 에 저장
- 웹 대시보드에서 진행 상황 확인: /api/auto-improve/status
"""
import json
import time
import random
from pathlib import Path
from typing import List, Optional

import corpus as corp
import decipherment_engine as de_mod
import advanced_decipherment as adv_mod
import extra_algorithms as extra_mod
import novel_algorithms as novel_mod
import improved_engine as imp
import discovery_algorithms as disc

BEST_PARAMS_FILE = Path('best_params.json')
STATUS_FILE      = Path('auto_improve_status.json')   # 웹 대시보드가 읽는 파일
LOG_FILE         = Path('auto_improve_log.jsonl')      # 라운드별 기록

MAX_ROUNDS   = 500
TARGET_RATE  = 92.0   # 이 해독률 달성 시 종료
PATIENCE     = 15     # 개선 없이 이 라운드 수 지나면 랜덤 재시작

# ── 탐색 파라미터 공간 정의: (하한, 상한, 탐색 단계)
PARAM_SPACE = {
    # constrained_rescorer 배율
    'cr_pr_mult':        (1.00, 1.60, 0.05),
    'cr_affix_mult':     (1.00, 1.60, 0.05),
    'cr_hmm_mult':       (1.00, 1.50, 0.05),
    'cr_mdl_mult':       (1.00, 1.45, 0.05),
    'cr_corevocab_mult': (1.00, 1.45, 0.05),
    'cr_markov_mult':    (1.00, 1.40, 0.05),
    # site_aware_voter 임계값/배율
    'sv_high_cov':       (0.25, 0.80, 0.05),
    'sv_high_cons':      (0.25, 0.80, 0.05),
    'sv_high_mult':      (1.00, 1.40, 0.05),
    'sv_mid_cov':        (0.15, 0.70, 0.05),
    'sv_mid_mult':       (1.00, 1.30, 0.05),
    # discovery_boosted_rescorer 배율/임계값
    'db_crf_mult':       (1.00, 1.50, 0.05),
    'db_msp_mult':       (1.00, 1.50, 0.05),
    'db_bsc_mult':       (1.00, 1.40, 0.05),
    'db_msp_thresh':     (0.20, 0.60, 0.05),
    # DL 통합 배율
    'cr_dl_mult':        (1.00, 1.50, 0.05),
}

# GA best_params.json 이 있으면 탐색 시작점을 GA+coord 합성값으로 설정
def _load_merged_seed() -> dict:
    """
    GA 최적(genetic_best_params.json)과 coord_descent 최적(best_params.json)을
    가중 평균해서 탐색 시작점 반환.
    GA 결과는 더 다양한 탐색이므로 sv 계열은 GA를, cr 계열은 coord 결과를 우선.
    """
    defaults = {**imp.PARAMS, **disc.DISC_PARAMS}
    ga_file   = Path('genetic_best_params.json')
    cd_file   = Path('best_params.json')
    ga_p = json.loads(ga_file.read_text())['params'] if ga_file.exists() else {}
    cd_p = json.loads(cd_file.read_text())['params'] if cd_file.exists() else {}
    merged = dict(defaults)
    for k in merged:
        # sv 계열: GA 채택 (더 높은 탐색 다양성)
        if k.startswith('sv_') and k in ga_p:
            merged[k] = ga_p[k]
        # cr 계열: coord_descent 채택 (세밀한 최적화)
        elif k.startswith('cr_') and k in cd_p:
            merged[k] = cd_p[k]
        # db 계열: 둘 중 높은 값
        elif k.startswith('db_') and k in ga_p and k in cd_p:
            merged[k] = max(ga_p[k], cd_p[k])
    return merged

# 파라미터를 변경할 때 어느 모듈 PARAMS에 적용할지 매핑
_IMP_KEYS  = {'cr_pr_mult', 'cr_affix_mult', 'cr_hmm_mult', 'cr_mdl_mult',
               'cr_corevocab_mult', 'cr_markov_mult', 'cr_dl_mult',
               'sv_high_cov', 'sv_high_cons', 'sv_high_mult',
               'sv_mid_cov', 'sv_mid_mult', 'sv_excl_mult'}
_DISC_KEYS = {'bsc_n_iter', 'bsc_n_restarts', 'db_crf_mult',
               'db_msp_mult', 'db_bsc_mult', 'db_msp_thresh'}


def _apply_params(params: dict) -> None:
    imp_p  = {k: v for k, v in params.items() if k in _IMP_KEYS}
    disc_p = {k: v for k, v in params.items() if k in _DISC_KEYS}
    if imp_p:
        imp.update_params(imp_p)
    if disc_p:
        disc.update_disc_params(disc_p)


def _current_params() -> dict:
    return {**imp.PARAMS, **disc.DISC_PARAMS}


def _save_status(status: dict) -> None:
    STATUS_FILE.write_text(json.dumps(status, ensure_ascii=False, indent=2))


def _log_round(entry: dict) -> None:
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(json.dumps(entry, ensure_ascii=False) + '\n')


def _rate_from_results(r: dict) -> float:
    return float(r.get('decipherment_rate', 0) or 0)


# ─────────────────────────────────────────────────────────
# 한 번의 평가: 반복 파이프라인(N_ITER=3)으로 현재 PARAMS 평가
# ─────────────────────────────────────────────────────────
N_ITER = 3  # improved_engine.run_improved 와 동일

def evaluate(corpus, base_r, adv_r, ext_r, nov_r,
             crf_cache: Optional[dict], msp_cache: Optional[dict]) -> dict:
    cur_base = base_r
    cr, sv = None, None

    # 반복 파이프라인: 결과를 다음 iteration의 base로 전달
    for _ in range(N_ITER):
        cr = imp.constrained_rescorer(corpus, cur_base, adv_r, ext_r, nov_r)
        sv = imp.site_aware_voter(corpus, cur_base)

        cs_scores = cr.get('sign_scores', [])
        if cs_scores:
            cur_base = {'results': [
                {'sign_id': s['sign_id'], 'confidence': s['combined_score'],
                 'role': s.get('sov_role', 'unknown')}
                for s in cs_scores if isinstance(s, dict)
            ]}

    cr_rate = _rate_from_results(cr)
    sv_rate = _rate_from_results(sv)

    # discovery boosted (3회 반복 후 최고 base 사용)
    boosted = disc.discovery_boosted_rescorer(
        corpus, cur_base, crf_cache, msp_cache, None
    ) if (crf_cache or msp_cache) else {'decipherment_rate': 0}
    boosted_rate = _rate_from_results(boosted)

    best = max(cr_rate, sv_rate, boosted_rate)
    return {
        'constrained': cr_rate,
        'site_voter':  sv_rate,
        'boosted':     boosted_rate,
        'best':        best,
        'cr_details':  cr,
        'sv_details':  sv,
    }


# ─────────────────────────────────────────────────────────
# 약점 분석: 어떤 파라미터를 조정해야 하는지 힌트 생성
# ─────────────────────────────────────────────────────────
def analyze_weakness(eval_result: dict, _params: dict) -> List[str]:
    hints = []
    cr = eval_result['constrained']
    sv = eval_result['site_voter']

    # site_voter가 constrained보다 훨씬 높으면 sv_high_mult를 올릴 여지
    if sv - cr > 5:
        hints.append('sv_high_mult')
        hints.append('sv_mid_mult')

    # constrained가 높으면 cr_* 배율 중 덜 활성화된 쪽을 올릴 여지
    cr_details = eval_result.get('cr_details', {})
    coverage = cr_details.get('boost_coverage', {})
    for key, cnt in coverage.items():
        if cnt == 0:
            mapping = {
                'pr_top': 'cr_pr_mult',
                'affix': 'cr_affix_mult',
                'hmm': 'cr_hmm_mult',
                'mdl': 'cr_mdl_mult',
                'core_vocab': 'cr_corevocab_mult',
                'markov': 'cr_markov_mult',
            }
            if key in mapping:
                hints.append(mapping[key])

    # 기본적으로 모든 파라미터 탐색 (hints가 비어있으면)
    if not hints:
        hints = list(PARAM_SPACE.keys())

    return list(dict.fromkeys(hints))  # 중복 제거


# ─────────────────────────────────────────────────────────
# coordinate descent 한 스텝: 지정 파라미터를 탐색해 최적값 반환
# ─────────────────────────────────────────────────────────
def search_param(key: str, corpus, base_r, adv_r, ext_r, nov_r,
                 crf_cache, msp_cache,
                 current_best_rate: float, current_params: dict) -> tuple:
    lo, hi, step = PARAM_SPACE[key]
    original = current_params[key]

    best_val  = original
    best_rate = current_best_rate

    # 단계값 후보: 현재값 ± 1~3 스텝
    candidates = set()
    for delta_steps in (-3, -2, -1, 1, 2, 3):
        v = round(original + delta_steps * step, 3)
        if lo <= v <= hi:
            candidates.add(v)

    for val in sorted(candidates):
        _apply_params({key: val})
        result = evaluate(corpus, base_r, adv_r, ext_r, nov_r, crf_cache, msp_cache)
        rate = result['best']
        if rate > best_rate + 0.05:  # 0.05%p 이상 개선 시만 채택
            best_rate = rate
            best_val  = val

    # 원복
    _apply_params({key: original})
    return best_val, best_rate


# ─────────────────────────────────────────────────────────
# 랜덤 재시작: 파라미터 공간에서 랜덤 샘플
# ─────────────────────────────────────────────────────────
def random_params() -> dict:
    params = {}
    for key, (lo, hi, step) in PARAM_SPACE.items():
        steps = round((hi - lo) / step)
        params[key] = round(lo + random.randint(0, steps) * step, 3)
    return params


# ─────────────────────────────────────────────────────────
# 메인 루프
# ─────────────────────────────────────────────────────────
def main():
    print('=== 자율 반복 개선 루프 시작 ===')
    print(f'목표 해독률: {TARGET_RATE}%  최대 라운드: {MAX_ROUNDS}')
    print('Ctrl+C 로 종료. 최고 파라미터는 best_params.json 에 자동 저장.\n')

    corpus = corp.generate_corpus(seed=42)
    print(f'코퍼스: {len(corpus)}개 비문 로드 완료')

    # ── 의존 결과 사전 계산 (캐시)
    print('기본 해독 엔진 실행 중...')
    de_mod.run_decipherment(corpus)
    de_state = de_mod.get_state()
    base_r = {'results': [v for v in de_state.get('results', {}).values()
                          if isinstance(v, dict)]}

    print('고급 알고리즘 실행 중...')
    adv_mod.run_advanced(corpus)
    adv_r = adv_mod.get_adv_state().get('results')

    print('추가 알고리즘 실행 중...')
    extra_mod.run_extra(corpus)
    ext_r = extra_mod.get_extra_state().get('results')

    print('신규 알고리즘 실행 중...')
    novel_mod.run_novel(corpus, {'results': [v for v in de_state.get('results', {}).values()
                                              if isinstance(v, dict)]}, adv_r, ext_r)
    nov_r = novel_mod.get_novel_state().get('results')

    # CRF / MSP 한 번 실행 후 캐시 (파라미터 비의존 모듈)
    print('CRF 시퀀스 레이블러 실행 중 (캐시)...')
    crf_cache = disc.crf_sign_labeler(corpus)
    print('MSP (Masked Sign Prediction) 실행 중 (캐시)...')
    msp_cache = disc.masked_sign_prediction(corpus)
    print(f'  CRF 기초율: {crf_cache.get("decipherment_rate")}%  '
          f'MSP 기초율: {msp_cache.get("decipherment_rate")}%\n')

    # ── GA + coord_descent 합성 파라미터로 시작점 설정
    merged_seed = _load_merged_seed()
    _apply_params(merged_seed)
    print(f'합성 시작점 적용 (GA+coord_descent 합성)\n')

    # ── 기준 평가
    baseline_eval = evaluate(corpus, base_r, adv_r, ext_r, nov_r, crf_cache, msp_cache)
    baseline_rate = baseline_eval['best']
    print(f'합성 기준 해독률: {baseline_rate}%  '
          f'(constrained={baseline_eval["constrained"]}%  '
          f'site_voter={baseline_eval["site_voter"]}%  '
          f'boosted={baseline_eval["boosted"]}%)\n')

    best_rate   = baseline_rate
    best_params = _current_params()
    no_improve_count = 0
    round_num = 0
    history: List[dict] = []

    _save_status({
        'status': 'running',
        'round': 0,
        'best_rate': best_rate,
        'baseline_rate': baseline_rate,
        'current_params': best_params,
        'history': [],
        'message': '기준 평가 완료. 탐색 시작.',
    })

    try:
        while round_num < MAX_ROUNDS and best_rate < TARGET_RATE:
            round_num += 1
            round_start = time.time()

            # 어떤 파라미터를 탐색할지 결정
            current_eval = evaluate(corpus, base_r, adv_r, ext_r, nov_r, crf_cache, msp_cache)
            hints = analyze_weakness(current_eval, _current_params())

            improved_this_round = False
            round_improvements = []

            # 힌트된 파라미터들에 대해 coordinate descent
            for key in hints:
                if key not in PARAM_SPACE:
                    continue
                cur_params = _current_params()
                new_val, new_rate = search_param(
                    key, corpus, base_r, adv_r, ext_r, nov_r,
                    crf_cache, msp_cache,
                    best_rate, cur_params
                )
                if new_val != cur_params[key]:
                    _apply_params({key: new_val})
                    best_rate = new_rate
                    best_params = _current_params()
                    improved_this_round = True
                    round_improvements.append(
                        f'{key}: {cur_params[key]:.3f} → {new_val:.3f} (+{new_rate - cur_params.get(key, 0):.1f}%p은 아님, rate={new_rate}%)'
                    )
                    no_improve_count = 0

            # 이 라운드에 개선 없으면 인내 카운터 증가
            if not improved_this_round:
                no_improve_count += 1

            elapsed = round(time.time() - round_start, 1)

            # 전체 파라미터 재평가
            final_eval = evaluate(corpus, base_r, adv_r, ext_r, nov_r, crf_cache, msp_cache)
            current_rate = final_eval['best']

            entry = {
                'round': round_num,
                'rate': current_rate,
                'best_rate': best_rate,
                'constrained': final_eval['constrained'],
                'site_voter':  final_eval['site_voter'],
                'boosted':     final_eval['boosted'],
                'improvements': round_improvements,
                'no_improve_count': no_improve_count,
                'elapsed_sec': elapsed,
            }
            history.append({'round': round_num, 'rate': current_rate, 'best_rate': best_rate})
            _log_round(entry)

            print(f'[R{round_num:03d}] rate={current_rate:.1f}%  best={best_rate:.1f}%  '
                  f'no_improve={no_improve_count}  ({elapsed}s)')
            if round_improvements:
                for msg in round_improvements:
                    print(f'       개선: {msg}')

            _save_status({
                'status': 'running',
                'round': round_num,
                'best_rate': best_rate,
                'baseline_rate': baseline_rate,
                'current_rate': current_rate,
                'current_params': _current_params(),
                'no_improve_count': no_improve_count,
                'history': history[-50:],  # 최근 50라운드만
                'message': f'R{round_num}: {current_rate:.1f}% (최고 {best_rate:.1f}%)',
            })

            # 최고 파라미터 저장
            if current_rate >= best_rate:
                best_rate = current_rate
                best_params = _current_params()
                BEST_PARAMS_FILE.write_text(
                    json.dumps({'best_rate': best_rate, 'params': best_params},
                               ensure_ascii=False, indent=2)
                )

            # 수렴 감지 → 랜덤 재시작
            if no_improve_count >= PATIENCE:
                print(f'\n  [{round_num}] {PATIENCE}라운드 연속 개선 없음 → 랜덤 재시작')
                rp = random_params()
                _apply_params(rp)
                restart_eval = evaluate(corpus, base_r, adv_r, ext_r, nov_r, crf_cache, msp_cache)
                restart_rate = restart_eval['best']
                print(f'  랜덤 재시작 rate={restart_rate:.1f}%')
                if restart_rate < best_rate:
                    # 랜덤이 더 낮으면 최고 파라미터 복원
                    _apply_params(best_params)
                    print(f'  최고 파라미터 복원 ({best_rate:.1f}%)')
                no_improve_count = 0

    except KeyboardInterrupt:
        print('\n\n[사용자 종료]')

    # ── 최종 결과
    print(f'\n=== 결과 ===')
    print(f'총 라운드: {round_num}')
    print(f'기준 해독률: {baseline_rate:.1f}%')
    print(f'최고 해독률: {best_rate:.1f}%  (개선: +{best_rate - baseline_rate:.1f}%p)')
    print(f'최고 파라미터 → {BEST_PARAMS_FILE}')

    _apply_params(best_params)
    final_eval = evaluate(corpus, base_r, adv_r, ext_r, nov_r, crf_cache, msp_cache)
    print(f'  constrained={final_eval["constrained"]}%  '
          f'site_voter={final_eval["site_voter"]}%  '
          f'boosted={final_eval["boosted"]}%')

    BEST_PARAMS_FILE.write_text(
        json.dumps({'best_rate': best_rate, 'params': best_params},
                   ensure_ascii=False, indent=2)
    )
    _save_status({
        'status': 'done',
        'round': round_num,
        'best_rate': best_rate,
        'baseline_rate': baseline_rate,
        'final_eval': final_eval,
        'best_params': best_params,
        'history': history,
        'message': f'완료. 최고 해독률 {best_rate:.1f}% (기준 {baseline_rate:.1f}% 대비 +{best_rate - baseline_rate:.1f}%p)',
    })
    return best_rate


if __name__ == '__main__':
    main()
