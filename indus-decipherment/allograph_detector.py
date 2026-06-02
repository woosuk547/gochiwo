"""
allograph_detector.py
─────────────────────
인더스 문자 Allograph(동일 기호의 시각적 변형) 자동 감지 모듈.

sign_features/ 디렉토리의 P*.json 파일에서 각 기호의 feature 구조를 로드하고,
feature 키 원-핫(one-hot) 인코딩을 기반으로 코사인 유사도를 계산하여
시각적으로 유사한 기호들을 클러스터링한다.

벡터화 전략:
  - 전체 131개 unique feature 키를 어휘집(vocabulary)으로 구축
  - 각 기호의 feature 키 보유 여부를 원-핫 벡터로 표현
  - feature가 정수 배열인 경우 그대로 사용 (폴백)
  - 두 기호가 동일한 feature 집합을 가질수록 유사도가 높아짐

클러스터 내에서 phoneme이 이미 할당된 기호의 음가를 미해독 기호에 전파한다
(confidence 0.1 감점).

의존성: numpy (없으면 순수 Python으로 폴백)
"""

import json
import logging
from copy import deepcopy
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# sign_features 디렉토리 경로
_FEATURES_DIR = Path(__file__).parent / "sign_features"

# numpy 사용 가능 여부 확인
try:
    import numpy as np
    _NUMPY_AVAILABLE = True
except ImportError:
    _NUMPY_AVAILABLE = False
    logger.warning("numpy 미설치 — 순수 Python으로 코사인 유사도 계산")


# ── feature vocabulary 구축 ─────────────────────────────────────

def _build_feature_vocabulary(json_files: List[Path]) -> List[str]:
    """
    모든 P*.json 파일에서 feature 키를 수집해 정렬된 어휘집을 반환.
    어휘집 인덱스가 원-핫 벡터의 차원 번호가 된다.
    """
    vocab: Set[str] = set()
    for fpath in json_files:
        try:
            with open(fpath, encoding="utf-8") as f:
                data = json.load(f)
            for item in data.get("features", []):
                if isinstance(item, dict):
                    for key in item:
                        if key != "description":
                            vocab.add(key)
        except (ValueError, KeyError, OSError):
            pass
    return sorted(vocab)


def _features_to_onehot(
    features: list, vocab: List[str]
) -> Optional[List[float]]:
    """
    features 배열을 어휘집 기반 원-핫 벡터로 변환.

    features 배열 형태:
      1. 객체 배열: [{"feature_name": "integer", "description": "..."}, ...]
         → 보유한 feature 키의 인덱스를 1.0으로 설정
      2. 정수 배열: [0, 1, 0, 2, 1]
         → vocab이 비어있으면 그대로 반환

    반환: float 리스트, 변환 불가 시 None
    """
    if not features:
        return None

    if isinstance(features[0], dict):
        if not vocab:
            return None
        # 이 기호가 보유한 feature 키 집합 추출
        present_keys: Set[str] = set()
        for item in features:
            for key in item:
                if key != "description":
                    present_keys.add(key)
        if not present_keys:
            return None
        # 원-핫 벡터: 어휘집 크기만큼, 보유 키 인덱스를 1.0으로
        vec = [1.0 if k in present_keys else 0.0 for k in vocab]
        return vec

    # 정수/숫자 배열 형태 — 그대로 사용
    try:
        vec = [float(v) for v in features]
        return vec if vec else None
    except (TypeError, ValueError):
        return None


def _pad_vectors(
    v1: List[float], v2: List[float]
) -> Tuple[List[float], List[float]]:
    """두 벡터의 길이를 0 패딩으로 맞춤."""
    max_len = max(len(v1), len(v2))
    v1 = v1 + [0.0] * (max_len - len(v1))
    v2 = v2 + [0.0] * (max_len - len(v2))
    return v1, v2


# ── 코사인 유사도 ────────────────────────────────────────────────

def _cosine_similarity_python(v1: List[float], v2: List[float]) -> float:
    """순수 Python 코사인 유사도 계산."""
    v1, v2 = _pad_vectors(v1, v2)
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = sum(a * a for a in v1) ** 0.5
    norm2 = sum(b * b for b in v2) ** 0.5
    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0
    return dot / (norm1 * norm2)


# ── 공개 API ────────────────────────────────────────────────────

