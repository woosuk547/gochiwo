"""
다중 방법 해독 신뢰도 엔진
6가지 독립적 통계 방법으로 각 기호의 기능적 역할을 추론.
여러 방법이 동일한 역할에 동의할수록 신뢰도가 높아진다.

해독률 정의:
  - 확정 해독 (≥80%): 다수 방법이 일치 → 1.0 가중치
  - 부분 해독 (50~80%): 일부 방법이 일치 → 0.5 가중치
  - 단서 있음 (20~50%): 한 방법에서 특징 발견 → 0.2 가중치
  - 미해독 (<20%): 정보 부족
  실제 해독률 = (확정*1.0 + 부분*0.5 + 단서*0.2) / 전체 기호 수 * 100
"""
import math
import threading
import time
import numpy as np
from collections import Counter, defaultdict
from typing import Dict, List, Tuple
from scipy import stats as scipy_stats

from corpus import Inscription

# ── 역할 레이블 ──────────────────────────────────────────
ROLES = {
    'prefix':    '접두사 후보',
    'suffix':    '접미사 후보',
    'root':      '어근/명사 후보',
    'function':  '기능어 후보',
    'hapax':     '희귀어 (단발 출현)',
    'unknown':   '미분류',
}

# ── 결과 저장 ────────────────────────────────────────────
engine_state = {
    'status':   'idle',    # idle | running | done | error
    'progress': 0,
    'message':  '',
    'results':  {},        # sign_id → dict
    'method_stats': {},    # method → {agreement, coverage, ...}
    'decipherment_rate': 0.0,
    'breakdown': {},
    'repeated_phrases': [],
    'started_at': None,
    'finished_at': None,
}
_lock = threading.Lock()


def _upd(**kw):
    with _lock:
        engine_state.update(kw)


# ─────────────────────────────────────────────────────────
# 방법 1: 위치 편향 분석 (χ² 검정)
# ─────────────────────────────────────────────────────────
def method_positional(corpus: List[Inscription], n_buckets: int = 5) -> Dict[int, dict]:
    """
    각 기호의 위치 분포가 균일한지 χ² 검정.
    p < 0.05 → 위치 편향 존재 → 문법적 기능 신호
    """
    bucket_counts: Dict[int, List[int]] = defaultdict(lambda: [0] * n_buckets)
    sign_totals: Counter = Counter()

    for insc in corpus:
        seq = insc.sign_sequence
        if not seq:
            continue
        for i, sign in enumerate(seq):
            norm = i / max(len(seq) - 1, 1)
            b = min(int(norm * n_buckets), n_buckets - 1)
            bucket_counts[sign][b] += 1
            sign_totals[sign] += 1

    results = {}
    for sign, counts in bucket_counts.items():
        total = sum(counts)
        if total < 5:
            continue
        expected = [total / n_buckets] * n_buckets
        chi2, p = scipy_stats.chisquare(counts, f_exp=expected)

        # 선호 위치
        max_b = int(np.argmax(counts))
        if max_b == 0:
            role = 'prefix'
        elif max_b == n_buckets - 1:
            role = 'suffix'
        else:
            role = 'root'

        score = max(0.0, 1.0 - p)  # p가 낮을수록 편향 확실
        results[sign] = {
            'score': round(score, 3),
            'role': role if p < 0.05 else 'unknown',
            'p_value': round(p, 4),
            'preferred_bucket': max_b,
            'significant': p < 0.05,
        }
    return results


