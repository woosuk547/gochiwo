"""
프로토-드라비다어 어휘와 인더스 기호 위치 패턴 비교 분석

참고문헌:
- Krishnamurti 2003, The Dravidian Languages
- Burrow & Emeneau 1984, A Dravidian Etymological Dictionary
- Parpola 1994, Deciphering the Indus Script
- Mahadevan 2014, The Indus Non-Linear Script
"""
from collections import Counter
from typing import List

# 프로토-드라비다어 기초 어휘 (학술 제안 기반)
PROTO_DRAVIDIAN = {
    'mīn': {
        'meaning': '물고기 / 별 (동음이의)',
        'sign_candidates': [50, 51, 58, 60, 62],
        'position_expectation': 'any',
        'hypothesis': 'Fish rebus → mīn(별) = 천체 달력/제의 기록',
        'source': 'Rao et al. 2009 PNAS; Parpola 1994 §10',
        'dravidian_reflex': 'Ta. mīn, Ka. mīna, Te. mīna',
    },
    'āṇ': {
        'meaning': '남성 칭호 / 지배자',
        'sign_candidates': [324, 325, 86, 217],
        'position_expectation': 'initial',
        'hypothesis': '단지/그릇 기호 = ruler determinative (칭호 접두어)',
        'source': 'Parpola 1994 §7',
        'dravidian_reflex': 'Ta. āṇ (남성), Ko. ān',
    },
    'kaṇ': {
        'meaning': '눈 / 감시 / 계산',
        'sign_candidates': [122, 145, 147, 123],
        'position_expectation': 'any',
        'hypothesis': '눈 모양 숫자 기호 = 회계/소유 표기',
        'source': 'Mahadevan 2009',
        'dravidian_reflex': 'Ta. kaṇ, Ma. kaṇ, Ka. kaṇṇu',
    },
    'vēl': {
        'meaning': '창 / 소유주 칭호',
        'sign_candidates': [385, 378, 256],
        'position_expectation': 'terminal',
        'hypothesis': '어말 접미사 = 씨족/소유 표식',
        'source': 'Parpola 1994',
        'dravidian_reflex': 'Ta. vēl (창), vēḷir (씨족)',
    },
    'toṭi': {
        'meaning': '반지 / 봉인',
        'sign_candidates': [230, 316, 98],
        'position_expectation': 'any',
        'hypothesis': '인장 관련 기능어',
        'source': 'Mahadevan 2014',
        'dravidian_reflex': 'Ta. toṭi (팔찌/고리)',
    },
    'mutu': {
        'meaning': '진주 / 오래된',
        'sign_candidates': [364],
        'position_expectation': 'any',
        'hypothesis': '자연물 기호 = 귀중품 표식',
        'source': 'Parpola 1994 §12',
        'dravidian_reflex': 'Ta. mutu (오래된), muttu (진주)',
    },
}


def _positional_profile(corpus: List, sign_ids: list) -> dict:
    """특정 기호 집합의 위치 분포 계산"""
    init = total = term = mid = 0
    for insc in corpus:
        seq = insc.sign_sequence
        if not seq:
            continue
        for s in sign_ids:
            if s not in seq:
                continue
            total += 1
            if seq[0] == s:
                init += 1
            if seq[-1] == s:
                term += 1
            if s in seq[1:-1]:
                mid += 1
    if total == 0:
        return {'total': 0, 'init_pct': 0, 'term_pct': 0, 'mid_pct': 0}
    return {
        'total':    total,
        'init_pct': round(init / total * 100, 1),
        'term_pct': round(term / total * 100, 1),
        'mid_pct':  round(mid  / total * 100, 1),
    }


def _position_fit(profile: dict, expectation: str) -> bool:
    if profile['total'] == 0:
        return False
    if expectation == 'initial':
        return profile['init_pct'] > 25
    if expectation == 'terminal':
        return profile['term_pct'] > 25
    return profile['total'] >= 5  # 'any' → 등장만 하면 됨


def _sign_details(corpus: List, sign_id: int) -> dict:
    freq = Counter(s for insc in corpus for s in insc.sign_sequence)
    return {'sign': f'P{sign_id:03d}', 'frequency': freq.get(sign_id, 0)}


def analyze_word(corpus: List, word: str, entry: dict) -> dict:
    candidates = entry['sign_candidates']
    profile = _positional_profile(corpus, candidates)
    fit = _position_fit(profile, entry['position_expectation'])

    sign_stats = [_sign_details(corpus, s) for s in candidates]
    found = [s for s in sign_stats if s['frequency'] > 0]

    return {
        'meaning':              entry['meaning'],
        'hypothesis':           entry['hypothesis'],
        'source':               entry['source'],
        'dravidian_reflex':     entry['dravidian_reflex'],
        'sign_candidates':      [f'P{s:03d}' for s in candidates],
        'signs_found_in_corpus': [s['sign'] for s in found],
        'position_profile':     profile,
        'position_expectation': entry['position_expectation'],
        'position_fit':         fit,
    }


def run_dravidian_analysis(corpus: List) -> dict:
    """전체 드라비다어 비교 분석 실행"""
    findings = {
        word: analyze_word(corpus, word, entry)
        for word, entry in PROTO_DRAVIDIAN.items()
    }

    confirmed  = [w for w, d in findings.items() if d['position_fit'] and d['position_profile']['total'] > 0]
    partial    = [w for w, d in findings.items() if d['position_profile']['total'] > 0 and w not in confirmed]
    not_found  = [w for w, d in findings.items() if d['position_profile']['total'] == 0]

    support_level = (
        '강한 지지 (HIGH)' if len(confirmed) >= 4
        else '부분 지지 (MEDIUM)' if len(confirmed) >= 2
        else '약한 지지 (LOW)'
    )

    return {
        'total_vocab_tested':    len(PROTO_DRAVIDIAN),
        'confirmed':             confirmed,
        'partial':               partial,
        'not_found_in_corpus':   not_found,
        'dravidian_support':     support_level,
        'findings':              findings,
        'interpretation': (
            f'프로토-드라비다어 {len(PROTO_DRAVIDIAN)}개 어휘 중 '
            f'{len(confirmed)}개 위치 패턴 부합 → 드라비다어 기원 가설 {support_level}'
        ),
        'key_finding': (
            f'mīn(물고기) 기호군과 āṇ(칭호) 기호군의 위치 패턴이 드라비다어 형태론과 일치하면 '
            f'독립적인 언어 계통 증거로 논문 가능.'
        ),
        'references': [
            'Krishnamurti 2003, The Dravidian Languages (Cambridge)',
            'Burrow & Emeneau 1984, DEDR (Oxford)',
            'Parpola 1994, Deciphering the Indus Script (Cambridge)',
        ],
    }


# ── 비동기 실행 ────────────────────────────────────────────────
_state = {'status': 'idle', 'progress': 0, 'message': '', 'results': {}}


def start_analysis(corpus: List) -> bool:
    import threading
    if _state['status'] == 'running':
        return False
    _state.update({'status': 'running', 'progress': 10, 'results': {}, 'message': '드라비다어 비교 분석 중...'})

    def _run():
        try:
            r = run_dravidian_analysis(corpus)
            confirmed_count = len(r['confirmed'])
            _state.update({
                'status': 'done', 'progress': 100,
                'message': f'완료. {confirmed_count}개 어휘 위치 패턴 부합 ({r["dravidian_support"]})',
                'results': r,
            })
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