def load_sign_features() -> Dict[int, dict]:
    """
    sign_features/P*.json 파일을 전체 로드하여 feature vector를 추출한다.

    1단계: 모든 파일을 스캔하여 feature 키 어휘집(vocabulary) 구축
    2단계: 각 기호의 feature 키를 원-핫 벡터로 변환

    반환: Dict[sign_id(int), {
        'label': str,          # 예: 'P050'
        'description': str,
        'raw_features': list,  # 원본 features 배열
        'vector': List[float], # 원-핫 인코딩 벡터 (어휘집 크기)
        'feature_keys': list,  # 이 기호가 보유한 feature 키 목록
    }]

    features가 없거나 변환 불가한 기호는 결과에서 제외된다.
    """
    result: Dict[int, dict] = {}

    if not _FEATURES_DIR.exists():
        raise FileNotFoundError(
            f"sign_features 디렉토리를 찾을 수 없음: {_FEATURES_DIR}"
        )

    json_files = sorted(_FEATURES_DIR.glob("P*.json"))
    if not json_files:
        raise FileNotFoundError(
            f"sign_features 디렉토리에 P*.json 파일이 없음: {_FEATURES_DIR}"
        )

    # 1단계: feature 키 어휘집 구축
    vocab = _build_feature_vocabulary(json_files)
    logger.info("feature 어휘집 구축 완료: %d개 고유 키", len(vocab))

    loaded = 0
    skipped = 0

    for fpath in json_files:
        try:
            with open(fpath, encoding="utf-8") as f:
                data = json.load(f)

            # sign_id 파싱 (파일명에서)
            label = fpath.stem  # 예: P050
            try:
                sign_id = int(label[1:])
            except ValueError:
                logger.warning("sign_id 파싱 실패, 건너뜀: %s", fpath.name)
                skipped += 1
                continue

            raw_features = data.get("features", [])
            if not raw_features:
                skipped += 1
                continue

            # 2단계: 원-핫 벡터 변환
            vector = _features_to_onehot(raw_features, vocab)
            if vector is None:
                skipped += 1
                continue

            # 이 기호가 보유한 feature 키 목록 추출
            feature_keys: List[str] = []
            if isinstance(raw_features[0], dict):
                for item in raw_features:
                    for key in item:
                        if key != "description":
                            feature_keys.append(key)

            result[sign_id] = {
                "label": label,
                "description": data.get("description", ""),
                "raw_features": raw_features,
                "vector": vector,
                "feature_keys": feature_keys,
            }
            loaded += 1

        except (ValueError, KeyError) as e:
            logger.warning("JSON 파싱 오류 (%s): %s — 건너뜀", fpath.name, e)
            skipped += 1
        except FileNotFoundError as e:
            logger.warning("파일 없음: %s — 건너뜀", e)
            skipped += 1

    logger.info(
        "sign_features 로드 완료: %d개 로드, %d개 건너뜀", loaded, skipped
    )
    return result


def compute_similarity_matrix(
    features_dict: Dict[int, dict]
) -> Dict[Tuple[int, int], float]:
    """
    모든 기호 쌍에 대해 코사인 유사도를 계산한다.

    numpy가 설치된 경우 행렬 연산을 사용하고,
    없으면 순수 Python으로 계산한다.

    반환: Dict[(sign_id_i, sign_id_j), similarity(float)]
          (i < j 인 상삼각 쌍만 포함)
    """
    ids = sorted(features_dict.keys())
    n = len(ids)
    similarity_map: Dict[Tuple[int, int], float] = {}

    if n == 0:
        return similarity_map

    if _NUMPY_AVAILABLE:
        # 최대 차원 길이에 맞춰 패딩 후 numpy 배열 생성 (float64 명시)
        max_dim = max(len(features_dict[i]["vector"]) for i in ids)
        matrix = np.zeros((n, max_dim), dtype=np.float64)

        for row, sid in enumerate(ids):
            vec = features_dict[sid]["vector"]
            matrix[row, : len(vec)] = np.array(vec, dtype=np.float64)

        # L2 정규화
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        # 영벡터는 정규화 생략 (1.0으로 대체해 0 벡터 유지)
        norms = np.where(norms == 0.0, 1.0, norms)
        normalized = matrix / norms

        # 코사인 유사도 = 정규화된 행렬의 내적 (NaN/Inf → 0으로 처리)
        # errstate로 부동소수점 경고 억제 (정규화 후 안전)
        with np.errstate(divide="ignore", invalid="ignore", over="ignore"):
            cos_matrix = normalized @ normalized.T
        cos_matrix = np.nan_to_num(cos_matrix, nan=0.0, posinf=1.0, neginf=0.0)

        for i in range(n):
            for j in range(i + 1, n):
                similarity_map[(ids[i], ids[j])] = float(cos_matrix[i, j])
    else:
        # 순수 Python 폴백
        for i in range(n):
            for j in range(i + 1, n):
                sim = _cosine_similarity_python(
                    features_dict[ids[i]]["vector"],
                    features_dict[ids[j]]["vector"],
                )
                similarity_map[(ids[i], ids[j])] = sim

    return similarity_map


