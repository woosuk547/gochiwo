"""
인더스 문자 코퍼스 관리
Mahadevan(1977) 기반 통계로 현실적 합성 코퍼스 생성
실제 데이터: ~417개 기호, ~3738개 비문, 평균 길이 4.6
"""
import numpy as np
import json
from dataclasses import dataclass
from typing import List, Dict
from pathlib import Path

SITES: Dict[str, str] = {
    'M': 'Mohenjo-daro',
    'H': 'Harappa',
    'C': 'Chanhu-daro',
    'L': 'Lothal',
    'K': 'Kalibangan',
}
SITE_PROPORTIONS = [0.55, 0.25, 0.08, 0.07, 0.05]

OBJECT_TYPES = ['seal', 'tablet', 'pottery', 'copper_tablet', 'bone']
OBJECT_PROPORTIONS = [0.65, 0.20, 0.08, 0.05, 0.02]

TOTAL_SIGNS = 417
TOTAL_INSCRIPTIONS = 3738

# 기호 범주 (의미 추정 기반 — 연구자들의 가설)
SIGN_CATEGORIES = {
    'fish': list(range(59, 75)),        # '물고기' 계열 (가장 빈번)
    'jar': list(range(232, 250)),       # '항아리' 계열
    'human': list(range(1, 20)),        # '인물' 계열
    'plant': list(range(100, 120)),     # '식물' 계열
    'geometric': list(range(300, 350)), # 기하학적 기호
    'other': [],
}


@dataclass
class Inscription:
    id: str
    site_code: str
    site_name: str
    object_type: str
    sign_sequence: List[int]

    @property
    def length(self) -> int:
        return len(self.sign_sequence)


def _generate_sign_probs(rng: np.random.Generator) -> np.ndarray:
    """지프 법칙 기반 기호 출현 확률 생성 (α ≈ 1.05)"""
    ranks = np.arange(1, TOTAL_SIGNS + 1)
    probs = 1.0 / (ranks ** 1.05)
    # 실제 관찰된 상위 10개 기호가 전체의 ~50% 차지하도록 조정
    probs[:10] *= 1.8
    probs /= probs.sum()
    return probs


def generate_corpus(seed: int = 42) -> List[Inscription]:
    """현실적 인더스 문자 합성 코퍼스 생성"""
    rng = np.random.default_rng(seed)
    base_probs = _generate_sign_probs(rng)
    ranks = np.arange(1, TOTAL_SIGNS + 1)
    site_keys = list(SITES.keys())

    inscriptions: List[Inscription] = []

    for idx in range(TOTAL_INSCRIPTIONS):
        site = rng.choice(site_keys, p=SITE_PROPORTIONS)
        obj_type = rng.choice(OBJECT_TYPES, p=OBJECT_PROPORTIONS)

        # 길이 분포: log-normal, 평균 ~4.6, 최대 26
        length = min(26, max(1, int(rng.lognormal(1.3, 0.55))))

        sequence: List[int] = []
        for pos in range(length):
            normalized = pos / max(length - 1, 1)
            p = base_probs.copy()

            # 위치 편향: 특정 기호는 어두/어말 선호
            if normalized < 0.2:       # 첫 번째 위치
                p[SIGN_CATEGORIES['human'][0]:SIGN_CATEGORIES['human'][-1]] *= 3.5
            elif normalized > 0.8:     # 마지막 위치
                p[SIGN_CATEGORIES['jar'][0]:SIGN_CATEGORIES['jar'][-1]] *= 3.0
            else:                      # 중간 위치
                p[SIGN_CATEGORIES['fish'][0]:SIGN_CATEGORIES['fish'][-1]] *= 2.0

            p /= p.sum()
            sign = int(rng.choice(ranks, p=p))
            sequence.append(sign)

        inscriptions.append(Inscription(
            id=f"{site}-{idx + 1:04d}",
            site_code=site,
            site_name=SITES[site],
            object_type=obj_type,
            sign_sequence=sequence,
        ))

    return inscriptions


def get_corpus_stats(corpus: List[Inscription]) -> dict:
    """코퍼스 기본 통계 반환"""
    all_signs = [s for insc in corpus for s in insc.sign_sequence]
    lengths = [insc.length for insc in corpus]

    site_counts = {}
    for insc in corpus:
        site_counts[insc.site_name] = site_counts.get(insc.site_name, 0) + 1

    obj_counts = {}
    for insc in corpus:
        obj_counts[insc.object_type] = obj_counts.get(insc.object_type, 0) + 1

    return {
        'total_inscriptions': len(corpus),
        'total_tokens': len(all_signs),
        'unique_signs': len(set(all_signs)),
        'avg_length': round(float(np.mean(lengths)), 2),
        'max_length': int(np.max(lengths)),
        'min_length': int(np.min(lengths)),
        'std_length': round(float(np.std(lengths)), 2),
        'site_distribution': site_counts,
        'object_distribution': obj_counts,
    }