# ─────────────────────────────────────────────────────────
# 방법 2: 빈도 계층 분류
# ─────────────────────────────────────────────────────────
def method_frequency_tier(corpus: List[Inscription]) -> Dict[int, dict]:
    """
    빈도 분포로 기능어/내용어/희귀어를 구분.
    상위 5%: 기능어 (문법 표지)
    5~30%:  내용어 (명사/동사 후보)
    나머지: 희귀어
    """
    all_signs = [s for insc in corpus for s in insc.sign_sequence]
    freq = Counter(all_signs)
    total_tokens = len(all_signs)
    unique = len(freq)

    sorted_signs = sorted(freq.items(), key=lambda x: -x[1])
    top5_cut = max(1, int(unique * 0.05))
    top30_cut = max(top5_cut + 1, int(unique * 0.30))

    results = {}
    for rank, (sign, count) in enumerate(sorted_signs):
        pct = count / total_tokens
        if rank < top5_cut:
            role, score = 'function', 0.85
        elif rank < top30_cut:
            role, score = 'root', 0.60
        else:
            role, score = 'hapax', 0.15

        results[sign] = {
            'score': score,
            'role': role,
            'rank': rank + 1,
            'count': count,
            'pct': round(pct * 100, 2),
        }
    return results


# ─────────────────────────────────────────────────────────
# 방법 3: HMM 품사 상태 추론
# ─────────────────────────────────────────────────────────
def method_hmm(corpus: List[Inscription], n_states: int = 5) -> Dict[int, dict]:
    """
    비지도 HMM으로 기호의 숨은 문법 상태를 추론.
    상태별 위치 분포로 기능 해석.
    """
    try:
        from hmmlearn import hmm as hmmlib
    except ImportError:
        return {}

    all_signs = [s for insc in corpus for s in insc.sign_sequence]
    sign_list = sorted(set(all_signs))
    sign_to_idx = {s: i for i, s in enumerate(sign_list)}

    sequences = []
    lengths = []
    for insc in corpus:
        if len(insc.sign_sequence) < 2:
            continue
        seq = np.array([[sign_to_idx[s]] for s in insc.sign_sequence])
        sequences.append(seq)
        lengths.append(len(seq))

    if not sequences:
        return {}

    X = np.vstack(sequences)

    try:
        model = hmmlib.CategoricalHMM(
            n_components=n_states,
            n_iter=50,
            random_state=42,
        )
        model.fit(X, lengths)
    except Exception:
        return {}

    # 각 상태의 위치 선호도 계산
    state_position_sums = defaultdict(list)
    results_by_sign: Dict[int, List[int]] = defaultdict(list)

    for insc in corpus:
        seq = insc.sign_sequence
        if len(seq) < 2:
            continue
        obs = np.array([[sign_to_idx.get(s, 0)] for s in seq])
        try:
            _, states = model.decode(obs)
        except Exception:
            continue
        for i, (sign, state) in enumerate(zip(seq, states)):
            norm_pos = i / max(len(seq) - 1, 1)
            state_position_sums[state].append(norm_pos)
            results_by_sign[sign].append(int(state))

    # 상태별 평균 위치 → 기능 해석
    state_roles: Dict[int, str] = {}
    for state, positions in state_position_sums.items():
        mean_pos = np.mean(positions)
        if mean_pos < 0.25:
            state_roles[state] = 'prefix'
        elif mean_pos > 0.75:
            state_roles[state] = 'suffix'
        else:
            state_roles[state] = 'root'

    # 기호별 가장 많이 할당된 상태
    results = {}
    for sign, state_list in results_by_sign.items():
        dominant_state = Counter(state_list).most_common(1)[0][0]
        role = state_roles.get(dominant_state, 'unknown')
        consistency = Counter(state_list).most_common(1)[0][1] / len(state_list)
        results[sign] = {
            'score': round(consistency, 3),
            'role': role if consistency > 0.5 else 'unknown',
            'dominant_state': dominant_state,
            'consistency': round(consistency, 3),
        }
    return results


