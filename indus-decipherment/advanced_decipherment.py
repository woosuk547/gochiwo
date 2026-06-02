"""
고급 인더스 문자 해독 알고리즘
참고 문헌:
  - Rao et al. (2009) PNAS: Markov model, conditional entropy
  - Nuhn et al. (2013) ACL: Beam search substitution cipher
  - Parpola (1994): Dravidian phoneme hypothesis
  - NetworkX: PageRank centrality
  - Yadav & Vahia (2013): Sign design and allographs
"""
import math
import time
import threading
import numpy as np
from collections import Counter, defaultdict
from typing import List, Dict, Tuple, Optional

from corpus import Inscription
from data_fetcher import PARPOLA_PROPOSALS, REAL_SIGN_FREQUENCIES

# ── 전역 상태 ─────────────────────────────────────────────
adv_state = {
    'status': 'idle',
    'progress': 0,
    'message': '',
    'results': {},
    'started_at': None,
    'finished_at': None,
}
_lock = threading.Lock()


def _upd(**kw):
    with _lock:
        adv_state.update(kw)


# ─────────────────────────────────────────────────────────
# 알고리즘 1: Markov 2차 모델 (Rao et al. 2009 재현)
# PNAS 논문의 핵심: H(X_n | X_{n-1}) vs H(X_n | X_{n-1}, X_{n-2})
# 인더스: ~2.7 bits, 무작위: ~log2(N) bits
# ─────────────────────────────────────────────────────────
def markov_2nd_order(corpus: List[Inscription]) -> dict:
    """
    2차 마르코프 모델로 조건부 엔트로피 계산.
    출처: Rao et al. 2009 PNAS "A Markov model of the Indus script"
    """
    unigram: Counter = Counter()
    bigram: Counter = Counter()
    trigram: Counter = Counter()

    for insc in corpus:
        seq = insc.sign_sequence
        for s in seq:
            unigram[s] += 1
        for i in range(len(seq) - 1):
            bigram[(seq[i], seq[i+1])] += 1
        for i in range(len(seq) - 2):
            trigram[(seq[i], seq[i+1], seq[i+2])] += 1

    N = sum(unigram.values())
    V = len(unigram)

    # H(X_n | X_{n-1}): 1차 조건부 엔트로피
    h1 = 0.0
    for (a, b), cnt_ab in bigram.items():
        p_a = unigram[a] / N
        p_b_given_a = cnt_ab / unigram[a]
        if p_b_given_a > 0:
            h1 -= p_a * p_b_given_a * math.log2(p_b_given_a)

    # H(X_n | X_{n-1}, X_{n-2}): 2차 조건부 엔트로피
    h2 = 0.0
    bi_total = sum(bigram.values())
    for (a, b, c), cnt_abc in trigram.items():
        p_ab = bigram[(a, b)] / bi_total if (a, b) in bigram else 0
        p_c_given_ab = cnt_abc / bigram.get((a, b), 1)
        if p_ab > 0 and p_c_given_ab > 0:
            h2 -= p_ab * p_c_given_ab * math.log2(p_c_given_ab)

    # 단순 엔트로피 H(X)
    h0 = -sum((c/N) * math.log2(c/N) for c in unigram.values())

    # 알려진 비교값 (Rao 2009 Table 1 기반)
    comparison_values = {
        '인더스 문자 (이번 분석)': round(h1, 3),
        '인더스 문자 (Rao 2009)': 2.73,
        '영어 (참고)':             3.20,
        '수메르어 (참고)':         2.84,
        'Linear A (참고)':         2.91,
        '무작위 시퀀스':           round(h0, 3),
    }

    # 각 기호의 예측 가능성 점수 (낮을수록 예측 가능 = 기능어 가능성)
    sign_predictability = {}
    for (a, b), cnt_ab in bigram.items():
        p = cnt_ab / unigram.get(a, 1)
        predictability = -math.log2(p) if p > 0 else h0
        if a not in sign_predictability:
            sign_predictability[a] = []
        sign_predictability[a].append(predictability)

    sign_scores = {}
    for sign, preds in sign_predictability.items():
        mean_pred = float(np.mean(preds))
        normalized = max(0.0, 1.0 - mean_pred / h0)
        sign_scores[sign] = {
            'predictability': round(mean_pred, 3),
            'score': round(normalized, 3),
            'role': 'function' if mean_pred < h0 * 0.6 else 'root',
        }

    return {
        'h0': round(h0, 3),
        'h1': round(h1, 3),
        'h2': round(h2, 3),
        'vocab_size': V,
        'comparison': comparison_values,
        'sign_scores': sign_scores,
        'interpretation': _interpret_entropy(h1, h0),
        'paper': 'Rao et al. 2009, PNAS 106(33):13685-13690',
    }


