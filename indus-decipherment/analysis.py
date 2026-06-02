"""
인더스 문자 통계 분석
- 지프 법칙 검증
- 위치 편향 분석
- 바이그램 PMI
- 조건부 엔트로피 (Rao et al. 2009 방법론)
"""
import math
import numpy as np
from collections import Counter, defaultdict
from typing import List, Dict, Tuple
from corpus import Inscription


def analyze_frequency(corpus: List[Inscription], top_n: int = 50) -> dict:
    """기호 빈도 분석 및 지프 법칙 적합도"""
    all_signs = [s for insc in corpus for s in insc.sign_sequence]
    freq = Counter(all_signs)

    sorted_freq = sorted(freq.items(), key=lambda x: -x[1])
    top = sorted_freq[:top_n]

    total = len(all_signs)
    cumulative = 0
    cumulative_data = []
    for sign, count in sorted_freq:
        cumulative += count
        cumulative_data.append(round(cumulative / total * 100, 2))

    # 지프 법칙 R² 계산 (log-log 선형 회귀)
    ranks = np.arange(1, len(sorted_freq) + 1)
    freqs = np.array([c for _, c in sorted_freq])
    log_r = np.log(ranks)
    log_f = np.log(freqs)
    coef = np.polyfit(log_r, log_f, 1)
    fitted = np.polyval(coef, log_r)
    ss_res = np.sum((log_f - fitted) ** 2)
    ss_tot = np.sum((log_f - log_f.mean()) ** 2)
    r_squared = 1 - ss_res / ss_tot if ss_tot > 0 else 0

    # 상위 기호 누적 커버리지
    top10_coverage = sum(c for _, c in sorted_freq[:10]) / total * 100
    top50_coverage = sum(c for _, c in sorted_freq[:50]) / total * 100

    return {
        'top_signs': [
            {'sign': f'M{s}', 'sign_id': s, 'count': c, 'pct': round(c / total * 100, 2)}
            for s, c in top
        ],
        'zipf': {
            'r_squared': round(float(r_squared), 4),
            'exponent': round(float(-coef[0]), 3),
            'log_ranks': [round(float(x), 3) for x in log_r[:100].tolist()],
            'log_freqs': [round(float(x), 3) for x in log_f[:100].tolist()],
            'fitted': [round(float(x), 3) for x in fitted[:100].tolist()],
        },
        'coverage': {
            'top10': round(top10_coverage, 1),
            'top50': round(top50_coverage, 1),
        },
        'total_tokens': len(all_signs),
        'unique_signs': len(freq),
    }


def analyze_positional(corpus: List[Inscription], n_buckets: int = 5) -> dict:
    """위치 편향 분석: 기호별 위치 선호도 계산"""
    # 위치 버킷: 0=첫번째, 1=초반, 2=중간, 3=후반, 4=마지막
    bucket_labels = ['첫번째', '초반', '중간', '후반', '마지막']
    all_signs = [s for insc in corpus for s in insc.sign_sequence]
    freq = Counter(all_signs)

    # 최소 20회 이상 등장한 기호만 분석
    common_signs = [s for s, c in freq.most_common(60) if c >= 20]

    position_matrix: Dict[int, List[int]] = {s: [0] * n_buckets for s in common_signs}

    for insc in corpus:
        seq = insc.sign_sequence
        if len(seq) == 0:
            continue
        for i, sign in enumerate(seq):
            if sign not in position_matrix:
                continue
            normalized = i / max(len(seq) - 1, 1)
            bucket = min(int(normalized * n_buckets), n_buckets - 1)
            position_matrix[sign][bucket] += 1

    # 각 기호의 위치 분포 정규화
    result_signs = []
    for sign in common_signs[:30]:
        counts = position_matrix[sign]
        total = sum(counts)
        if total == 0:
            continue
        probs = [round(c / total * 100, 1) for c in counts]
        # 선호 위치 결정
        preferred_idx = int(np.argmax(probs))
        preferred = bucket_labels[preferred_idx]
        result_signs.append({
            'sign': f'M{sign}',
            'sign_id': sign,
            'position_pct': probs,
            'preferred_position': preferred,
            'bias_score': round(float(max(probs) - 100 / n_buckets), 1),
        })

    # 위치별 평균 기호 다양성 (엔트로피)
    bucket_entropies = []
    for b in range(n_buckets):
        bucket_counts = Counter()
        for insc in corpus:
            seq = insc.sign_sequence
            for i, sign in enumerate(seq):
                normalized = i / max(len(seq) - 1, 1)
                bucket = min(int(normalized * n_buckets), n_buckets - 1)
                if bucket == b:
                    bucket_counts[sign] += 1
        total = sum(bucket_counts.values())
        if total > 0:
            ent = -sum((c / total) * math.log2(c / total) for c in bucket_counts.values())
            bucket_entropies.append(round(ent, 3))
        else:
            bucket_entropies.append(0)

    return {
        'signs': result_signs,
        'bucket_labels': bucket_labels,
        'bucket_entropies': bucket_entropies,
    }