# ─────────────────────────────────────────────────────────
# 방법 4: 반복 구문 탐지
# ─────────────────────────────────────────────────────────
def method_repeated_phrases(corpus: List[Inscription], min_len: int = 2, min_count: int = 3) -> Tuple[Dict[int, dict], List[dict]]:
    """
    여러 비문에서 반복 등장하는 기호 시퀀스 탐지.
    반복 구문 = 고유명사, 직함, 관용 표현 후보 → 높은 해독 가치
    """
    phrase_counter: Counter = Counter()

    for insc in corpus:
        seq = insc.sign_sequence
        for length in range(min_len, min(5, len(seq) + 1)):
            for i in range(len(seq) - length + 1):
                phrase = tuple(seq[i:i + length])
                phrase_counter[phrase] += 1

    repeated = {ph: cnt for ph, cnt in phrase_counter.items() if cnt >= min_count}

    # 기호별 반복구문 참여 횟수
    sign_repeat_score: Dict[int, int] = defaultdict(int)
    phrase_list = []
    for phrase, cnt in sorted(repeated.items(), key=lambda x: -x[1])[:50]:
        for sign in phrase:
            sign_repeat_score[sign] += cnt
        phrase_list.append({
            'phrase': [f'M{s}' for s in phrase],
            'count': cnt,
            'length': len(phrase),
        })

    max_score = max(sign_repeat_score.values()) if sign_repeat_score else 1

    results = {}
    for sign, score_raw in sign_repeat_score.items():
        norm_score = score_raw / max_score
        results[sign] = {
            'score': round(norm_score, 3),
            'role': 'root',  # 반복구문 구성 = 내용어 후보
            'repeat_count': score_raw,
        }

    return results, phrase_list


# ─────────────────────────────────────────────────────────
# 방법 5: 상호정보량 (MI) 기반 기호 친화도
# ─────────────────────────────────────────────────────────
def method_mutual_information(corpus: List[Inscription]) -> Dict[int, dict]:
    """
    각 기호의 평균 pointwise MI를 계산.
    MI 높음 = 특정 기호들과 강하게 결합 → 복합어, 격 조사 후보
    MI 낮음 = 독립적으로 사용 → 고유 의미 기호 후보
    """
    unigram: Counter = Counter()
    bigram: Counter = Counter()
    total_tokens = 0

    for insc in corpus:
        seq = insc.sign_sequence
        for s in seq:
            unigram[s] += 1
            total_tokens += 1
        for i in range(len(seq) - 1):
            bigram[(seq[i], seq[i + 1])] += 1

    total_bi = sum(bigram.values())

    # 기호별 평균 PMI
    sign_pmi_sum: Dict[int, List[float]] = defaultdict(list)

    for (a, b), cnt in bigram.items():
        if cnt < 2:
            continue
        p_ab = cnt / total_bi
        p_a = unigram[a] / total_tokens
        p_b = unigram[b] / total_tokens
        if p_a > 0 and p_b > 0:
            pmi = math.log2(p_ab / (p_a * p_b))
            sign_pmi_sum[a].append(pmi)
            sign_pmi_sum[b].append(pmi)

    results = {}
    all_means = [np.mean(v) for v in sign_pmi_sum.values() if v]
    if not all_means:
        return results
    global_mean = np.mean(all_means)
    global_std = np.std(all_means) + 1e-9

    for sign, pmis in sign_pmi_sum.items():
        mean_pmi = np.mean(pmis)
        z_score = (mean_pmi - global_mean) / global_std
        # 높은 MI = 접사 후보, 낮은 MI = 독립 내용어
        if mean_pmi > global_mean + global_std:
            role, score = 'suffix', 0.70
        elif mean_pmi < global_mean - global_std:
            role, score = 'root', 0.65
        else:
            role, score = 'function', 0.45

        results[sign] = {
            'score': round(score, 3),
            'role': role,
            'mean_pmi': round(float(mean_pmi), 3),
            'z_score': round(float(z_score), 3),
        }
    return results


