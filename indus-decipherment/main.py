"""
인더스 문자 해독 연구 플랫폼 — FastAPI 백엔드
http://localhost:8000 에서 대시보드 접근
"""
import json
import time
from pathlib import Path
from functools import lru_cache

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

import corpus as corp
import analysis as anal
import trainer as tr
import decipherment_engine as de
import advanced_decipherment as adv
import extra_algorithms as extra
import novel_algorithms as novel
import frontier_algorithms as frontier
import improved_engine as improved
import discovery_algorithms as disc
import dl_engine as dl
import genetic_engine as ga
from data_fetcher import fetch_real_corpus_raw, parse_mayig_format, get_real_frequency_data
import real_corpus_loader as rcl

app = FastAPI(title='인더스 문자 해독 연구', version='0.1.0')

# 캐싱: 코퍼스는 한 번만 생성
@lru_cache(maxsize=1)
def _get_corpus():
    return corp.generate_corpus(seed=42)


@lru_cache(maxsize=1)
def _get_real_corpus():
    # extended_corpus.json(2276개) 우선, 없으면 real_corpus.json(179개) fallback
    return rcl.load_extended_corpus()


# ─── 정적 파일 ───────────────────────────────────────────────
static_dir = Path(__file__).parent / 'static'
app.mount('/static', StaticFiles(directory=str(static_dir)), name='static')


@app.get('/', response_class=HTMLResponse)
def index():
    html_path = static_dir / 'index.html'
    return HTMLResponse(content=html_path.read_text(encoding='utf-8'))


# ─── 코퍼스 ──────────────────────────────────────────────────
@app.get('/api/corpus/stats')
def corpus_stats():
    c = _get_corpus()
    return corp.get_corpus_stats(c)


@app.get('/api/corpus/sample')
def corpus_sample(n: int = 20):
    c = _get_corpus()
    samples = c[:n]
    return {
        'inscriptions': [
            {
                'id': insc.id,
                'site': insc.site_name,
                'type': insc.object_type,
                'signs': [f'M{s}' for s in insc.sign_sequence],
                'length': insc.length,
            }
            for insc in samples
        ]
    }


# ─── 분석 ────────────────────────────────────────────────────
@app.get('/api/analysis/frequency')
def frequency(top_n: int = 50):
    c = _get_corpus()
    return anal.analyze_frequency(c, top_n=top_n)


@app.get('/api/analysis/positional')
def positional():
    c = _get_corpus()
    return anal.analyze_positional(c)


@app.get('/api/analysis/bigrams')
def bigrams(top_n: int = 40):
    c = _get_corpus()
    return anal.analyze_bigrams(c, top_n=top_n)


@app.get('/api/analysis/entropy')
def entropy():
    c = _get_corpus()
    return anal.analyze_entropy(c)


# ─── ML 훈련 ─────────────────────────────────────────────────
@app.post('/api/models/train')
def start_train(epochs: int = 80):
    if tr.training_state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 훈련 중입니다.')
    c = _get_corpus()
    sequences = [insc.sign_sequence for insc in c]
    started = tr.start_training(sequences, epochs=epochs)
    return {'started': started, 'epochs': epochs}


@app.post('/api/models/reset')
def reset_training():
    if tr.training_state['status'] == 'running':
        raise HTTPException(status_code=409, detail='훈련 중에는 리셋할 수 없습니다.')
    tr._update_state(
        status='idle', progress=0, current_epoch=0, total_epochs=0,
        loss_history=[], message='', embeddings_2d=[], clusters=[],
        top_similar={}, started_at=None, finished_at=None,
    )
    return {'reset': True}


@app.get('/api/models/status')
def model_status():
    state = tr.get_status()
    result = {k: v for k, v in state.items() if k not in ('embeddings_2d', 'clusters', 'top_similar')}
    if state['started_at']:
        elapsed = (state['finished_at'] or time.time()) - state['started_at']
        result['elapsed_seconds'] = round(elapsed, 1)
    return result