def _interpret_entropy(h1: float, h0: float) -> str:
    ratio = h1 / h0 if h0 > 0 else 1
    if ratio < 0.50:
        return '강한 언어 구조 — 자연어와 유사한 엔트로피'
    elif ratio < 0.70:
        return '중간 언어 구조 — 자연어와 비자연어의 중간 (Rao 2009와 일치)'
    else:
        return '약한 언어 구조 — 추가 분석 필요'


# ─────────────────────────────────────────────────────────
# 알고리즘 2: PageRank 중심성 분석
# ─────────────────────────────────────────────────────────
def pagerank_analysis(corpus: List[Inscription], damping: float = 0.85) -> dict:
    """
    기호 공기 네트워크에서 PageRank로 구조적 중심 기호 탐지.
    높은 PageRank = 문법적 허브 (기능어, 한정사 후보)
    """
    # 방향 그래프 엣지 가중치
    edge_weights: Dict[Tuple, int] = defaultdict(int)
    out_degree: Dict[int, int] = defaultdict(int)

    for insc in corpus:
        seq = insc.sign_sequence
        for i in range(len(seq) - 1):
            a, b = seq[i], seq[i+1]
            edge_weights[(a, b)] += 1
            out_degree[a] += 1

    all_signs = set(s for insc in corpus for s in insc.sign_sequence)
    N = len(all_signs)
    if N == 0:
        return {}

    # 수렴할 때까지 반복 (최대 100 이터레이션)
    rank = {s: 1.0 / N for s in all_signs}
    for _ in range(100):
        new_rank = {s: (1 - damping) / N for s in all_signs}
        for (a, b), w in edge_weights.items():
            total_out = out_degree[a]
            if total_out > 0:
                new_rank[b] = new_rank.get(b, 0) + damping * rank[a] * w / total_out
        diff = sum(abs(new_rank[s] - rank[s]) for s in all_signs)
        rank = new_rank
        if diff < 1e-6:
            break

    # 정규화 (최대값 = 1.0)
    max_rank = max(rank.values()) if rank else 1
    normalized = {s: round(float(v / max_rank), 4) for s, v in rank.items()}

    # 상위 기호별 역할 추론
    sorted_signs = sorted(normalized.items(), key=lambda x: -x[1])
    sign_results = {}
    for sign, pr in sorted_signs:
        role = 'function' if pr > 0.6 else ('root' if pr > 0.3 else 'hapax')
        sign_results[sign] = {
            'pagerank': pr,
            'score': pr,
            'role': role,
        }

    top10 = [{'sign': f'M{s}', 'pagerank': pr}
             for s, pr in sorted_signs[:10]]

    return {
        'sign_scores': sign_results,
        'top10': top10,
        'total_nodes': N,
        'total_edges': len(edge_weights),
        'method': 'PageRank (damping=0.85)',
    }


# ─────────────────────────────────────────────────────────
# 알고리즘 3: 드라비다어 음소 가설 (Parpola 1994)
# ─────────────────────────────────────────────────────────