# ─────────────────────────────────────────────────────────
# 방법 6: 방법 간 교차 검증 (앙상블)
# ─────────────────────────────────────────────────────────
def method_cross_validate(
    pos_results: Dict, freq_results: Dict,
    hmm_results: Dict, mi_results: Dict,
) -> Dict[int, dict]:
    """
    위 4개 방법이 같은 역할을 예측하는지 교차 검증.
    일치 방법 수가 많을수록 신뢰도 가중치 +
    """
    all_signs = set(pos_results) | set(freq_results) | set(hmm_results) | set(mi_results)
    results = {}

    for sign in all_signs:
        roles = []
        if sign in pos_results and pos_results[sign]['role'] != 'unknown':
            roles.append(pos_results[sign]['role'])
        if sign in freq_results:
            roles.append(freq_results[sign]['role'])
        if sign in hmm_results and hmm_results[sign]['role'] != 'unknown':
            roles.append(hmm_results[sign]['role'])
        if sign in mi_results:
            roles.append(mi_results[sign]['role'])

        if not roles:
            results[sign] = {'score': 0.0, 'role': 'unknown', 'agreement': 0}
            continue

        role_count = Counter(roles)
        dominant_role, dominant_count = role_count.most_common(1)[0]
        agreement_ratio = dominant_count / len(roles)

        # 일치도 → 교차검증 점수
        if dominant_count >= 3:
            score = 0.90
        elif dominant_count == 2:
            score = 0.60
        else:
            score = 0.25

        results[sign] = {
            'score': round(score, 3),
            'role': dominant_role,
            'agreement': dominant_count,
            'total_methods': len(roles),
            'agreement_ratio': round(agreement_ratio, 2),
        }
    return results


# ─────────────────────────────────────────────────────────
# 종합 신뢰도 계산
# ─────────────────────────────────────────────────────────
WEIGHTS = {
    'positional': 0.25,
    'frequency':  0.15,
    'hmm':        0.20,
    'repeat':     0.15,
    'mi':         0.10,
    'cross':      0.15,
}


def calculate_confidence(
    sign: int,
    pos: dict, freq: dict, hmm: dict,
    repeat: dict, mi: dict, cross: dict,
) -> dict:
    scores = {
        'positional': pos.get(sign, {}).get('score', 0),
        'frequency':  freq.get(sign, {}).get('score', 0),
        'hmm':        hmm.get(sign, {}).get('score', 0),
        'repeat':     repeat.get(sign, {}).get('score', 0),
        'mi':         mi.get(sign, {}).get('score', 0),
        'cross':      cross.get(sign, {}).get('score', 0),
    }
    confidence = sum(scores[m] * WEIGHTS[m] for m in WEIGHTS) * 100

    # 교차검증 일치 방법 수
    methods_agreed = cross.get(sign, {}).get('agreement', 0)
    role = cross.get(sign, {}).get('role', freq.get(sign, {}).get('role', 'unknown'))

    # 해독 단계 분류
    if confidence >= 80:
        tier = 'confirmed'   # 확정 해독
    elif confidence >= 50:
        tier = 'partial'     # 부분 해독
    elif confidence >= 20:
        tier = 'clue'        # 단서 있음
    else:
        tier = 'unknown'     # 미해독

    def _clean(obj):
        """numpy/bool 등 JSON 비직렬화 타입 변환"""
        if isinstance(obj, dict):
            return {k: _clean(v) for k, v in obj.items()}
        if isinstance(obj, (list, tuple)):
            return [_clean(v) for v in obj]
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, (np.bool_,)):
            return bool(obj)
        return obj

    return {
        'sign_id': int(sign),
        'sign': f'M{sign}',
        'confidence': round(float(confidence), 1),
        'tier': tier,
        'role': str(role),
        'role_label': ROLES.get(role, '미분류'),
        'methods_agreed': int(methods_agreed),
        'scores': {k: round(float(v), 3) for k, v in scores.items()},
        'details': _clean({
            'positional': pos.get(sign, {}),
            'frequency':  freq.get(sign, {}),
            'hmm':        hmm.get(sign, {}),
            'repeat':     repeat.get(sign, {}),
            'mi':         mi.get(sign, {}),
            'cross':      cross.get(sign, {}),
        })
    }