@app.get('/api/models/embeddings')
def embeddings():
    state = tr.get_status()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='아직 훈련이 완료되지 않았습니다.')
    return {
        'embeddings': state['embeddings_2d'],
        'clusters': state['clusters'],
        'top_similar': state['top_similar'],
        'total': len(state['embeddings_2d']),
    }


# ─── 해독 엔진 ───────────────────────────────────────────────
@app.post('/api/decipher/run')
def decipher_run():
    if de.engine_state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 분석 중입니다.')
    c = _get_corpus()
    started = de.start_decipherment(c)
    return {'started': started}


@app.get('/api/decipher/status')
def decipher_status():
    state = de.get_state()
    return {k: v for k, v in state.items() if k not in ('results',)}


@app.get('/api/decipher/results')
def decipher_results():
    state = de.get_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='분석이 완료되지 않았습니다.')
    return {
        'results': list(state['results'].values()),
        'decipherment_rate': state['decipherment_rate'],
        'breakdown': state['breakdown'],
        'method_stats': state['method_stats'],
        'repeated_phrases': state['repeated_phrases'],
    }


# ─── 고급 알고리즘 ──────────────────────────────────────────
@app.post('/api/advanced/run')
def advanced_run():
    if adv.adv_state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 고급 분석 중입니다.')
    c = _get_corpus()
    started = adv.start_advanced(c)
    return {'started': started}


@app.get('/api/advanced/status')
def advanced_status():
    state = adv.get_adv_state()
    return {k: v for k, v in state.items() if k != 'results'}


@app.get('/api/advanced/results')
def advanced_results():
    state = adv.get_adv_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='고급 분석이 완료되지 않았습니다.')
    return state['results']


# ─── 프론티어 알고리즘 ───────────────────────────────────────
@app.post('/api/frontier/run')
def frontier_run():
    if frontier.frontier_state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 실행 중입니다.')
    c = _get_corpus()
    started = frontier.start_frontier(c)
    return {'started': started}


@app.get('/api/frontier/status')
def frontier_status():
    state = frontier.get_frontier_state()
    return {k: v for k, v in state.items() if k != 'results'}


@app.get('/api/frontier/results')
def frontier_results():
    state = frontier.get_frontier_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='프론티어 분석이 완료되지 않았습니다.')
    return state['results']


# ─── 신규 알고리즘 (미시도) ──────────────────────────────────
@app.post('/api/novel/run')
def novel_run():
    if novel.novel_state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 실행 중입니다.')
    c = _get_corpus()
    # 이전 결과를 앙상블에 전달
    de_state = de.get_state()
    if de_state.get('status') == 'done':
        raw = de_state.get('results', {})
        # results는 {sign_id(int): result_dict} 형태
        decipher = {'results': [v for v in raw.values() if isinstance(v, dict)]}
    else:
        decipher = None
    advanced = adv.get_adv_state().get('results') if adv.adv_state['status'] == 'done' else None
    extra_r  = extra.get_extra_state().get('results') if extra.extra_state['status'] == 'done' else None
    started = novel.start_novel(c, decipher, advanced, extra_r)
    return {'started': started}


@app.get('/api/novel/status')
def novel_status():
    state = novel.get_novel_state()
    return {k: v for k, v in state.items() if k != 'results'}


@app.get('/api/novel/results')
def novel_results():
    state = novel.get_novel_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='신규 분석이 완료되지 않았습니다.')
    return state['results']


# ─── 추가 알고리즘 ──────────────────────────────────────────
@app.post('/api/extra/run')
def extra_run():
    if extra.extra_state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 실행 중입니다.')
    c = _get_corpus()
    started = extra.start_extra(c)
    return {'started': started}


@app.get('/api/extra/status')
def extra_status():
    state = extra.get_extra_state()
    return {k: v for k, v in state.items() if k != 'results'}


@app.get('/api/extra/results')
def extra_results():
    state = extra.get_extra_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='추가 분석이 완료되지 않았습니다.')
    return state['results']


