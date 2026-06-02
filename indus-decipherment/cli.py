#!/usr/bin/env python3
"""
인더스 문자 해독 연구 CLI
사용법:
  python cli.py run          # 기본 해독 분석 실행
  python cli.py advanced     # 고급 알고리즘 6종 실행
  python cli.py all          # 전체 실행 (기본 + 고급)
  python cli.py status       # 현재 분석 상태 확인
  python cli.py train        # Word2Vec 임베딩 훈련

서버가 실행 중이어야 합니다:
  python -m uvicorn main:app --port 8000
"""
import sys
import time
import argparse
import urllib.request
import urllib.error
import json
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
log = logging.getLogger(__name__)

BASE = 'http://localhost:8000'


def _get(path: str) -> dict:
    req = urllib.request.Request(f'{BASE}{path}')
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode())


def _post(path: str) -> dict:
    req = urllib.request.Request(f'{BASE}{path}', data=b'', method='POST')
    req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f'HTTP {e.code}: {body}')


def _poll(status_path: str, label: str, interval: float = 1.0):
    """진행 상황 폴링 — 완료 또는 오류까지 대기"""
    last_msg = ''
    while True:
        s = _get(status_path)
        msg = s.get('message', '')
        prog = s.get('progress', 0)
        status = s.get('status', 'unknown')

        if msg != last_msg:
            log.info(f'[{prog:3d}%] {msg}')
            last_msg = msg

        if status == 'done':
            log.info(f'{label} 완료.')
            return True
        if status == 'error':
            log.error(f'{label} 오류 발생: {msg}')
            return False

        time.sleep(interval)


def cmd_status(_args):
    """현재 분석 상태 출력"""
    try:
        decipher = _get('/api/decipher/status')
        advanced = _get('/api/advanced/status')
        model    = _get('/api/models/status')
        corpus   = _get('/api/corpus/stats')
    except OSError:
        log.error('서버 연결 실패. `python -m uvicorn main:app --port 8000` 을 먼저 실행하세요.')
        sys.exit(1)

    print('\n─── 코퍼스 ──────────────────────────────')
    print(f'  비문 수: {corpus["total_inscriptions"]:,}  |  고유 기호: {corpus["unique_signs"]}')

    print('\n─── 기본 해독 엔진 ──────────────────────')
    print(f'  상태: {decipher["status"]}  |  진행: {decipher["progress"]}%')
    if decipher['status'] == 'done':
        print(f'  해독률: {decipher.get("decipherment_rate", "—")}%')

    print('\n─── 고급 알고리즘 ───────────────────────')
    print(f'  상태: {advanced["status"]}  |  진행: {advanced["progress"]}%')
    if advanced['status'] == 'done':
        print(f'  {advanced.get("message", "")}')

    print('\n─── Word2Vec 훈련 ───────────────────────')
    print(f'  상태: {model["status"]}  |  진행: {model["progress"]}%')
    if model['status'] == 'done':
        print(f'  에폭: {model["current_epoch"]}/{model["total_epochs"]}')
    print()


def cmd_run(_args):
    """기본 해독 분석 (6개 통계 방법 앙상블)"""
    log.info('=== 기본 해독 분석 시작 ===')
    try:
        result = _post('/api/decipher/run')
        log.info(f'시작됨: {result}')
    except RuntimeError as e:
        log.warning(f'시작 불가: {e}')
        return

    ok = _poll('/api/decipher/status', '기본 해독 분석')
    if ok:
        data = _get('/api/decipher/results')
        rate = data.get('decipherment_rate', 0)
        bd   = data.get('breakdown', {})
        log.info(f'\n실제 해독률: {rate}%')
        log.info(f'  확정: {bd.get("confirmed",0)}  |  부분: {bd.get("partial",0)}  |  단서: {bd.get("clue",0)}  |  미해독: {bd.get("unknown",0)}')


def cmd_advanced(_args):
    """고급 알고리즘 6종 실행 (Markov·PageRank·드라비다어·빔서치·알로그래프·당혹도)"""
    log.info('=== 고급 알고리즘 분석 시작 ===')
    try:
        result = _post('/api/advanced/run')
        log.info(f'시작됨: {result}')
    except RuntimeError as e:
        log.warning(f'시작 불가: {e}')
        return

    ok = _poll('/api/advanced/status', '고급 알고리즘')
    if ok:
        data = _get('/api/advanced/results')
        m = data.get('markov', {})
        p = data.get('pagerank', {})
        al = data.get('allograph', {})
        pp = data.get('perplexity', {})
        log.info(f'\n  Markov H1: {m.get("h1")} bits  (Rao 2009: 2.73)')
        log.info(f'  PageRank 노드: {p.get("total_nodes")}  엣지: {p.get("total_edges")}')
        log.info(f'  알로그래프 쌍: {len(al.get("pairs", []))}')
        log.info(f'  바이그램 당혹도: {pp.get("perplexity")}')