# ─────────────────────────────────────────────────────────
# 메인 실행
# ─────────────────────────────────────────────────────────
def run_decipherment(corpus: List[Inscription]):
    _upd(status='running', progress=0, message='위치 편향 분석 시작...', started_at=time.time())

    try:
        _upd(progress=5, message='[1/6] 위치 편향 분석 (χ² 검정)...')
        pos_results = method_positional(corpus)
        _upd(progress=20, message='[2/6] 빈도 계층 분류...')

        freq_results = method_frequency_tier(corpus)
        _upd(progress=32, message='[3/6] HMM 품사 상태 추론...')

        hmm_results = method_hmm(corpus, n_states=6)
        hmm_available = bool(hmm_results)
        _upd(progress=52, message='[4/6] 반복 구문 탐지...')

        repeat_results, phrase_list = method_repeated_phrases(corpus)
        _upd(progress=65, message='[5/6] 상호정보량 분석...')

        mi_results = method_mutual_information(corpus)
        _upd(progress=78, message='[6/6] 방법 간 교차 검증...')

        cross_results = method_cross_validate(pos_results, freq_results, hmm_results, mi_results)
        _upd(progress=88, message='신뢰도 계산 중...')

        all_signs = (
            set(pos_results) | set(freq_results) | set(hmm_results) |
            set(repeat_results) | set(mi_results)
        )

        sign_results = {}
        for sign in all_signs:
            sign_results[sign] = calculate_confidence(
                sign, pos_results, freq_results, hmm_results,
                repeat_results, mi_results, cross_results,
            )

        # 해독률 계산
        tiers = Counter(r['tier'] for r in sign_results.values())
        total = len(sign_results)
        weighted = (
            tiers.get('confirmed', 0) * 1.0 +
            tiers.get('partial', 0) * 0.5 +
            tiers.get('clue', 0) * 0.2
        )
        decipherment_rate = round(weighted / max(total, 1) * 100, 1)

        # 방법별 커버리지
        method_stats = {
            '위치 편향 (χ²)': {
                'coverage': len(pos_results),
                'significant': sum(1 for v in pos_results.values() if v.get('significant')),
                'available': True,
            },
            '빈도 계층': {
                'coverage': len(freq_results),
                'function_words': sum(1 for v in freq_results.values() if v.get('role') == 'function'),
                'available': True,
            },
            'HMM 상태': {
                'coverage': len(hmm_results),
                'available': hmm_available,
            },
            '반복 구문': {
                'coverage': len(repeat_results),
                'phrases_found': len(phrase_list),
                'available': True,
            },
            '상호정보량': {
                'coverage': len(mi_results),
                'available': True,
            },
            '교차 검증': {
                'coverage': len(cross_results),
                'multi_agree': sum(1 for v in cross_results.values() if v.get('agreement', 0) >= 2),
                'available': True,
            },
        }

        _upd(
            status='done',
            progress=100,
            message=f'완료. {total}개 기호 분석, 실제 해독률 {decipherment_rate}%',
            results=sign_results,
            method_stats=method_stats,
            decipherment_rate=decipherment_rate,
            breakdown={
                'confirmed': tiers.get('confirmed', 0),
                'partial': tiers.get('partial', 0),
                'clue': tiers.get('clue', 0),
                'unknown': tiers.get('unknown', 0),
                'total': total,
            },
            repeated_phrases=phrase_list[:30],
            finished_at=time.time(),
        )

    except Exception as e:
        _upd(status='error', message=f'오류: {e}', progress=0)
        raise


def start_decipherment(corpus: List[Inscription]) -> bool:
    if engine_state['status'] == 'running':
        return False
    t = threading.Thread(target=run_decipherment, args=(corpus,), daemon=True)
    t.start()
    return True


def get_state() -> dict:
    with _lock:
        return dict(engine_state)