# 빈도 순위 기반 드라비다어 제안 (Parpola + Mahadevan 종합)
# 실제 제안은 Mahadevan 번호 기준이지만 우리 합성 코퍼스에서는
# 빈도 순위로 매핑 (rank 1 = 가장 빈번한 기호)
FREQUENCY_RANK_PROPOSALS = {
    1:  {'reading': 'kōl/kal',   'meaning': '장대/돌 (항아리형 기호)',   'confidence': 0.28, 'mahadevan': '342', 'source': 'Parpola 1994'},
    2:  {'reading': 'mīn',       'meaning': '물고기/별 (어형)',           'confidence': 0.30, 'mahadevan': '176', 'source': 'Parpola 1994'},
    3:  {'reading': 'ān',        'meaning': '남자/그',                    'confidence': 0.22, 'mahadevan': '1',   'source': 'Parpola 1994'},
    4:  {'reading': '-um/-am',   'meaning': '문법 접속사 (기능어)',        'confidence': 0.25, 'mahadevan': '?',   'source': 'Mahadevan'},
    5:  {'reading': 'nīr',       'meaning': '물 (접두사 후보)',            'confidence': 0.18, 'mahadevan': '60',  'source': 'Yadav 2013'},
    6:  {'reading': 'cey/cī',    'meaning': '행위/경작지',               'confidence': 0.15, 'mahadevan': '99',  'source': 'Parpola 1994'},
    7:  {'reading': 'kaṇṭha',    'meaning': '목/경칭 (인물 기호)',        'confidence': 0.17, 'mahadevan': '7',   'source': 'Mahadevan'},
    8:  {'reading': 'māl/māḷ',   'meaning': '위대한/높은',               'confidence': 0.14, 'mahadevan': '17',  'source': 'Parpola 1994'},
    9:  {'reading': 'kōṭu',      'meaning': '뿔/꺾임 (기하 기호)',        'confidence': 0.16, 'mahadevan': '66',  'source': 'Parpola 1994'},
    10: {'reading': 'muṟi',      'meaning': '각인/표시',                  'confidence': 0.13, 'mahadevan': '267', 'source': 'Parpola 1994'},
}

# Proto-Dravidian 음절표 (빔서치에 사용)
PROTO_DRAVIDIAN_SYLLABLES = [
    'ma','mi','mu','me','mo','mā','mī','mū',
    'ka','ki','ku','ke','ko','kā','kī','kū',
    'na','ni','nu','ne','no','nā','nī','nū',
    'ta','ti','tu','te','to','tā','tī','tū',
    'pa','pi','pu','pe','po','pā','pī','pū',
    'va','vi','vu','ve','vo','vā','vī','vū',
    'ca','ci','cu','ce','co','cā','cī','cū',
    'ya','yi','yu','ye','yo','yā',
    'ra','ri','ru','re','ro','rā',
    'la','li','lu','le','lo','lā',
    'ṭa','ṭi','ṭu','ṇa','ṇi','ṇu',
    'ṟa','ṟi','ṟu','ḷa','ḷi','ḷu',
    'ān','ōr','āl','kāl','mīn','nīr','cey',
]


def dravidian_hypothesis(corpus: List[Inscription], freq_data: dict) -> dict:
    """
    Parpola(1994) 드라비다어 가설 평가.
    - 상위 빈도 기호에 제안된 음소값 매핑
    - 위치 패턴과 드라비다어 교착어 구조 일치도 계산
    출처: Parpola 1994, Mahadevan 1977, Yadav & Vahia 2013
    """
    # 빈도 순위 계산
    freq = Counter(s for insc in corpus for s in insc.sign_sequence)
    sorted_signs = [s for s, _ in freq.most_common()]
    rank_to_sign = {i+1: s for i, s in enumerate(sorted_signs)}

    # 제안 매핑
    sign_proposals = {}
    for rank, proposal in FREQUENCY_RANK_PROPOSALS.items():
        if rank in rank_to_sign:
            sign = rank_to_sign[rank]
            sign_proposals[sign] = {
                'rank': rank,
                'reading': proposal['reading'],
                'meaning': proposal['meaning'],
                'confidence': proposal['confidence'],
                'source': proposal['source'],
                'mahadevan_ref': proposal['mahadevan'],
                'sign_id': sign,
                'sign': f'M{sign}',
            }

    # 드라비다어 교착어 구조 적합도 계산
    # 드라비다어: SOV 어순, 어말 접미사, 어두 명사
    positional_fit = _evaluate_dravidian_fit(corpus, sign_proposals)

    # 실제 빈도 데이터와의 상관관계
    real_freqs = REAL_SIGN_FREQUENCIES
    real_rank = sorted(real_freqs.items(), key=lambda x: -x[1])
    real_rank_map = {s: i+1 for i, (s, _) in enumerate(real_rank)}

    return {
        'proposals': list(sign_proposals.values()),
        'total_proposed': len(sign_proposals),
        'positional_fit': positional_fit,
        'coverage_pct': round(len(sign_proposals) / max(len(freq), 1) * 100, 1),
        'note': '가설 상태 — 학계에서 검증되지 않음 (Parpola 1994 기준)',
        'dravidian_score': round(positional_fit.get('fit_score', 0), 2),
    }