# ─── 개선된 엔진 ─────────────────────────────────────────────
@app.post('/api/improved/run')
def improved_run():
    if improved.improved_state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 실행 중입니다.')
    c = _get_corpus()
    de_state = de.get_state()
    decipher = {'results': [v for v in de_state.get('results', {}).values() if isinstance(v, dict)]} if de_state.get('status') == 'done' else None
    advanced = adv.get_adv_state().get('results') if adv.adv_state['status'] == 'done' else None
    extra_r  = extra.get_extra_state().get('results') if extra.extra_state['status'] == 'done' else None
    novel_r  = novel.get_novel_state().get('results') if novel.novel_state['status'] == 'done' else None
    frontier_r = frontier.get_frontier_state().get('results') if frontier.frontier_state['status'] == 'done' else None
    started = improved.start_improved(c, decipher, advanced, extra_r, novel_r, frontier_r)
    return {'started': started}


@app.get('/api/improved/status')
def improved_status():
    state = improved.get_improved_state()
    return {k: v for k, v in state.items() if k != 'results'}


@app.get('/api/improved/results')
def improved_results():
    state = improved.get_improved_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='개선된 엔진 분석이 완료되지 않았습니다.')
    return state['results']


# ─── 발견 알고리즘 ───────────────────────────────────────────
@app.post('/api/discovery/run')
def discovery_run():
    if disc.discovery_state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 실행 중입니다.')
    c = _get_corpus()
    # 개선된 엔진 constrained 결과가 있으면 우선 사용 (더 높은 기준선)
    imp_state = improved.get_improved_state()
    if imp_state.get('status') == 'done':
        cs = (imp_state.get('results') or {}).get('constrained') or {}
        raw_scores = cs.get('sign_scores', [])
        if raw_scores:
            base = {'results': [
                {'sign_id': s['sign_id'], 'confidence': s['combined_score'],
                 'role': s.get('sov_role', 'unknown')}
                for s in raw_scores if isinstance(s, dict)
            ]}
        else:
            de_state = de.get_state()
            base = {'results': [v for v in de_state.get('results', {}).values() if isinstance(v, dict)]} if de_state.get('status') == 'done' else None
    else:
        de_state = de.get_state()
        base = {'results': [v for v in de_state.get('results', {}).values() if isinstance(v, dict)]} if de_state.get('status') == 'done' else None
    adv_r = adv.get_adv_state().get('results') if adv.adv_state['status'] == 'done' else None
    ext_r = extra.get_extra_state().get('results') if extra.extra_state['status'] == 'done' else None
    started = disc.start_discovery(c, base, adv_r, ext_r)
    return {'started': started}


@app.get('/api/discovery/status')
def discovery_status():
    state = disc.get_discovery_state()
    return {k: v for k, v in state.items() if k != 'results'}


@app.get('/api/discovery/results')
def discovery_results():
    state = disc.get_discovery_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='발견 알고리즘 분석이 완료되지 않았습니다.')
    return state['results']


# ─── 딥러닝 엔진 ─────────────────────────────────────────────
@app.post('/api/dl/run')
def dl_run(epochs: int = 80):
    if dl.dl_state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 학습 중입니다.')
    started = dl.start_dl(_get_corpus(), epochs=epochs)
    return {'started': started, 'epochs': epochs}


@app.get('/api/dl/status')
def dl_status():
    state = dl.get_dl_state()
    return {k: v for k, v in state.items() if k != 'history'}


@app.get('/api/dl/results')
def dl_results():
    state = dl.get_dl_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='딥러닝 학습이 완료되지 않았습니다.')
    return state


# ─── 유전 알고리즘 엔진 ──────────────────────────────────────
@app.post('/api/genetic/run')
def genetic_run(n_generations: int = 100, pop_size: int = 20):
    if ga.genetic_state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 실행 중입니다.')
    c = _get_corpus()
    de_state = de.get_state()
    base_r = {'results': [v for v in de_state.get('results', {}).values()
                          if isinstance(v, dict)]} if de_state.get('status') == 'done' else {'results': []}
    # CRF/MSP는 캐시 없이 None 전달 (GA는 constrained+site_voter 위주로 평가)
    started = ga.start_genetic(c, base_r, n_generations, pop_size)
    return {'started': started, 'n_generations': n_generations, 'pop_size': pop_size}