def cmd_train(args):
    """Word2Vec 임베딩 훈련"""
    epochs = getattr(args, 'epochs', 80)
    log.info(f'=== Word2Vec 훈련 시작 ({epochs} 에폭) ===')
    try:
        req = urllib.request.Request(
            f'{BASE}/api/models/train?epochs={epochs}',
            data=b'', method='POST'
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            result = json.loads(r.read().decode())
        log.info(f'시작됨: {result}')
    except urllib.error.HTTPError as e:
        log.warning(f'시작 불가: {e.read().decode()}')
        return

    _poll('/api/models/status', f'Word2Vec 훈련 ({epochs} 에폭)')


def cmd_extra(_args):
    """추가 알고리즘 6종 (LDA·Zipf·고차 n-gram·압축률·HMM·접사분석)"""
    log.info('=== 추가 알고리즘 분석 시작 ===')
    try:
        result = _post('/api/extra/run')
        log.info(f'시작됨: {result}')
    except RuntimeError as e:
        log.warning(f'시작 불가: {e}')
        return

    ok = _poll('/api/extra/status', '추가 알고리즘')
    if ok:
        data = _get('/api/extra/results')
        lda  = data.get('lda', {})
        zipf = data.get('zipf', {})
        ngram = data.get('ngram_high', {})
        comp = data.get('compression', {})
        hmm  = data.get('hmm_full', {})
        affix = data.get('affix', {})
        log.info(f'\n  LDA 토픽 수: {lda.get("n_topics")}')
        log.info(f'  Zipf s={zipf.get("zipf_s")}  R²={zipf.get("zipf_r2")}  ({zipf.get("interpretation","")})')
        log.info(f'  H3={ngram.get("h3")}  H4={ngram.get("h4")} bits')
        log.info(f'  압축률: {comp.get("compression_ratio")}  구조 점수: {comp.get("structure_score")}%')
        log.info(f'  HMM: {"활성 (" + str(hmm.get("n_states")) + " 상태)" if hmm.get("available") else "비활성"}')
        log.info(f'  접사 비대칭: {affix.get("asymmetry_index")}  ({affix.get("interpretation","")})')


def cmd_novel(_args):
    """신규 알고리즘 6종 + 앙상블 (PMI SVD·NMF·KL발산·스펙트럴·MCMC·MDL)"""
    log.info('=== 신규 알고리즘 분석 시작 ===')
    try:
        result = _post('/api/novel/run')
        log.info(f'시작됨: {result}')
    except RuntimeError as e:
        log.warning(f'시작 불가: {e}')
        return

    ok = _poll('/api/novel/status', '신규 알고리즘', interval=1.5)
    if ok:
        data = _get('/api/novel/results')
        ens  = data.get('ensemble', {})
        kl   = data.get('kl_compare', {})
        mcmc = data.get('mcmc', {})
        mdl  = data.get('mdl', {})
        spec = data.get('spectral', {})
        log.info(f'\n  앙상블 통합 해독률: {ens.get("ensemble_rate")}%')
        log.info(f'  가장 유사한 고대 문자: {kl.get("closest_script")}')
        log.info(f'  MCMC 최적 로그우도: {mcmc.get("best_log_likelihood")}  수렴: {mcmc.get("convergence")}')
        log.info(f'  MDL 추출 규칙 수: {mdl.get("n_rules_extracted")}  압축률: {mdl.get("compression_ratio")}')
        log.info(f'  스펙트럴 클러스터: {spec.get("n_clusters_found")}개')
        log.info(f'\n  알고리즘별 가중치:')
        for m, w in sorted(ens.get('algorithm_weights', {}).items(), key=lambda x: -x[1]):
            log.info(f'    {m:20s}: {w:.4f}')


def cmd_frontier(_args):
    """프론티어 알고리즘 6종 (언어/비언어검증·행정토큰·텐서분해·패러다임대립·Transformer·아이코노그래피)"""
    log.info('=== 프론티어 알고리즘 시작 ===')
    try:
        result = _post('/api/frontier/run')
        log.info(f'시작됨: {result}')
    except RuntimeError as e:
        log.warning(f'시작 불가: {e}')
        return

    ok = _poll('/api/frontier/status', '프론티어 알고리즘', interval=1.5)
    if ok:
        data = _get('/api/frontier/results')
        lt   = data.get('language_test', {})
        at   = data.get('admin_token', {})
        td   = data.get('tensor', {})
        pa   = data.get('paradigm', {})
        ico  = data.get('iconography', {})
        log.info(f'\n  언어 점수: {lt.get("language_score")}% — {lt.get("verdict")}')
        log.info(f'  Hapax 비율: {lt.get("metrics", {}).get("hapax_ratio")}  TTR: {lt.get("metrics", {}).get("ttr")}')
        log.info(f'  행정 토큰 적합도: {at.get("tripart_fit_score")}%  사이트 다양성: {at.get("site_diversity","")}')
        log.info(f'  텐서 재구성 오차: {td.get("reconstruction_error")}  rank={td.get("rank")}')
        log.info(f'  패러다임 대립 쌍: {pa.get("opposition_pairs_found")}개')
        log.info(f'  아이코노그래피 표어문자 점수: {ico.get("logographic_score")}% — {ico.get("script_type_hypothesis","")}')


def cmd_discovery(_args):
    """발견 알고리즘 3종 (CRF · Masked Sign Prediction · Bayesian 치환 암호)"""
    log.info('=== 발견 알고리즘 시작 ===')
    try:
        result = _post('/api/discovery/run')
        log.info(f'시작됨: {result}')
    except RuntimeError as e:
        log.warning(f'시작 불가: {e}')
        return

    ok = _poll('/api/discovery/status', '발견 알고리즘', interval=1.5)
    if ok:
        data = _get('/api/discovery/results')
        crf  = data.get('crf', {})
        msp  = data.get('msp', {})
        bsc  = data.get('bsc', {})
        bst  = data.get('boosted', {})
        log.info(f'\n  CRF 해독률: {crf.get("decipherment_rate")}%  (고신뢰 기호: {len(crf.get("high_conf_signs", []))}개)')
        log.info(f'  MSP 해독률: {msp.get("decipherment_rate")}%  (문법 앵커: {len(msp.get("grammar_anchors", []))}개)')
        log.info(f'  BSC Zipf 보존률: {bsc.get("zipf_preservation")}  mīn-nīr 발견: {bsc.get("fish_water_hypothesis", {}).get("count", 0)}개')
        log.info(f'  통합 보정 해독률: {bst.get("decipherment_rate")}%  (기준 22.6% 대비 {bst.get("improvement", 0):+.1f}%p)')


def cmd_improved(_args):
    """개선된 엔진 (발견 기반 복합 점수 + 사이트 투표 + MDL SOV 빔서치 + EM 앙상블)"""
    log.info('=== 개선된 학습 엔진 시작 ===')
    try:
        result = _post('/api/improved/run')
        log.info(f'시작됨: {result}')
    except RuntimeError as e:
        log.warning(f'시작 불가: {e}')
        return

    ok = _poll('/api/improved/status', '개선된 엔진', interval=1.5)
    if ok:
        data = _get('/api/improved/results')
        em = data.get('adaptive_em', {})
        cs = data.get('constrained', {})
        sv = data.get('site_voter', {})
        log.info(f'\n  EM 앙상블 해독률: {em.get("decipherment_rate")}%  (기준 22.6%)')
        log.info(f'  발견 기반 복합 점수 해독률: {cs.get("decipherment_rate")}%')
        log.info(f'  사이트별 투표 해독률: {sv.get("decipherment_rate")}%')
        log.info(f'  EM 반복 횟수: {em.get("em_iterations")}')
        log.info(f'  알고리즘별 최종 가중치:')
        for m, w in sorted(em.get('final_weights', {}).items(), key=lambda x: -x[1]):
            log.info(f'    {m:20s}: {w:.4f}')


def cmd_all(args):
    """전체 파이프라인 실행"""
    cmd_run(args)
    cmd_advanced(args)
    cmd_extra(args)
    cmd_novel(args)
    cmd_frontier(args)
    cmd_improved(args)
    cmd_discovery(args)


def main():
    parser = argparse.ArgumentParser(
        description='인더스 문자 해독 연구 CLI',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    sub = parser.add_subparsers(dest='cmd')

    sub.add_parser('run',      help='기본 해독 분석 (6개 통계 방법)')
    sub.add_parser('advanced', help='고급 알고리즘 6종 (Markov·PageRank·드라비다어·빔서치·알로그래프·당혹도)')
    sub.add_parser('extra',    help='추가 알고리즘 6종 (LDA·Zipf·고차 n-gram·압축률·HMM·접사분석)')
    sub.add_parser('novel',    help='신규 알고리즘 6종 + 앙상블 (PMI SVD·NMF·KL발산·스펙트럴·MCMC·MDL)')
    sub.add_parser('frontier', help='프론티어 6종 (언어/비언어·행정토큰·텐서분해·패러다임·Transformer·아이코노그래피)')
    sub.add_parser('improved',   help='개선된 엔진 (발견 기반 복합 점수 + 사이트 투표 + MDL SOV 빔서치 + EM 앙상블)')
    sub.add_parser('discovery',  help='발견 알고리즘 3종 (CRF · Masked Sign Prediction · Bayesian 치환 암호)')
    sub.add_parser('all',      help='전체 실행 (기본 + 고급 + 추가 + 신규 앙상블 + 프론티어 + 개선된 엔진)')
    sub.add_parser('status',   help='현재 상태 확인')
    p_train = sub.add_parser('train', help='Word2Vec 훈련')
    p_train.add_argument('--epochs', type=int, default=80, help='훈련 에폭 수 (기본 80)')

    args = parser.parse_args()

    dispatch = {
        'run':      cmd_run,
        'advanced': cmd_advanced,
        'extra':    cmd_extra,
        'novel':    cmd_novel,
        'frontier': cmd_frontier,
        'improved':   cmd_improved,
        'discovery':  cmd_discovery,
        'all':        cmd_all,
        'status':   cmd_status,
        'train':    cmd_train,
    }

    if args.cmd not in dispatch:
        parser.print_help()
        sys.exit(0)

    dispatch[args.cmd](args)


if __name__ == '__main__':
    main()