def analyze_bigrams(corpus: List[Inscription], top_n: int = 40) -> dict:
    """바이그램 PMI 분석"""
    unigram: Counter = Counter()
    bigram: Counter = Counter()

    for insc in corpus:
        seq = insc.sign_sequence
        for sign in seq:
            unigram[sign] += 1
        for i in range(len(seq) - 1):
            bigram[(seq[i], seq[i + 1])] += 1

    total_uni = sum(unigram.values())
    total_bi = sum(bigram.values())

    # PMI 계산
    pmi_scores: List[Tuple] = []
    for (a, b), cnt in bigram.items():
        if cnt < 3:
            continue
        p_ab = cnt / total_bi
        p_a = unigram[a] / total_uni
        p_b = unigram[b] / total_uni
        if p_a > 0 and p_b > 0:
            pmi = math.log2(p_ab / (p_a * p_b))
            pmi_scores.append((a, b, cnt, round(pmi, 3)))

    pmi_scores.sort(key=lambda x: -x[2])
    top_by_freq = pmi_scores[:top_n]

    return {
        'top_bigrams': [
            {'pair': f'M{a}→M{b}', 'sign_a': a, 'sign_b': b, 'count': cnt, 'pmi': pmi}
            for a, b, cnt, pmi in top_by_freq
        ],
        'total_bigrams': len(bigram),
        'unique_bigrams': len(bigram),
    }


def analyze_entropy(corpus: List[Inscription]) -> dict:
    """
    조건부 엔트로피 H(Y|X) 분석
    Rao et al. (2009) 방법론 재현
    낮을수록 언어 구조가 강함 (무작위: ~8 bits)
    """
    bigram: Counter = Counter()
    unigram: Counter = Counter()

    for insc in corpus:
        for sign in insc.sign_sequence:
            unigram[sign] += 1
        for i in range(len(insc.sign_sequence) - 1):
            bigram[(insc.sign_sequence[i], insc.sign_sequence[i + 1])] += 1

    total_uni = sum(unigram.values())

    conditional_ent = 0.0
    for (a, b), cnt_ab in bigram.items():
        p_a = unigram[a] / total_uni
        p_ab_given_a = cnt_ab / unigram[a]
        if p_ab_given_a > 0:
            conditional_ent -= p_a * p_ab_given_a * math.log2(p_ab_given_a)

    # 단순 엔트로피 H(X)
    unigram_ent = -sum(
        (c / total_uni) * math.log2(c / total_uni)
        for c in unigram.values()
    )

    # 셔플 대조군
    rng = np.random.default_rng(99)
    shuffled_corpus = []
    for insc in corpus:
        seq = list(insc.sign_sequence)
        rng.shuffle(seq)
        from corpus import Inscription as I
        shuffled_corpus.append(I(
            id=insc.id, site_code=insc.site_code,
            site_name=insc.site_name, object_type=insc.object_type,
            sign_sequence=seq
        ))

    shuffled_bigram: Counter = Counter()
    for insc in shuffled_corpus:
        for i in range(len(insc.sign_sequence) - 1):
            shuffled_bigram[(insc.sign_sequence[i], insc.sign_sequence[i + 1])] += 1

    shuffled_ent = 0.0
    for (a, b), cnt_ab in shuffled_bigram.items():
        p_a = unigram[a] / total_uni
        p_ab_given_a = cnt_ab / max(unigram[a], 1)
        if p_ab_given_a > 0:
            shuffled_ent -= p_a * p_ab_given_a * math.log2(p_ab_given_a)

    # 알려진 언어 비교 기준값 (문헌 기반)
    comparison = {
        '인더스 문자 (실제)': round(float(conditional_ent), 3),
        '인더스 셔플 (대조군)': round(float(shuffled_ent), 3),
        '영어 (참고)': 3.2,
        '수메르어 (참고)': 2.8,
        '무작위 기호 (이론값)': round(float(unigram_ent), 3),
    }

    return {
        'conditional_entropy': round(float(conditional_ent), 3),
        'unigram_entropy': round(float(unigram_ent), 3),
        'shuffled_entropy': round(float(shuffled_ent), 3),
        'comparison': comparison,
        'interpretation': (
            '언어 구조 존재 강력히 지지' if conditional_ent < shuffled_ent * 0.7
            else '언어 구조 가능성 있음'
        ),
    }