@app.get('/api/genetic/status')
def genetic_status():
    state = ga.get_genetic_state()
    return {k: v for k, v in state.items() if k != 'history'}


@app.get('/api/genetic/results')
def genetic_results():
    state = ga.get_genetic_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='유전 알고리즘이 완료되지 않았습니다.')
    return state


# ─── 자율 개선 루프 상태 ─────────────────────────────────────
@app.get('/api/auto-improve/status')
def auto_improve_status():
    status_file = Path(__file__).parent / 'auto_improve_status.json'
    if not status_file.exists():
        return {'status': 'not_started', 'message': 'auto_improve.py 를 별도 터미널에서 실행하세요.'}
    try:
        return json.loads(status_file.read_text(encoding='utf-8'))
    except Exception:
        return {'status': 'error', 'message': '상태 파일 읽기 실패'}


# ─── 실제 코퍼스 데이터 ──────────────────────────────────────
@app.get('/api/data/real')
def real_data():
    freq_data = get_real_frequency_data()
    corpus_raw = fetch_real_corpus_raw()
    if corpus_raw:
        parsed = parse_mayig_format(corpus_raw['data'])
        return {
            'corpus_available': True,
            'source_url': corpus_raw['url'],
            'inscription_count': len(parsed),
            'sample': parsed[:5],
            'frequency_data': freq_data,
        }
    return {
        'corpus_available': False,
        'frequency_data': freq_data,
        'note': '실제 코퍼스 다운로드 실패 — 합성 코퍼스 사용 중',
    }


# ─── 요약 (대시보드 초기 로드용) ─────────────────────────────
@app.get('/api/summary')
def summary():
    c = _get_corpus()
    stats = corp.get_corpus_stats(c)
    freq = anal.analyze_frequency(c, top_n=15)
    model_status = {k: v for k, v in tr.get_status().items()
                    if k in ('status', 'progress', 'current_epoch', 'total_epochs', 'message')}

    # 개선된 엔진 최고 해독률 우선 반환
    imp_state = improved.get_improved_state()
    best_rate = 0.0
    best_breakdown = {}
    rate_source = 'none'
    if imp_state.get('status') == 'done':
        res = imp_state.get('results') or {}
        sv = res.get('site_voter', {})
        cr = res.get('constrained', {})
        sv_rate = sv.get('decipherment_rate', 0)
        cr_rate = cr.get('decipherment_rate', 0)
        if sv_rate >= cr_rate:
            best_rate = sv_rate
            best_breakdown = sv.get('breakdown', {})
        else:
            best_rate = cr_rate
            best_breakdown = cr.get('breakdown', {})
        rate_source = 'improved_engine'

    # 실제 코퍼스 해독률 (캐시 활용)
    real_rate = 0.0
    real_breakdown = {}
    try:
        real_corpus = _get_real_corpus()
        real_stats = rcl.analyze_real_corpus(real_corpus)
        real_rate = real_stats.get('decipherment_rate', 0.0)
        real_breakdown = real_stats.get('breakdown', {})
    except Exception:
        pass

    return {
        'corpus': stats,
        'top_signs': freq['top_signs'],
        'coverage': freq['coverage'],
        'zipf_r2': freq['zipf']['r_squared'],
        'model': model_status,
        'best_rate': best_rate,
        'best_breakdown': best_breakdown,
        'rate_source': rate_source,
        'real_rate': real_rate,
        'real_breakdown': real_breakdown,
    }


# ─── 실제 코퍼스 분석 ─────────────────────────────────────────
@app.get('/api/real-corpus/stats')
def real_corpus_stats():
    corpus = _get_real_corpus()
    return rcl.analyze_real_corpus(corpus)