def _evaluate_dravidian_fit(corpus: List[Inscription], proposals: dict) -> dict:
    """드라비다어 어순(SOV) 패턴과 실제 데이터의 일치도"""
    proposed_signs = set(proposals.keys())
    if not proposed_signs:
        return {'fit_score': 0.0}

    # 드라비다어 예측: 명사류(ān, mīn, kōl)는 중간, 접미사(-um)는 어말
    suffix_proposals = {s for s, p in proposals.items() if '-' in p['reading']}
    noun_proposals = {s for s, p in proposals.items() if '-' not in p['reading']}

    # 실제 위치 분포 측정
    suffix_last_ratio = 0.0
    noun_middle_ratio = 0.0
    n_suffix, n_noun = 0, 0

    for insc in corpus:
        seq = insc.sign_sequence
        if len(seq) < 2:
            continue
        for i, sign in enumerate(seq):
            norm_pos = i / max(len(seq) - 1, 1)
            if sign in suffix_proposals:
                if norm_pos > 0.7:
                    suffix_last_ratio += 1
                n_suffix += 1
            elif sign in noun_proposals:
                if 0.2 < norm_pos < 0.8:
                    noun_middle_ratio += 1
                n_noun += 1

    suf_fit = (suffix_last_ratio / n_suffix) if n_suffix > 0 else 0
    noun_fit = (noun_middle_ratio / n_noun) if n_noun > 0 else 0
    fit_score = (suf_fit * 0.6 + noun_fit * 0.4) * 100

    return {
        'fit_score': round(fit_score, 1),
        'suffix_last_ratio': round(suf_fit, 3),
        'noun_middle_ratio': round(noun_fit, 3),
        'interpretation': (
            'SOV 구조와 높은 일치도 — 드라비다어 가설 지지'
            if fit_score > 60
            else '부분적 일치 — 추가 검증 필요'
        ),
    }