def cluster_allographs(
    features_dict: Dict[int, dict],
    threshold: float = 0.85,
) -> Dict[int, List[int]]:
    """
    유사도 threshold 이상인 기호 쌍을 Union-Find로 묶어 allograph 그룹을 반환.

    반환: Dict[sign_id, List[sign_id]]
          같은 그룹에 속한 모든 sign_id 리스트 (자기 자신 포함).
          그룹 크기 1인 기호(유사 기호 없음)는 결과에서 제외된다.
    """
    if not features_dict:
        return {}

    similarity_map = compute_similarity_matrix(features_dict)

    # Union-Find 초기화
    ids = sorted(features_dict.keys())
    parent = {sid: sid for sid in ids}

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # 경로 압축
            x = parent[x]
        return x

    def union(x: int, y: int) -> None:
        px, py = find(x), find(y)
        if px != py:
            parent[py] = px

    # threshold 이상인 쌍을 같은 그룹으로 묶음
    for (i, j), sim in similarity_map.items():
        if sim >= threshold:
            union(i, j)

    # 그룹별 sign_id 수집
    groups: Dict[int, List[int]] = {}
    for sid in ids:
        root = find(sid)
        groups.setdefault(root, []).append(sid)

    # 그룹 크기 1인 항목 제거 (allograph 아님)
    allograph_groups = {
        root: sorted(members)
        for root, members in groups.items()
        if len(members) > 1
    }

    logger.info(
        "allograph 클러스터링 완료: %d개 그룹 (threshold=%.2f)",
        len(allograph_groups),
        threshold,
    )
    return allograph_groups


def propagate_phonemes(
    rebus_map: Optional[Dict[int, dict]],
    allograph_groups: Dict[int, List[int]],
) -> Dict[int, dict]:
    """
    allograph 그룹 내에서 confidence가 가장 높은 기호의 phoneme을
    phoneme이 없는 기호에 전파한다 (confidence - 0.1).

    반환: 업데이트된 rebus_map의 깊은 복사본.
          rebus_map이 None이면 빈 dict 반환.
    """
    if not rebus_map:
        return {}

    updated = deepcopy(rebus_map)
    propagated_count = 0

    for root, members in allograph_groups.items():
        # 그룹 내 phoneme이 있는 기호 중 confidence 최고값 찾기
        best_entry: Optional[dict] = None
        best_confidence = -1.0

        for sid in members:
            entry = updated.get(sid)
            if entry is None:
                continue
            phoneme = entry.get("phoneme")
            confidence = entry.get("confidence", 0.0)
            if phoneme and phoneme != "?" and confidence > best_confidence:
                best_confidence = confidence
                best_entry = entry

        if best_entry is None:
            # 그룹 내 해독된 기호 없음 — 전파 불가
            continue

        # phoneme이 없거나 '?'인 기호에 전파
        for sid in members:
            if sid not in updated:
                # rebus_map에 없는 sign_id는 새 항목으로 추가
                updated[sid] = {
                    "id": sid,
                    "label": f"P{sid:03d}",
                    "phoneme": best_entry["phoneme"],
                    "reading": best_entry.get("reading", ""),
                    "meaning": best_entry.get("meaning", ""),
                    "confidence": max(0.0, best_confidence - 0.1),
                    "source": f"allograph propagation from P{best_entry.get('id', '?'):03d}"
                    if isinstance(best_entry.get("id"), int)
                    else "allograph propagation",
                    "status": "propagated",
                }
                propagated_count += 1
                continue

            entry = updated[sid]
            existing_phoneme = entry.get("phoneme")
            if not existing_phoneme or existing_phoneme == "?":
                entry["phoneme"] = best_entry["phoneme"]
                entry["reading"] = best_entry.get("reading", "")
                entry["meaning"] = best_entry.get("meaning", "")
                entry["confidence"] = max(0.0, best_confidence - 0.1)
                entry["source"] = (
                    f"allograph propagation from P{best_entry.get('id', '?'):03d}"
                    if isinstance(best_entry.get("id"), int)
                    else "allograph propagation"
                )
                entry["status"] = "propagated"
                propagated_count += 1

    logger.info("phoneme 전파 완료: %d개 기호에 전파됨", propagated_count)
    return updated


def get_allograph_report(
    allograph_groups: Dict[int, List[int]],
    rebus_map: Optional[Dict[int, dict]],
) -> List[dict]:
    """
    allograph 그룹별 요약 리스트를 반환한다.

    반환: List[{
        'group_id': int,         # 그룹 대표 sign_id
        'members': List[int],    # 그룹 내 모든 sign_id
        'size': int,             # 그룹 크기
        'decoded': List[int],    # phoneme이 있는 sign_id 목록
        'undecoded': List[int],  # phoneme이 없는 sign_id 목록
        'best_phoneme': str,     # 그룹 내 최고 confidence phoneme
        'best_confidence': float,
    }]
    """
    report: List[dict] = []
    rmap = rebus_map or {}

    for root, members in sorted(allograph_groups.items()):
        decoded = []
        undecoded = []
        best_phoneme = "?"
        best_confidence = 0.0

        for sid in members:
            entry = rmap.get(sid)
            phoneme = entry.get("phoneme", "?") if entry else "?"
            confidence = entry.get("confidence", 0.0) if entry else 0.0

            if phoneme and phoneme != "?":
                decoded.append(sid)
                if confidence > best_confidence:
                    best_confidence = confidence
                    best_phoneme = phoneme
            else:
                undecoded.append(sid)

        report.append(
            {
                "group_id": root,
                "members": sorted(members),
                "size": len(members),
                "decoded": decoded,
                "undecoded": undecoded,
                "best_phoneme": best_phoneme,
                "best_confidence": round(best_confidence, 3),
            }
        )

    # 그룹 크기 내림차순 정렬
    report.sort(key=lambda x: x["size"], reverse=True)
    return report