@app.get('/api/real-corpus/sign/{sign_id}')
def real_corpus_sign_detail(sign_id: int):
    corpus = _get_real_corpus()
    from collections import Counter
    freq      = Counter(s for insc in corpus for s in insc.sign_sequence)
    init_freq = Counter(insc.sign_sequence[0]  for insc in corpus if insc.sign_sequence)
    term_freq = Counter(insc.sign_sequence[-1] for insc in corpus if insc.sign_sequence)

    total = freq.get(sign_id, 0)
    if total == 0:
        raise HTTPException(status_code=404, detail=f'P{sign_id:03d} not found in corpus')

    # 이 기호가 포함된 비문 샘플
    examples = []
    for insc in corpus:
        if sign_id in insc.sign_sequence:
            examples.append({
                'id': insc.id,
                'description': insc.description,
                'sequence': [f'P{s:03d}' for s in insc.sign_sequence],
                'position': insc.sign_sequence.index(sign_id),
            })
        if len(examples) >= 10:
            break

    # 자주 함께 나오는 기호 (bigram)
    left_ctx  = Counter()
    right_ctx = Counter()
    for insc in corpus:
        seq = insc.sign_sequence
        for i, s in enumerate(seq):
            if s == sign_id:
                if i > 0:
                    left_ctx[seq[i - 1]] += 1
                if i < len(seq) - 1:
                    right_ctx[seq[i + 1]] += 1

    proposal   = rcl.SCHOLARLY_PROPOSALS.get(sign_id, {})
    m_id       = rcl.get_mahadevan_id(sign_id)
    sign_desc  = rcl.get_sign_description(sign_id)
    return {
        'sign_id':      sign_id,
        'sign_label':   f'P{sign_id:03d}',
        'mahadevan_id': m_id,
        'description':  sign_desc,
        'frequency':    total,
        'init_count':   init_freq.get(sign_id, 0),
        'term_count':   term_freq.get(sign_id, 0),
        'proposal':     proposal,
        'examples':     examples,
        'left_context':  [{'sign': f'P{s:03d}', 'count': c} for s, c in left_ctx.most_common(5)],
        'right_context': [{'sign': f'P{s:03d}', 'count': c} for s, c in right_ctx.most_common(5)],
    }


# ─── 실제 코퍼스 → 메인 엔진 실행 ─────────────────────────────
_real_decipher_state = {'status': 'idle', 'message': '', 'results': {}}

@app.post('/api/real-decipher/run')
def real_decipher_run():
    import threading
    if _real_decipher_state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 실행 중입니다.')

    def _run():
        try:
            _real_decipher_state.update({'status': 'running', 'message': '실제 코퍼스 로드 중...'})
            real_corp = _get_real_corpus()
            inscriptions = rcl.load_as_inscriptions(real_corp)
            _real_decipher_state['message'] = f'{len(inscriptions)}개 비문 → 기본 해독 엔진 실행 중...'

            # 기본 해독 엔진
            base_r = de.run_decipher(inscriptions)
            _real_decipher_state['message'] = '개선 엔진 실행 중...'

            # 개선 엔진 (단일 패스 — 소규모 코퍼스용)
            cr = improved.constrained_rescorer(inscriptions, base_r, {}, {}, {})
            sv = improved.site_aware_voter(inscriptions, base_r)

            cr_rate = cr.get('decipherment_rate', 0)
            sv_rate = sv.get('decipherment_rate', 0)
            best    = max(cr_rate, sv_rate)

            # 학술 제안과 비교
            stats = rcl.analyze_real_corpus(real_corp)

            _real_decipher_state.update({
                'status':  'done',
                'message': f'완료. 알고리즘 해독률 {best:.1f}% (실제 코퍼스 기반)',
                'results': {
                    'base_rate':       base_r.get('decipherment_rate', 0),
                    'constrained_rate': cr_rate,
                    'site_voter_rate':  sv_rate,
                    'best_rate':        best,
                    'scholarly_rate':   stats.get('decipherment_rate', 0),
                    'breakdown':        sv.get('breakdown') or cr.get('breakdown', {}),
                    'n_inscriptions':   len(inscriptions),
                },
            })
        except Exception as e:
            import traceback
            _real_decipher_state.update({
                'status': 'error',
                'message': f'오류: {e}\n{traceback.format_exc()[:200]}'
            })

    threading.Thread(target=_run, daemon=True).start()
    return {'started': True}