# ─────────────────────────────────────────────────────────
# 알고리즘 4: 빔 서치 치환 암호 해독
# (Nuhn et al. 2013 ACL 방법론 단순화)
# ─────────────────────────────────────────────────────────
def beam_search_decipher(
    corpus: List[Inscription],
    beam_width: int = 12,
    n_candidates: int = 5,
) -> dict:
    """
    인더스 문자를 Proto-Dravidian 음절 치환 암호로 가정하고
    빔 서치로 최적 매핑을 탐색.
    출처: Nuhn et al. 2013 ACL "Beam Search for Solving Substitution Ciphers"

    한계: 실제 PDr 언어 모델 없이 빈도 기반 휴리스틱 사용
    결과는 가설적 후보임
    """
    freq = Counter(s for insc in corpus for s in insc.sign_sequence)
    sorted_signs = [s for s, _ in freq.most_common(40)]
    total_tokens = sum(freq.values())

    # Proto-Dravidian 음절 빈도 (현대 타밀어 기반 근사)
    pdr_freq_order = [
        'ka','na','ta','ma','va','pa','ca','ya','ra','la',
        'ki','ni','ti','mi','vi','pi','ci','yi','ri','li',
        'ku','nu','tu','mu','vu','pu','cu','ru','lu',
        'ke','ne','te','me','ve','pe','ce','re','le',
        'ko','no','to','mo','vo','po','co','ro','lo',
        'mīn','nīr','ān','kōl','cey','māl',
        'kā','nā','tā','mā','vā','pā',
        'ṭa','ṭi','ṭu','ṇa','ṇi','ṣa',
    ]

    # 초기 후보: 빈도 순위 매핑
    initial_mapping = {}
    for i, sign in enumerate(sorted_signs):
        if i < len(pdr_freq_order):
            initial_mapping[sign] = pdr_freq_order[i]

    # 빔 서치: 각 기호를 하나씩 교체하며 스코어 계산
    def score_mapping(mapping: dict) -> float:
        """매핑의 언어적 자연스러움 점수"""
        score = 0.0
        for insc in corpus[:200]:  # 빠른 계산을 위해 200개만
            seq = insc.sign_sequence
            for i, sign in enumerate(seq):
                if sign not in mapping:
                    continue
                syl = mapping[sign]
                norm_pos = i / max(len(seq) - 1, 1)
                # 드라비다어 음절 선호: 어두에 자음군, 어말에 비음
                if norm_pos < 0.3 and syl[0] in 'kptcmn':
                    score += 1.0
                if norm_pos > 0.7 and syl.endswith(('am', 'um', 'an', 'un', 'al')):
                    score += 1.5
                # 일반 빈도 점수
                pdr_rank = pdr_freq_order.index(syl) if syl in pdr_freq_order else len(pdr_freq_order)
                sign_rank = sorted_signs.index(sign) if sign in sorted_signs else len(sorted_signs)
                score += max(0, 10 - abs(pdr_rank - sign_rank) * 0.5)
        return score

    # 빔 서치 탐색
    beam = [{'mapping': dict(initial_mapping), 'score': score_mapping(initial_mapping)}]

    rng = np.random.default_rng(42)
    for iteration in range(30):
        candidates = []
        for state in beam:
            # 현재 매핑에서 2개 기호의 음절값 교체
            for _ in range(beam_width):
                new_mapping = dict(state['mapping'])
                if len(sorted_signs) < 2:
                    break
                i, j = rng.choice(len(sorted_signs), size=2, replace=False)
                si, sj = sorted_signs[i], sorted_signs[j]
                if si in new_mapping and sj in new_mapping:
                    new_mapping[si], new_mapping[sj] = new_mapping[sj], new_mapping[si]
                new_score = score_mapping(new_mapping)
                candidates.append({'mapping': new_mapping, 'score': new_score})

        candidates.sort(key=lambda x: -x['score'])
        beam = candidates[:n_candidates]

    best = beam[0] if beam else {'mapping': initial_mapping, 'score': 0}

    # 결과 포맷
    proposed_readings = []
    for sign, syllable in sorted(best['mapping'].items(), key=lambda x: -freq.get(x[0], 0)):
        proposed_readings.append({
            'sign': f'M{sign}',
            'sign_id': sign,
            'proposed_syllable': syllable,
            'frequency': freq.get(sign, 0),
            'frequency_pct': round(freq.get(sign, 0) / total_tokens * 100, 2),
        })

    return {
        'method': 'Beam Search Substitution Cipher (Nuhn et al. 2013)',
        'beam_width': beam_width,
        'best_score': round(float(best['score']), 2),
        'proposed_readings': proposed_readings[:25],
        'note': '빈도 기반 휴리스틱 사용 — 실제 PDr 언어 모델 적용 시 정확도 향상 가능',
        'limitation': '검증 불가능한 가설적 음절 매핑',
    }


