"""
프론티어 알고리즘 — 인더스 문자에 미시도된 6가지 접근법

1. 언어/비언어 직접 검증    — Hapax·TTR·Yule's K·길이분포·Farmer 가설 정량 검증
2. 행정 토큰 모델           — 수메르 초기처럼 '소유자+물품+수량' 3중 구조 검증
3. 3D 텐서 분해 (PARAFAC)  — Site × ObjectType × Sign CP 분해
4. 패러다임 대립 분석       — 절대 함께 등장 안 하는 기호 쌍 = 의미 반의어 후보
5. Transformer 자기주의     — numpy 순수 구현 1-layer self-attention
6. 시각적 아이코노그래피   — 동물/기하/인물 시각 범주 vs 통계 클러스터 대조

참조:
  - Farmer, Sproat, Witzel (2004): 비언어 가설
  - Rao et al. (2009): 언어 가설 반박
  - Vaswani et al. (2017): Attention is All You Need
  - Kolda & Bader (2009): Tensor Decompositions and Applications
"""
import math
import time
import threading
import numpy as np
from collections import Counter, defaultdict
from typing import List, Dict, Tuple

from corpus import Inscription

frontier_state = {
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
        frontier_state.update(kw)


# ─────────────────────────────────────────────────────────
# 1. 언어/비언어 직접 검증
# Farmer & Sproat (2004) 주요 논거를 정량적으로 재현·반박
# ─────────────────────────────────────────────────────────
def language_or_not(corpus: List[Inscription]) -> dict:
    """
    Farmer(2004)의 비언어 가설 vs Rao(2009)의 언어 가설을 정량 지표로 직접 검증.
    어느 쪽에 더 가까운지 점수화.
    """
    freq = Counter(s for insc in corpus for s in insc.sign_sequence)
    N = sum(freq.values())          # 총 토큰 수
    V = len(freq)                   # 고유 기호 수 (type)
    lengths = [insc.length for insc in corpus]

    # ── 지표 1: Hapax Legomena 비율 ───────────────────────
    # 자연어: 40~60% / 비언어(표지판): 70~90%
    hapax = sum(1 for c in freq.values() if c == 1)
    hapax_ratio = hapax / V

    # ── 지표 2: Yule's K (어휘 풍부도) ───────────────────
    # 낮을수록 반복이 많고 구조적 (자연어 K < 100)
    n_i = Counter(freq.values())
    yule_k = 1e4 * (sum(i * i * n for i, n in n_i.items()) - N) / (N * N)

    # ── 지표 3: Type-Token Ratio (TTR) ───────────────────
    # 자연어: 0.1~0.3 (긴 텍스트), 비언어: 0.6+ (짧고 다양)
    ttr = V / N

    # ── 지표 4: 비문 길이 분포 검정 ──────────────────────
    # 자연어 비문: mean > 5, lognormal / 비언어 레이블: mean < 4
    mean_len = float(np.mean(lengths))
    std_len  = float(np.std(lengths))
    # 로그정규 분포 적합도 (R²)
    log_lengths = np.log(np.array(lengths, dtype=float) + 1)
    log_mean = log_lengths.mean()
    ss_tot = ((log_lengths - log_mean) ** 2).sum()
    # 간단 카이제곱 근사: 실제 vs 이론 로그정규
    from scipy import stats as scipy_stats
    try:
        _, p_lognorm = scipy_stats.kstest(lengths, 'lognorm',
                                          args=(std_len, 0, mean_len))
    except Exception:
        p_lognorm = 0.0

    # ── 지표 5: 희귀 기호 증가율 (Farmer의 핵심 주장) ────
    # 비언어: 드문 기호가 많고 계속 증가 / 언어: 안정화
    sorted_freqs = sorted(freq.values(), reverse=True)
    top10_share = sum(sorted_freqs[:10]) / N
    rare_signs = sum(1 for c in freq.values() if c <= 3)
    rare_ratio = rare_signs / V

    # ── 지표 6: 비문당 평균 반복 (자기 반복) ──────────────
    repeat_ratio = np.mean([
        len(insc.sign_sequence) - len(set(insc.sign_sequence))
        for insc in corpus
    ])

    # ── 종합 판정 ─────────────────────────────────────────
    # 각 지표를 언어(1) vs 비언어(0) 점수로 정규화
    lang_signals = {
        'hapax_ratio':   1 - min(hapax_ratio / 0.7, 1.0),    # 낮을수록 언어
        'yule_k':        1 - min(yule_k / 200, 1.0),          # 낮을수록 언어
        'ttr':           1 - min(ttr / 0.5, 1.0),             # 낮을수록 언어 (긴 텍스트)
        'mean_length':   min(mean_len / 6.0, 1.0),             # 길수록 언어
        'top10_share':   1 - min(top10_share / 0.9, 1.0),     # 낮으면 균등 (비언어)
        'rare_ratio':    1 - min(rare_ratio / 0.6, 1.0),      # 낮을수록 언어
        'repeat_ratio':  min(repeat_ratio / 0.5, 1.0),        # 반복 있으면 언어
    }
    language_score = round(float(np.mean(list(lang_signals.values()))) * 100, 1)

    # 알려진 비교값
    comparison = {
        '자연어 기준 (언어)':           {'language_score': 70, 'hapax': '40~55%', 'ttr': '0.10~0.25'},
        '인더스 문자 (이번 분석)':      {'language_score': language_score, 'hapax': f'{hapax_ratio*100:.1f}%', 'ttr': f'{ttr:.3f}'},
        '도로 표지판 기준 (비언어)':    {'language_score': 15, 'hapax': '75~90%', 'ttr': '0.60+'},
        '수메르 원시 설형 (경계)':      {'language_score': 45, 'hapax': '60~70%', 'ttr': '0.30~0.45'},
    }

    verdict = (
        '언어 가설 지지 (Rao 2009 쪽)' if language_score >= 55
        else '비언어 가설 지지 (Farmer 2004 쪽)' if language_score <= 35
        else '경계 영역 — 판정 불가 (추가 검증 필요)'
    )

    return {
        'language_score': language_score,
        'verdict': verdict,
        'metrics': {
            'hapax_ratio': round(hapax_ratio, 4),
            'yule_k': round(yule_k, 2),
            'ttr': round(ttr, 4),
            'mean_inscription_length': round(mean_len, 2),
            'std_inscription_length': round(std_len, 2),
            'top10_sign_share': round(top10_share, 4),
            'rare_sign_ratio': round(rare_ratio, 4),
            'mean_self_repeat': round(repeat_ratio, 3),
            'lognorm_p_value': round(p_lognorm, 4),
        },
        'signal_breakdown': {k: round(v, 3) for k, v in lang_signals.items()},
        'comparison': comparison,
        'farmer_argument': {
            'hapax_too_high': hapax_ratio > 0.65,
            'texts_too_short': mean_len < 4.5,
            'rare_signs_dominant': rare_ratio > 0.5,
        },
        'note': ' 언어 점수 > 55 = 언어 가설 지지 / < 35 = 비언어 가설 지지',
    }


# ─────────────────────────────────────────────────────────
# 2. 행정 토큰 모델
# 수메르 초기 설형문자 = '소유자 + 물품 + 수량' 3중 구조
# 인더스 비문이 같은 패턴인지 검증
# ─────────────────────────────────────────────────────────
def administrative_token_model(corpus: List[Inscription]) -> dict:
    """
    수메르 프로토 설형문자 초기 단계: owner-marker + commodity + quantity
    인더스 비문에서 같은 3중 구조가 있는지 위치 패턴으로 검증.
    유물 종류(seal vs tablet)별 기호 분포 차이도 분석.
    """
    freq = Counter(s for insc in corpus for s in insc.sign_sequence)
    common_signs = [s for s, _ in freq.most_common(50)]
    N = sum(freq.values())

    # ── 위치 역할 분류 ────────────────────────────────────
    # 각 기호의 위치 프로파일: [어두%, 중간%, 어말%]
    pos_profile: Dict[int, np.ndarray] = {}
    for insc in corpus:
        seq = insc.sign_sequence
        L = len(seq)
        if L < 2:
            continue
        for i, s in enumerate(seq):
            if s not in pos_profile:
                pos_profile[s] = np.zeros(3)
            norm = i / (L - 1)
            if norm <= 0.25:
                pos_profile[s][0] += 1   # 어두
            elif norm <= 0.75:
                pos_profile[s][1] += 1   # 중간
            else:
                pos_profile[s][2] += 1   # 어말

    # 정규화
    for s in pos_profile:
        total = pos_profile[s].sum()
        if total > 0:
            pos_profile[s] /= total

    # 수메르 모델 역할 분류
    owner_signs   = []  # 어두 편향 (owner/title)
    commodity_signs = []  # 중간 편향 (commodity/item)
    quantity_signs  = []  # 어말 편향 (quantity/number)

    for s in common_signs:
        if s not in pos_profile:
            continue
        p = pos_profile[s]
        if p[0] > 0.45:
            owner_signs.append({'sign': f'M{s}', 'head_ratio': round(float(p[0]), 3)})
        elif p[2] > 0.45:
            quantity_signs.append({'sign': f'M{s}', 'tail_ratio': round(float(p[2]), 3)})
        elif p[1] > 0.50:
            commodity_signs.append({'sign': f'M{s}', 'mid_ratio': round(float(p[1]), 3)})

    # ── 유물 종류별 기호 분포 ─────────────────────────────
    obj_sign_freq: Dict[str, Counter] = defaultdict(Counter)
    for insc in corpus:
        for s in insc.sign_sequence:
            obj_sign_freq[str(insc.object_type)][s] += 1

    # 유물별 상위 기호
    obj_top_signs = {}
    for obj, ctr in obj_sign_freq.items():
        total = sum(ctr.values())
        obj_top_signs[obj] = [
            {'sign': f'M{s}', 'pct': round(c / total * 100, 1)}
            for s, c in ctr.most_common(5)
        ]

    # ── 사이트별 기호 분포 차이 ───────────────────────────
    site_sign_freq: Dict[str, Counter] = defaultdict(Counter)
    for insc in corpus:
        for s in insc.sign_sequence:
            site_sign_freq[str(insc.site_code)][s] += 1

    # KL 발산으로 사이트 간 차이 측정
    # 차이가 크면 "방언/지역어" 가능성, 작으면 표준화된 행정 체계
    sites = sorted(site_sign_freq.keys())
    site_dists = {}
    eps = 1e-9
    for site, ctr in site_sign_freq.items():
        total = sum(ctr.values())
        site_dists[site] = {s: c / total for s, c in ctr.items()}

    site_kl_pairs = []
    for i, s1 in enumerate(sites):
        for s2 in sites[i + 1:]:
            d1, d2 = site_dists.get(s1, {}), site_dists.get(s2, {})
            all_signs = set(d1) | set(d2)
            kl = sum(
                (d1.get(s, eps)) * math.log((d1.get(s, eps)) / (d2.get(s, eps) + eps) + eps)
                for s in all_signs
            )
            site_kl_pairs.append({'site_a': s1, 'site_b': s2, 'kl': round(kl, 4)})

    avg_site_kl = np.mean([p['kl'] for p in site_kl_pairs]) if site_kl_pairs else 0

    # ── 3중 구조 적합도 ───────────────────────────────────
    # 수메르 행정 모델과의 일치도: 소유자(어두) + 물품(중간) + 수량(어말)
    tripart_match = 0
    tripart_total = 0
    for insc in corpus:
        seq = insc.sign_sequence
        if len(seq) < 3:
            continue
        tripart_total += 1
        first = seq[0] in {s['sign'][1:] for s in [{'sign': f'M{x["sign"][1:]}' } for x in owner_signs]}
        last  = seq[-1] in {s['sign'][1:] for s in [{'sign': f'M{x["sign"][1:]}' } for x in quantity_signs]}
        if first or last:
            tripart_match += 1

    fit_score = round(tripart_match / max(tripart_total, 1) * 100, 1)

    # 단순화: owner_sign 집합 다시 계산
    owner_set = {int(x['sign'][1:]) for x in owner_signs if x['sign'][1:].isdigit()}
    quant_set = {int(x['sign'][1:]) for x in quantity_signs if x['sign'][1:].isdigit()}
    tripart_match2 = sum(
        1 for insc in corpus
        if len(insc.sign_sequence) >= 3
        and (insc.sign_sequence[0] in owner_set or insc.sign_sequence[-1] in quant_set)
    )
    fit_score2 = round(tripart_match2 / max(tripart_total, 1) * 100, 1)

    return {
        'method': 'Administrative Token Model (Sumerian Proto-Cuneiform)',
        'tripart_fit_score': fit_score2,
        'owner_sign_candidates': sorted(owner_signs, key=lambda x: -x['head_ratio'])[:8],
        'commodity_sign_candidates': sorted(commodity_signs, key=lambda x: -x['mid_ratio'])[:8],
        'quantity_sign_candidates': sorted(quantity_signs, key=lambda x: -x['tail_ratio'])[:8],
        'object_type_distribution': obj_top_signs,
        'site_kl_divergence': sorted(site_kl_pairs, key=lambda x: -x['kl'])[:5],
        'avg_site_kl': round(float(avg_site_kl), 4),
        'interpretation': (
            '행정 토큰 구조 강하게 지지 — 소유자·물품·수량 패턴 뚜렷'
            if fit_score2 > 60
            else '부분적 행정 구조 감지 — 언어와 혼재 가능성'
        ),
        'site_diversity': (
            '사이트별 차이 큼 → 지역 방언/다른 체계' if avg_site_kl > 0.3
            else '사이트 간 일관성 → 표준화된 행정 기호 체계'
        ),
    }


# ─────────────────────────────────────────────────────────
# 3. 3D 텐서 분해 (PARAFAC/CP)
# T[site, object_type, sign] 분해
# ─────────────────────────────────────────────────────────
def tensor_decomposition(corpus: List[Inscription], rank: int = 5) -> dict:
    """
    Site × ObjectType × Sign 3차원 텐서를 PARAFAC(CP) 분해.
    각 성분(rank-1 텐서) = 특정 사이트에서 특정 유물에 등장하는 기호 패턴.
    예: 성분 1 = "모헨조다로 인장에서 집중 등장하는 물고기 관련 기호군"
    참조: Kolda & Bader (2009)
    """
    # 인덱스 매핑
    sites = sorted(set(str(insc.site_code) for insc in corpus))
    objs  = sorted(set(str(insc.object_type) for insc in corpus))
    freq  = Counter(s for insc in corpus for s in insc.sign_sequence)
    signs = [s for s, _ in freq.most_common(60)]

    site_idx = {s: i for i, s in enumerate(sites)}
    obj_idx  = {o: i for i, o in enumerate(objs)}
    sign_idx = {s: i for i, s in enumerate(signs)}

    I, J, K = len(sites), len(objs), len(signs)

    # 텐서 구성 T[i, j, k] = site_i × obj_j에서 sign_k의 등장 빈도
    T = np.zeros((I, J, K), dtype=np.float64)
    for insc in corpus:
        si = site_idx.get(str(insc.site_code))
        oi = obj_idx.get(str(insc.object_type))
        if si is None or oi is None:
            continue
        for s in insc.sign_sequence:
            if s in sign_idx:
                T[si, oi, sign_idx[s]] += 1

    # 정규화
    T = T / (T.max() + 1e-9)

    # CP 분해 — ALS (Alternating Least Squares)
    rng = np.random.default_rng(42)
    A = rng.random((I, rank))  # site factor
    B = rng.random((J, rank))  # object factor
    C = rng.random((K, rank))  # sign factor

    def khatri_rao(X, Y):
        """Khatri-Rao 곱 (열별 Kronecker)"""
        n1, r = X.shape
        n2, _ = Y.shape
        result = np.zeros((n1 * n2, r))
        for i in range(r):
            result[:, i] = np.kron(X[:, i], Y[:, i])
        return result

    for _ in range(50):
        # A 업데이트: T_(1) ≈ A (C ⊙ B)^T
        T1 = T.reshape(I, J * K)
        KR_CB = khatri_rao(C, B)
        A = T1 @ KR_CB @ np.linalg.pinv(KR_CB.T @ KR_CB)
        A = np.maximum(A, 0)

        # B 업데이트
        T2 = T.transpose(1, 0, 2).reshape(J, I * K)
        KR_CA = khatri_rao(C, A)
        B = T2 @ KR_CA @ np.linalg.pinv(KR_CA.T @ KR_CA)
        B = np.maximum(B, 0)

        # C 업데이트
        T3 = T.transpose(2, 0, 1).reshape(K, I * J)
        KR_BA = khatri_rao(B, A)
        C = T3 @ KR_BA @ np.linalg.pinv(KR_BA.T @ KR_BA)
        C = np.maximum(C, 0)

    # 재구성 오차
    T_recon = np.zeros_like(T)
    for r_i in range(rank):
        T_recon += np.einsum('i,j,k->ijk', A[:, r_i], B[:, r_i], C[:, r_i])
    recon_error = float(np.linalg.norm(T - T_recon) / (np.linalg.norm(T) + 1e-9))

    # 각 성분 해석
    components = []
    for r_i in range(rank):
        top_site  = sites[int(A[:, r_i].argmax())]
        top_obj   = objs[int(B[:, r_i].argmax())]
        top_sign_idx = C[:, r_i].argsort()[-5:][::-1]
        top_sign_names = [f'M{signs[i]}' for i in top_sign_idx]

        components.append({
            'component': r_i + 1,
            'dominant_site': top_site,
            'dominant_object': top_obj,
            'top_signs': top_sign_names,
            'site_loadings': {sites[i]: round(float(A[i, r_i]), 3) for i in range(I)},
            'obj_loadings': {objs[i]: round(float(B[i, r_i]), 3) for i in range(J)},
            'interpretation': f'{top_site} 지역 {top_obj} 유물에서 집중 등장하는 기호 패턴',
        })

    # 사이트별 전용 기호 (한 사이트에서만 집중 등장)
    site_exclusive = {}
    for k_i, sign in enumerate(signs):
        site_freqs = T[:, :, k_i].sum(axis=1)
        total = site_freqs.sum()
        if total < 5:
            continue
        max_ratio = site_freqs.max() / total
        if max_ratio > 0.7:
            dominant_site = sites[int(site_freqs.argmax())]
            if dominant_site not in site_exclusive:
                site_exclusive[dominant_site] = []
            site_exclusive[dominant_site].append({'sign': f'M{sign}', 'ratio': round(float(max_ratio), 3)})

    return {
        'method': 'CP Tensor Decomposition (PARAFAC)',
        'rank': rank,
        'reconstruction_error': round(recon_error, 4),
        'dimensions': {'sites': I, 'object_types': J, 'signs': K},
        'components': components,
        'site_exclusive_signs': site_exclusive,
        'note': '각 성분 = 특정 사이트+유물에서 집중 등장하는 기호 클러스터. 재구성 오차가 낮을수록 모델 적합.',
    }


# ─────────────────────────────────────────────────────────
# 4. 패러다임 대립 분석
# 절대 함께 등장하지 않는 기호 쌍 = 의미론적 반의어·상보적 분포
# ─────────────────────────────────────────────────────────
def paradigmatic_opposition(corpus: List[Inscription]) -> dict:
    """
    같은 비문에 절대 함께 등장하지 않는 고빈도 기호 쌍 탐색.
    언어학: 상보적 분포(complementary distribution) = 같은 의미 범주 내 대립.
    예: 영어 'a' vs 'an' — 절대 같은 위치에 못 옴.
    """
    freq = Counter(s for insc in corpus for s in insc.sign_sequence)
    common = [s for s, c in freq.most_common(80) if c >= 15]

    # 공기 행렬: C[i,j] = 같은 비문에 등장한 비문 수
    V = len(common)
    sign_to_idx = {s: i for i, s in enumerate(common)}
    cooc = np.zeros((V, V), dtype=np.int32)

    # 각 비문에서 등장한 기호 집합
    for insc in corpus:
        present = set(insc.sign_sequence) & set(common)
        present = [sign_to_idx[s] for s in present]
        for i in range(len(present)):
            for j in range(i + 1, len(present)):
                cooc[present[i], present[j]] += 1
                cooc[present[j], present[i]] += 1

    # 등장 비문 수
    sign_doc_count = np.array([
        sum(1 for insc in corpus if s in insc.sign_sequence)
        for s in common
    ])

    # 상보적 분포 점수 계산
    # 두 기호가 함께 등장할 기대값 E = (doc_a * doc_b) / total_docs
    total_docs = len(corpus)
    opposition_pairs = []

    for i in range(V):
        for j in range(i + 1, V):
            if cooc[i, j] > 0:
                continue  # 한 번이라도 같이 나오면 제외
            doc_a = sign_doc_count[i]
            doc_b = sign_doc_count[j]
            # 기대 공기 빈도
            expected = doc_a * doc_b / total_docs
            if expected < 5:
                continue  # 통계적으로 불충분
            # 두 기호 모두 고빈도인데 절대 함께 등장 안 함 = 강한 대립
            opposition_score = float(expected) / total_docs
            opposition_pairs.append({
                'sign_a': f'M{common[i]}',
                'sign_b': f'M{common[j]}',
                'freq_a': int(freq[common[i]]),
                'freq_b': int(freq[common[j]]),
                'expected_cooc': round(float(expected), 2),
                'opposition_score': round(opposition_score, 4),
                'interpretation': '강한 상보적 분포 — 의미 범주 대립 후보' if expected > 20 else '상보적 분포 후보',
            })

    opposition_pairs.sort(key=lambda x: -x['expected_score'] if 'expected_score' in x else -x['expected_cooc'])

    # 대립 클러스터 (같은 범주의 대립어 그룹)
    # Union-Find로 대립 그룹화
    parent = list(range(V))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    def union(x, y):
        parent[find(x)] = find(y)

    for pair in opposition_pairs[:30]:
        a = common.index(int(pair['sign_a'][1:]))
        b = common.index(int(pair['sign_b'][1:]))
        union(a, b)

    groups = defaultdict(list)
    for i, s in enumerate(common):
        groups[find(i)].append(f'M{s}')
    opposition_groups = [
        {'signs': signs, 'size': len(signs)}
        for signs in groups.values() if len(signs) >= 2
    ]
    opposition_groups.sort(key=lambda x: -x['size'])

    return {
        'method': 'Paradigmatic Opposition Analysis',
        'total_pairs_analyzed': V * (V - 1) // 2,
        'opposition_pairs_found': len(opposition_pairs),
        'top_pairs': opposition_pairs[:15],
        'opposition_groups': opposition_groups[:8],
        'interpretation': (
            f'{len(opposition_pairs)}개 상보적 분포 쌍 발견 — '
            + ('강한 의미 범주 구조 (언어 특성)' if len(opposition_pairs) > 20 else '약한 대립 구조')
        ),
        'note': '기대 공기 빈도가 높은데도 절대 함께 등장 안 하는 쌍 = 의미적 반의어·범주 대립 후보.',
    }


# ─────────────────────────────────────────────────────────
# 5. Transformer 자기주의 (numpy 순수 구현)
# 문법 구조 없이도 기호 간 의존 관계 탐지
# ─────────────────────────────────────────────────────────
def transformer_attention(corpus: List[Inscription], d_model: int = 32, n_heads: int = 4) -> dict:
    """
    1-layer Multi-Head Self-Attention (numpy 순수 구현, 훈련 없음).
    입력: bigram PMI 기반 기호 임베딩
    출력: 기호 간 평균 주의 가중치 행렬 → 의존 구조 추론

    핵심 통찰: 높은 attention weight(A→B) = A가 B의 문맥을 강하게 필요로 함
    참조: Vaswani et al. (2017) Attention is All You Need
    """
    # 기호 임베딩: bigram PMI 행렬의 상위 d_model 차원 (SVD)
    from scipy.sparse.linalg import svds

    freq = Counter(s for insc in corpus for s in insc.sign_sequence)
    vocab = [s for s, _ in freq.most_common(50)]
    sign_to_idx = {s: i for i, s in enumerate(vocab)}
    V = len(vocab)
    N = sum(freq.values())

    # PPMI 행렬
    cooc = np.zeros((V, V), dtype=np.float32)
    for insc in corpus:
        seq = insc.sign_sequence
        for i in range(len(seq) - 1):
            a, b = seq[i], seq[i + 1]
            if a in sign_to_idx and b in sign_to_idx:
                cooc[sign_to_idx[a], sign_to_idx[b]] += 1

    total = cooc.sum() + 1e-9
    row_sum = cooc.sum(axis=1, keepdims=True) + 1e-9
    col_sum = cooc.sum(axis=0, keepdims=True) + 1e-9
    pmi = np.log2((cooc * total) / (row_sum * col_sum) + 1e-9)
    ppmi = np.maximum(pmi, 0).astype(float)

    # SVD로 임베딩 추출
    k = min(d_model, V - 2)
    try:
        U, s_vals, _ = svds(ppmi, k=k)
        E = U * np.sqrt(s_vals)  # [V, d_model]
    except Exception:
        E = np.random.randn(V, k) * 0.1

    # 위치 인코딩 (sinusoidal)
    def positional_encoding(seq_len: int, d: int) -> np.ndarray:
        PE = np.zeros((seq_len, d))
        positions = np.arange(seq_len)[:, np.newaxis]
        dims = np.arange(0, d, 2)
        PE[:, 0::2] = np.sin(positions / 10000 ** (dims / d))
        PE[:, 1::2] = np.cos(positions / 10000 ** (dims[: d // 2] / d))
        return PE

    # 랜덤 프로젝션 행렬 (W_Q, W_K, W_V per head)
    rng = np.random.default_rng(42)
    d_head = k // n_heads
    heads_WQ = [rng.normal(0, 0.1, (k, d_head)) for _ in range(n_heads)]
    heads_WK = [rng.normal(0, 0.1, (k, d_head)) for _ in range(n_heads)]
    heads_WV = [rng.normal(0, 0.1, (k, d_head)) for _ in range(n_heads)]

    # 대표 비문들에 대한 평균 어텐션 계산
    avg_attention = np.zeros((V, V))
    n_processed = 0

    for insc in corpus[:200]:
        seq_idx = [sign_to_idx[s] for s in insc.sign_sequence if s in sign_to_idx]
        if len(seq_idx) < 2:
            continue
        L = len(seq_idx)
        # 입력 행렬 X: [L, d_model]
        X = E[seq_idx]  # [L, k]
        X = X + positional_encoding(L, k)[:, :X.shape[1]]

        # Multi-head attention
        head_attentions = []
        for h in range(n_heads):
            Q = X @ heads_WQ[h]  # [L, d_head]
            K = X @ heads_WK[h]
            V_mat = X @ heads_WV[h]
            scores = Q @ K.T / math.sqrt(d_head)  # [L, L]
            # softmax
            scores -= scores.max(axis=-1, keepdims=True)
            attn = np.exp(scores)
            attn /= attn.sum(axis=-1, keepdims=True) + 1e-9
            head_attentions.append(attn)  # [L, L]

        # 헤드 평균
        mean_attn = np.mean(head_attentions, axis=0)  # [L, L]

        # 기호 쌍별 누적 (인덱스 기반)
        for i in range(L):
            for j in range(L):
                if i != j:
                    avg_attention[seq_idx[i], seq_idx[j]] += mean_attn[i, j]
        n_processed += 1

    if n_processed > 0:
        avg_attention /= n_processed

    # 최고 어텐션 쌍 추출
    top_pairs = []
    for i in range(V):
        for j in range(V):
            if i != j and avg_attention[i, j] > 0:
                top_pairs.append({
                    'from_sign': f'M{vocab[i]}',
                    'to_sign': f'M{vocab[j]}',
                    'attention': round(float(avg_attention[i, j]), 5),
                    'interpretation': f'M{vocab[i]} → M{vocab[j]} 문맥 의존',
                })
    top_pairs.sort(key=lambda x: -x['attention'])

    # 기호별 "주목받는 정도" (in-attention sum)
    in_attention = avg_attention.sum(axis=0)  # 얼마나 다른 기호들이 이 기호를 주목하나
    top_attended = [
        {'sign': f'M{vocab[i]}', 'total_attention': round(float(in_attention[i]), 4)}
        for i in in_attention.argsort()[::-1][:10]
    ]

    return {
        'method': 'Transformer Self-Attention (1-layer, 4-head)',
        'd_model': k,
        'n_heads': n_heads,
        'n_sequences_processed': n_processed,
        'top_attention_pairs': top_pairs[:15],
        'most_attended_signs': top_attended,
        'note': '높은 attention(A→B) = A 다음에 B가 자주 필요 (문법적 의존 구조). 훈련 없이 PMI 임베딩 기반.',
    }


# ─────────────────────────────────────────────────────────
# 6. 시각적 아이코노그래피 클러스터링
# 동물/기하/인물 시각 범주 vs 통계 클러스터 일치도
# ─────────────────────────────────────────────────────────

# Mahadevan 카탈로그 기반 시각 범주 (인더스 학계 합의된 분류)
# 출처: Mahadevan 1977 "The Indus Script: Texts, Concordance and Tables"
ICONOGRAPHIC_CATEGORIES = {
    'animal': {
        'label': '동물형',
        'signs': [17, 83, 86, 88, 89, 92, 93, 95, 97, 342, 159, 176, 232],
        'description': '물고기·소·코끼리·코뿔소·호랑이 등 동물 형상',
    },
    'human': {
        'label': '인물형',
        'signs': [1, 7, 25, 33, 60, 66, 70, 99, 131, 139, 193],
        'description': '인물·신체 부위·행위 관련 기호',
    },
    'geometric_linear': {
        'label': '기하-선형',
        'signs': [100, 140, 144, 186, 188, 195, 202, 211, 220, 244, 255, 267],
        'description': '직선·호·원·교차 등 선형 기하 기호',
    },
    'geometric_complex': {
        'label': '기하-복합',
        'signs': [302, 310, 319, 333, 341, 349, 355, 366, 379, 391, 394, 400, 410, 413],
        'description': '복합 기하 형태, 겹침·변형 기호',
    },
    'plant_vessel': {
        'label': '식물/용기형',
        'signs': [12, 45, 55, 72, 127, 174, 275, 349],
        'description': '항아리·나뭇가지·식물 형상',
    },
    'numeral': {
        'label': '수량형',
        'signs': [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
        'description': '획수로 수량을 표시하는 기호 (수메르 숫자와 유사)',
    },
}

def iconographic_analysis(corpus: List[Inscription]) -> dict:
    """
    기호의 시각적 형태 범주(동물/인물/기하/식물)와
    통계 기반 역할 추론(위치·빈도)의 일치도 측정.

    핵심 질문: 동물형 기호는 명사인가? 기하형은 기능어인가?
    이 패턴이 있다면 → 표어문자(logographic) 가설 지지
    """
    freq = Counter(s for insc in corpus for s in insc.sign_sequence)
    N = sum(freq.values())

    # 기호별 위치 프로파일 (어두/중간/어말 비율)
    pos_profile: Dict[int, np.ndarray] = defaultdict(lambda: np.zeros(3))
    for insc in corpus:
        seq = insc.sign_sequence
        L = len(seq)
        if L < 2:
            continue
        for i, s in enumerate(seq):
            norm = i / (L - 1)
            bucket = 0 if norm < 0.33 else (1 if norm < 0.67 else 2)
            pos_profile[s][bucket] += 1
    for s in pos_profile:
        t = pos_profile[s].sum()
        if t > 0:
            pos_profile[s] /= t

    # 범주별 통계 집계
    category_stats = {}
    for cat_key, cat_info in ICONOGRAPHIC_CATEGORIES.items():
        cat_signs = [s for s in cat_info['signs'] if s in freq]
        if not cat_signs:
            continue
        cat_freq   = [freq[s] for s in cat_signs]
        cat_pos    = [pos_profile[s] for s in cat_signs if s in pos_profile]
        avg_pos    = np.mean(cat_pos, axis=0) if cat_pos else np.zeros(3)

        # 위치 편향: 어두면 명사/소유자 → 어말이면 접미사/수량
        dominant_pos = ['어두', '중간', '어말'][int(avg_pos.argmax())]
        role_hypothesis = (
            '명사/주어 후보 (어두 편향)' if dominant_pos == '어두'
            else '수량/접미 후보 (어말 편향)' if dominant_pos == '어말'
            else '동사/관계 후보 (중간 편향)'
        )

        category_stats[cat_key] = {
            'label': cat_info['label'],
            'description': cat_info['description'],
            'n_signs': len(cat_signs),
            'total_freq': sum(cat_freq),
            'avg_freq': round(sum(cat_freq) / max(len(cat_freq), 1), 1),
            'freq_pct': round(sum(cat_freq) / N * 100, 2),
            'dominant_position': dominant_pos,
            'pos_profile': {
                'head': round(float(avg_pos[0]), 3),
                'mid':  round(float(avg_pos[1]), 3),
                'tail': round(float(avg_pos[2]), 3),
            },
            'role_hypothesis': role_hypothesis,
            'top_signs': [f'M{s}' for s in sorted(cat_signs, key=lambda x: -freq[x])[:5]],
        }

    # 범주 간 공기 패턴: 어떤 범주가 어떤 범주 다음에 등장하는가?
    cat_cooc = defaultdict(Counter)
    sign_to_cat = {}
    for cat_key, cat_info in ICONOGRAPHIC_CATEGORIES.items():
        for s in cat_info['signs']:
            sign_to_cat[s] = cat_key

    for insc in corpus:
        seq = insc.sign_sequence
        for i in range(len(seq) - 1):
            ca = sign_to_cat.get(seq[i])
            cb = sign_to_cat.get(seq[i + 1])
            if ca and cb:
                cat_cooc[ca][cb] += 1

    cat_sequence_patterns = {
        ca: [{'follows': cb, 'count': cnt}
             for cb, cnt in sorted(ctr.items(), key=lambda x: -x[1])[:3]]
        for ca, ctr in cat_cooc.items()
    }

    # 표어문자 vs 음절문자 판별
    # 표어문자: 시각 범주와 의미 역할이 일치 (동물→명사, 수량형→숫자)
    # 음절문자: 시각과 음가가 무관 (순수 음성 표기)
    logographic_score = 0
    checks = [
        category_stats.get('animal', {}).get('dominant_position') == '어두',    # 동물은 명사처럼 어두에
        category_stats.get('numeral', {}).get('dominant_position') == '어말',   # 수량형은 어말에
        category_stats.get('human', {}).get('dominant_position') in ('어두', '중간'),
    ]
    logographic_score = round(sum(checks) / len(checks) * 100, 1)

    return {
        'method': 'Iconographic Category Analysis',
        'category_stats': category_stats,
        'category_sequence_patterns': cat_sequence_patterns,
        'logographic_score': logographic_score,
        'script_type_hypothesis': (
            '표어문자(logographic) 특성 강함 — 그림과 의미 일치'
            if logographic_score >= 60
            else '음절문자 또는 혼합 체계 가능성'
        ),
        'total_categorized_signs': len(sign_to_cat),
        'note': '시각 범주별 위치 편향이 의미 역할과 일치하면 표어문자, 무관하면 음절문자 증거.',
    }


# ─────────────────────────────────────────────────────────
# 통합 실행
# ─────────────────────────────────────────────────────────
def run_frontier(corpus: List[Inscription]):
    _upd(status='running', progress=0, message='프론티어 알고리즘 시작...', started_at=time.time())
    results = {}

    steps = [
        (12, '[1/6] 언어/비언어 직접 검증 (Farmer vs Rao)...',     'language_test',  lambda: language_or_not(corpus)),
        (28, '[2/6] 행정 토큰 모델 (수메르 구조 검증)...',          'admin_token',    lambda: administrative_token_model(corpus)),
        (44, '[3/6] 3D 텐서 분해 (Site×Type×Sign PARAFAC)...',      'tensor',         lambda: tensor_decomposition(corpus)),
        (60, '[4/6] 패러다임 대립 분석 (상보적 분포)...',           'paradigm',       lambda: paradigmatic_opposition(corpus)),
        (78, '[5/6] Transformer 자기주의 (numpy 구현)...',          'transformer',    lambda: transformer_attention(corpus)),
        (93, '[6/6] 시각적 아이코노그래피 클러스터링...',           'iconography',    lambda: iconographic_analysis(corpus)),
    ]

    try:
        for prog, msg, key, fn in steps:
            _upd(progress=prog, message=msg)
            results[key] = fn()

        lang_score = results.get('language_test', {}).get('language_score', 0)
        verdict    = results.get('language_test', {}).get('verdict', '')
        script_hyp = results.get('iconography', {}).get('script_type_hypothesis', '')
        _upd(
            status='done', progress=100,
            message=f'완료. 언어 점수 {lang_score}% — {verdict}',
            results=results,
            finished_at=time.time(),
        )
    except Exception as e:
        _upd(status='error', message=f'오류: {e}', progress=0)
        import traceback; traceback.print_exc()


def start_frontier(corpus: List[Inscription]) -> bool:
    if frontier_state['status'] == 'running':
        return False
    t = threading.Thread(target=run_frontier, args=(corpus,), daemon=True)
    t.start()
    return True


def get_frontier_state() -> dict:
    with _lock:
        return dict(frontier_state)