@app.get('/api/real-decipher/status')
def real_decipher_status():
    return {k: v for k, v in _real_decipher_state.items() if k != 'results'}


@app.get('/api/real-decipher/results')
def real_decipher_results():
    if _real_decipher_state['status'] != 'done':
        raise HTTPException(status_code=404, detail='아직 완료되지 않았습니다.')
    return _real_decipher_state['results']


# ─── 독립 발견 엔진 (실제 코퍼스 기반) ─────────────────────────
import real_discovery as rd

@app.post('/api/discovery-real/run')
def discovery_real_run():
    state = rd.get_state()
    if state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 실행 중입니다.')
    corpus = rcl.load_as_inscriptions(_get_real_corpus())
    started = rd.start_discovery(corpus)
    return {'started': started}


@app.get('/api/discovery-real/status')
def discovery_real_status():
    return rd.get_state()


@app.get('/api/discovery-real/results')
def discovery_real_results():
    state = rd.get_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='아직 완료되지 않았습니다.')
    raw = rd.get_results()

    en = raw.get('entropy', {})
    sg = raw.get('skipgram', {})
    sc = raw.get('substitution', {})
    tm = raw.get('templates', {})
    net = raw.get('network', {})
    top_pr_list = net.get('top_pagerank') or []

    # UI가 기대하는 형식으로 변환
    return {
        'methods': {
            'positional_entropy': en,
            'skipgram': {
                **sg,
                'similar_pairs': [
                    {**p, 'a': p.get('sign_a',''), 'b': p.get('sign_b',''),
                     'both_in_proposals': bool(p.get('proposal_a','?') != '?'),
                     'novel': p.get('similarity', 0) >= 0.90}
                    for p in sg.get('top_similar_pairs', [])
                ],
                'n_pairs': len(sg.get('top_similar_pairs', [])),
                'n_clusters': len(sg.get('cluster_summary', {})),
            },
            'substitution': {
                **sc,
                'pairs': [
                    {**p, 'a': p.get('sign_a',''), 'b': p.get('sign_b',''),
                     'similarity': p.get('context_sim', 0),
                     'novel': p.get('novelty') == 'NEW'}
                    for p in sc.get('novel_pairs', [])
                ],
                'n_novel': len(sc.get('novel_pairs', [])),
                'n_validated': len(sc.get('validated_pairs', [])),
            },
            'templates': {
                **tm,
                'templates': [
                    {**t, 'roles': list(t.get('template', ''))}
                    for t in tm.get('top_templates', [])
                ],
                'n_templates': tm.get('n_unique_templates', 0),
                'top_role_sequence': (tm.get('top_templates') or [{}])[0].get('template', '?'),
            },
            'network': {
                **net,
                'n_signs': net.get('n_nodes', 0),
                'top_pagerank_sign': top_pr_list[0].get('sign', '?') if top_pr_list else '?',
                'hubs': net.get('hubs', []),
                'authorities': net.get('authorities', []),
            },
        },
        'summary': {
            **raw.get('summary', {}),
            'total_novel_pairs': len(sc.get('novel_pairs', [])),
            'total_clusters': len(sg.get('cluster_summary', {})),
            'total_templates': tm.get('n_unique_templates', 0),
            'top_pagerank_sign': top_pr_list[0].get('sign', '?') if top_pr_list else '?',
        },
    }


# ─── 통계 검증 (Bootstrap + Permutation) ─────────────────────
import bootstrap_validator as bv

@app.post('/api/bootstrap/run')
def bootstrap_run():
    state = bv.get_state()
    if state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 실행 중입니다.')
    corpus = rcl.load_as_inscriptions(_get_real_corpus())
    dr_state = rd.get_state()
    disc_results = rd.get_results() if dr_state['status'] == 'done' else None
    started = bv.start_validation(corpus, disc_results)
    return {'started': started}