# ─────────────────────────────────────────────────────────
# 알고리즘 5: 알로그래프 탐지 (Yadav & Vahia 2013)
# ─────────────────────────────────────────────────────────
def allograph_detection(corpus: List[Inscription]) -> dict:
    """
    동일 기호의 변이형(알로그래프)을 통계적으로 탐지.
    비슷한 분포 패턴을 가진 기호들 = 알로그래프 후보.
    출처: Yadav & Vahia (2013) Nature HSS
    """
    freq = Counter(s for insc in corpus for s in insc.sign_sequence)
    n_buckets = 5

    # 각 기호의 위치 분포 벡터
    pos_vectors: Dict[int, np.ndarray] = {}
    for insc in corpus:
        seq = insc.sign_sequence
        for i, sign in enumerate(seq):
            norm = i / max(len(seq) - 1, 1)
            b = min(int(norm * n_buckets), n_buckets - 1)
            if sign not in pos_vectors:
                pos_vectors[sign] = np.zeros(n_buckets)
            pos_vectors[sign][b] += 1

    # 정규화
    for sign in pos_vectors:
        total = pos_vectors[sign].sum()
        if total > 0:
            pos_vectors[sign] /= total

    # 코사인 유사도로 알로그래프 후보 탐색
    common_signs = [s for s, c in freq.most_common(60) if c >= 5]
    allograph_pairs = []

    for i in range(len(common_signs)):
        for j in range(i+1, len(common_signs)):
            a, b = common_signs[i], common_signs[j]
            va, vb = pos_vectors.get(a), pos_vectors.get(b)
            if va is None or vb is None:
                continue
            # 코사인 유사도
            norm_a = np.linalg.norm(va)
            norm_b = np.linalg.norm(vb)
            if norm_a == 0 or norm_b == 0:
                continue
            cosine = float(np.dot(va, vb) / (norm_a * norm_b))
            if cosine > 0.92:  # 매우 유사한 분포
                allograph_pairs.append({
                    'sign_a': f'M{a}',
                    'sign_b': f'M{b}',
                    'similarity': round(cosine, 4),
                    'freq_a': freq[a],
                    'freq_b': freq[b],
                })

    allograph_pairs.sort(key=lambda x: -x['similarity'])

    # 알로그래프 그룹화
    groups = []
    assigned = set()
    for pair in allograph_pairs[:20]:
        sa = pair['sign_a']
        sb = pair['sign_b']
        if sa in assigned or sb in assigned:
            continue
        groups.append({'signs': [sa, sb], 'similarity': pair['similarity']})
        assigned.add(sa)
        assigned.add(sb)

    # 어휘 크기 축소 효과
    effective_vocab = len(common_signs) - len(groups)

    return {
        'pairs': allograph_pairs[:15],
        'groups': groups,
        'original_vocab': len(common_signs),
        'effective_vocab': effective_vocab,
        'reduction_pct': round((1 - effective_vocab / max(len(common_signs), 1)) * 100, 1),
        'note': '코사인 유사도 > 0.92 기준 — 알로그래프 후보 (시각적 검증 필요)',
        'source': 'Yadav & Vahia 2013, Nature HSS',
    }