@app.get('/api/bootstrap/status')
def bootstrap_status():
    return bv.get_state()


@app.get('/api/bootstrap/results')
def bootstrap_results():
    state = bv.get_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='아직 완료되지 않았습니다.')
    return bv.get_results()


# ─── 드라비다어 비교 분석 ──────────────────────────────────────
import dravidian_mapper as drav

@app.post('/api/dravidian/run')
def dravidian_run():
    state = drav.get_state()
    if state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 실행 중입니다.')
    corpus = rcl.load_as_inscriptions(_get_real_corpus())
    started = drav.start_analysis(corpus)
    return {'started': started}


@app.get('/api/dravidian/status')
def dravidian_status():
    return drav.get_state()


@app.get('/api/dravidian/results')
def dravidian_results():
    state = drav.get_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='아직 완료되지 않았습니다.')
    return drav.get_results()


# ─── Rebus 음가 매핑 ──────────────────────────────────────────
import rebus_mapper as rb

@app.post('/api/rebus/run')
def rebus_run():
    state = rb.get_state()
    if state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 실행 중입니다.')
    corpus = rcl.load_as_inscriptions(_get_real_corpus())
    started = rb.start_mapping(corpus)
    return {'started': started}

@app.get('/api/rebus/status')
def rebus_status():
    return rb.get_state()

@app.get('/api/rebus/results')
def rebus_results():
    state = rb.get_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='아직 완료되지 않았습니다.')
    raw = rb.get_results()
    # rebus_map은 너무 커서 summary + translations만 반환
    return {
        'summary':      raw.get('summary', {}),
        'translations': raw.get('translations', []),
    }

@app.get('/api/rebus/translate/{inscription_id}')
def rebus_translate_one(inscription_id: str):
    rmap = rb.get_rebus_map()
    if not rmap:
        raise HTTPException(status_code=404, detail='먼저 /api/rebus/run 실행하세요.')
    corpus = rcl.load_as_inscriptions(_get_real_corpus())
    target = next((insc for insc in corpus if insc.id == inscription_id), None)
    if not target:
        raise HTTPException(status_code=404, detail=f'{inscription_id} 비문 없음')
    result = rb.translate_inscription(target.sign_sequence, rmap)
    result['inscription_id'] = inscription_id
    result['description']    = getattr(target, 'description', '')
    return result


@app.get('/api/rebus/sign/{sign_id}')
def rebus_sign_detail(sign_id: str):
    """
    단일 기호 상세 정보 반환.
    sign_id: 숫자(122) 또는 P-번호 형식(P122) 모두 허용.
    """
    rmap = rb.get_rebus_map()
    if not rmap:
        raise HTTPException(status_code=404, detail='먼저 /api/rebus/run 실행하세요.')
    # P122 또는 122 모두 처리
    raw = sign_id.lstrip('Pp')
    if not raw.isdigit():
        raise HTTPException(status_code=400, detail='sign_id는 숫자 또는 P번호 형식이어야 합니다.')
    sid = int(raw)
    info = rmap.get(sid)
    if not info:
        raise HTTPException(status_code=404, detail=f'P{sid:03d} 기호 정보 없음')
    return {
        'sign_id':     f'P{sid:03d}',
        'description': info.get('description', ''),
        'category':    info.get('category', 'unknown'),
        'status':      info.get('status', 'unknown'),
        'reading':     info.get('reading', '?'),
        'phoneme':     info.get('phoneme', '?'),
        'meaning':     info.get('meaning', '?'),
        'confidence':  info.get('confidence', 0.0),
        'source':      info.get('source', ''),
        'position':    info.get('position', {}),
        'candidates':  info.get('candidates', []),
        'mahadevan':   info.get('mahadevan', []),
    }


# ─── 유전 알고리즘 음가 최적화 ───────────────────────────────
import consistency_scorer as cs

@app.post('/api/genetic-decipher/run')
def genetic_decipher_run(n_gen: int = 80, pop_size: int = 30):
    state = cs.get_state()
    if state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 실행 중입니다.')
    rmap = rb.get_rebus_map()
    if not rmap:
        raise HTTPException(status_code=400, detail='먼저 /api/rebus/run 실행하세요.')
    corpus = rcl.load_as_inscriptions(_get_real_corpus())
    started = cs.start_genetic(corpus, rmap, n_gen=n_gen, pop_size=pop_size)
    return {'started': started, 'n_gen': n_gen, 'pop_size': pop_size}

@app.get('/api/genetic-decipher/status')
def genetic_decipher_status():
    return cs.get_state()

@app.get('/api/genetic-decipher/results')
def genetic_decipher_results():
    state = cs.get_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='아직 완료되지 않았습니다.')
    return cs.get_results()


# ─── Allograph 감지 ───────────────────────────────────────────
import allograph_detector as ad

@app.post('/api/allograph/run')
def allograph_run(threshold: float = 0.80):
    """feature vector 유사도 기반 allograph 클러스터링 + phoneme 전파"""
    rmap = rb.get_rebus_map()
    if not rmap:
        raise HTTPException(status_code=400, detail='먼저 /api/rebus/run 실행하세요.')
    features = ad.load_sign_features()
    groups   = ad.cluster_allographs(features, threshold=threshold)
    updated  = ad.propagate_phonemes(rmap, groups)
    report   = ad.get_allograph_report(groups, rmap)
    before   = sum(1 for v in rmap.values() if v.get('confidence', 0) >= 0.7)
    after    = sum(1 for v in updated.values() if v.get('confidence', 0) >= 0.7)
    return {
        'n_groups':    len(groups),
        'threshold':   threshold,
        'propagated':  after - before,
        'before_cov':  round(before / max(len(rmap), 1) * 100, 1),
        'after_cov':   round(after  / max(len(rmap), 1) * 100, 1),
        'groups':      report[:20],
    }


# ─── Transformer 임베딩 ──────────────────────────────────────
import transformer_embedder as te

@app.post('/api/transformer/run')
def transformer_run(n_epochs: int = 100):
    """BERT-style self-attention 기호 임베딩 학습 시작"""
    state = te.get_state()
    if state['status'] == 'running':
        raise HTTPException(status_code=409, detail='이미 실행 중입니다.')
    rmap   = rb.get_rebus_map()
    corpus = rcl.load_as_inscriptions(_get_real_corpus())
    started = te.start_transformer(corpus, rmap, n_epochs=n_epochs)
    return {'started': started, 'n_epochs': n_epochs}

@app.get('/api/transformer/status')
def transformer_status():
    return te.get_state()

@app.get('/api/transformer/results')
def transformer_results():
    state = te.get_state()
    if state['status'] != 'done':
        raise HTTPException(status_code=404, detail='아직 완료되지 않았습니다.')
    return te.get_results()


# ─── 코퍼스 통계 (extended) ───────────────────────────────────
@app.get('/api/corpus/extended-stats')
def extended_corpus_stats():
    """extended_corpus(2276개) 기본 통계"""
    corpus = rcl.load_as_inscriptions(_get_real_corpus())
    from collections import Counter
    lengths = [len(insc.sign_sequence) for insc in corpus]
    freq    = Counter(s for insc in corpus for s in insc.sign_sequence)
    top10   = [{'sign': f'P{s:03d}', 'count': c} for s, c in freq.most_common(10)]
    return {
        'total_inscriptions': len(corpus),
        'total_tokens':       sum(lengths),
        'avg_length':         round(sum(lengths) / max(len(lengths), 1), 2),
        'max_length':         max(lengths) if lengths else 0,
        'top10_signs':        top10,
        'length_distribution': {
            '1-2': sum(1 for l in lengths if l <= 2),
            '3-4': sum(1 for l in lengths if 3 <= l <= 4),
            '5-6': sum(1 for l in lengths if 5 <= l <= 6),
            '7+':  sum(1 for l in lengths if l >= 7),
        },
    }