# ─────────────────────────────────────────────────────────
# 알고리즘 6: n-gram 당혹도 비교
# ─────────────────────────────────────────────────────────
def ngram_perplexity(corpus: List[Inscription]) -> dict:
    """
    바이그램 언어 모델로 당혹도(perplexity) 계산.
    알려진 언어와 비교하여 구조적 유사성 평가.
    낮은 당혹도 = 예측 가능한 구조 = 언어에 가까움
    """
    freq = Counter(s for insc in corpus for s in insc.sign_sequence)
    bigram: Counter = Counter()
    for insc in corpus:
        seq = insc.sign_sequence
        for i in range(len(seq) - 1):
            bigram[(seq[i], seq[i+1])] += 1

    N = sum(freq.values())
    total_bigrams = sum(bigram.values())
    V = len(freq)

    # 가산 스무딩 (Add-1 Laplace)
    log_prob_sum = 0.0
    n_tokens = 0
    for insc in corpus:
        seq = insc.sign_sequence
        for i in range(len(seq) - 1):
            a, b = seq[i], seq[i+1]
            cnt_ab = bigram.get((a, b), 0)
            cnt_a = freq.get(a, 0)
            # Laplace smoothed probability
            p = (cnt_ab + 1) / (cnt_a + V)
            log_prob_sum += math.log2(p)
            n_tokens += 1

    perplexity = 2 ** (-log_prob_sum / max(n_tokens, 1))

    # 비교 기준값 (Rao 2009, 다양한 NLP 연구 기반)
    comparison = {
        '인더스 문자 (이번 분석)':  round(perplexity, 1),
        '영어 문자 바이그램 (참고)': 12.5,
        '타밀어 바이그램 (참고)':    14.2,
        '수메르어 (추정)':           18.3,
        '무작위 시퀀스 (이론)':      float(V),
    }

    # 기호별 예측 어려움 (self-perplexity)
    sign_perplexity = {}
    for sign in list(freq.keys())[:50]:
        followers = {b: bigram.get((sign, b), 0) for b in freq}
        total = sum(followers.values()) + V
        ent = -sum(
            ((c + 1) / total) * math.log2((c + 1) / total)
            for c in followers.values() if (c + 1) / total > 0
        )
        sign_perplexity[sign] = round(float(2 ** ent), 2)

    return {
        'perplexity': round(perplexity, 2),
        'comparison': comparison,
        'vocab_size': V,
        'n_bigrams': total_bigrams,
        'sign_perplexity': {f'M{s}': pp for s, pp in
                            sorted(sign_perplexity.items(), key=lambda x: x[1])[:15]},
        'interpretation': (
            '자연어와 유사한 당혹도' if perplexity < 30
            else '언어 구조 일부 확인 — 추가 분석 필요'
        ),
    }


# ─────────────────────────────────────────────────────────
# 통합 실행
# ─────────────────────────────────────────────────────────
def run_advanced(corpus: List[Inscription]):
    _upd(status='running', progress=0, message='고급 분석 시작...', started_at=time.time())
    results = {}

    try:
        _upd(progress=5, message='[1/6] Markov 2차 모델 (Rao 2009)...')
        results['markov'] = markov_2nd_order(corpus)
        _upd(progress=22)

        _upd(message='[2/6] PageRank 중심성 분석...')
        results['pagerank'] = pagerank_analysis(corpus)
        _upd(progress=38)

        _upd(message='[3/6] 드라비다어 가설 (Parpola 1994)...')
        results['dravidian'] = dravidian_hypothesis(corpus, {})
        _upd(progress=52)

        _upd(message='[4/6] 빔 서치 치환 암호 해독 (Nuhn 2013)...')
        results['beam_search'] = beam_search_decipher(corpus)
        _upd(progress=68)

        _upd(message='[5/6] 알로그래프 탐지 (Yadav 2013)...')
        results['allograph'] = allograph_detection(corpus)
        _upd(progress=82)

        _upd(message='[6/6] n-gram 당혹도 비교...')
        results['perplexity'] = ngram_perplexity(corpus)
        _upd(progress=95)

        # 종합 해독률 계산
        # PageRank + Markov 기반 고신뢰 기호 집합
        pagerank_scores = results['pagerank']['sign_scores']
        markov_scores   = results['markov']['sign_scores']
        dravidian_signs = {p['sign_id'] for p in results['dravidian']['proposals']}

        all_signs = set(pagerank_scores) | set(markov_scores)
        advanced_rate_signs = {
            s for s in all_signs
            if (pagerank_scores.get(s, {}).get('pagerank', 0) > 0.5
                or markov_scores.get(s, {}).get('score', 0) > 0.5
                or s in dravidian_signs)
        }

        _upd(
            status='done',
            progress=100,
            message=f'완료. {len(advanced_rate_signs)}개 기호 고급 분석 완료.',
            results=results,
            finished_at=time.time(),
        )

    except Exception as e:
        _upd(status='error', message=f'오류: {e}', progress=0)
        import traceback; traceback.print_exc()


def start_advanced(corpus: List[Inscription]) -> bool:
    if adv_state['status'] == 'running':
        return False
    t = threading.Thread(target=run_advanced, args=(corpus,), daemon=True)
    t.start()
    return True


def get_adv_state() -> dict:
    with _lock:
        return dict(adv_state)
