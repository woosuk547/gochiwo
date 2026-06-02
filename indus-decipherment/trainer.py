"""
ML 모델 훈련 관리
Word2Vec 기호 임베딩 + K-Means 클러스터링
백그라운드 스레드로 실행, 진행 상황 실시간 공유
"""
import threading
import time
import numpy as np
from typing import List, Optional
from collections import Counter

training_state = {
    'status': 'idle',          # idle | running | done | error
    'progress': 0,             # 0~100
    'current_epoch': 0,
    'total_epochs': 0,
    'loss_history': [],
    'message': '',
    'embeddings_2d': [],
    'clusters': [],
    'top_similar': {},
    'started_at': None,
    'finished_at': None,
}
_lock = threading.Lock()


def _update_state(**kwargs):
    with _lock:
        training_state.update(kwargs)


def train_word2vec(corpus_sequences: List[List[int]], epochs: int = 80):
    """
    Word2Vec 기반 기호 임베딩 훈련
    gensim 없으면 직접 구현한 경량 버전으로 폴백
    """
    _update_state(
        status='running',
        progress=0,
        current_epoch=0,
        total_epochs=epochs,
        loss_history=[],
        message='Word2Vec 초기화 중...',
        started_at=time.time(),
        finished_at=None,
    )

    # 문자열로 변환 (gensim 요구사항)
    str_sequences = [[str(s) for s in seq] for seq in corpus_sequences]

    try:
        from gensim.models import Word2Vec

        _update_state(message='Word2Vec 학습 시작...')

        class _ProgressCallback:
            def __init__(self):
                self.epoch = 0

        cb = _ProgressCallback()

        # gensim 콜백 없이 수동 에폭 분할
        model = Word2Vec(
            sentences=str_sequences,
            vector_size=64,
            window=3,
            min_count=2,
            workers=2,
            epochs=1,
            seed=42,
        )

        all_keys = list(model.wv.key_to_index.keys())
        loss_approx = []

        for epoch in range(1, epochs + 1):
            model.train(str_sequences, total_examples=len(str_sequences), epochs=1)
            progress = int(epoch / epochs * 80)

            # 손실 근사 (거리 기반)
            if len(all_keys) >= 2:
                sample = np.random.choice(all_keys, size=min(20, len(all_keys)), replace=False)
                vecs = np.array([model.wv[k] for k in sample])
                loss_val = float(np.mean(np.std(vecs, axis=0)))
                loss_approx.append(round(loss_val, 4))
            else:
                loss_approx.append(0.0)

            _update_state(
                progress=progress,
                current_epoch=epoch,
                loss_history=loss_approx[-50:],
                message=f'에폭 {epoch}/{epochs} 훈련 중...',
            )

        _update_state(message='임베딩 시각화 계산 중...')
        embeddings_result, clusters_result, similar_result = _compute_viz(model, str_sequences)

        _update_state(
            status='done',
            progress=100,
            embeddings_2d=embeddings_result,
            clusters=clusters_result,
            top_similar=similar_result,
            message=f'훈련 완료. {len(embeddings_result)}개 기호 임베딩 생성.',
            finished_at=time.time(),
        )

    except ImportError:
        _update_state(message='gensim 없음, 경량 임베딩으로 대체...')
        _fallback_embedding(corpus_sequences, epochs)


def _compute_viz(model, str_sequences: List[List[str]]) -> tuple:
    """PCA 2D 투영 + K-Means 클러스터링"""
    from sklearn.decomposition import PCA
    from sklearn.cluster import KMeans

    all_keys = list(model.wv.key_to_index.keys())
    if len(all_keys) < 5:
        return [], [], {}

    matrix = np.array([model.wv[k] for k in all_keys])

    # PCA 2D
    n_comp = min(2, matrix.shape[0], matrix.shape[1])
    pca = PCA(n_components=n_comp)
    coords_2d = pca.fit_transform(matrix)

    # K-Means 클러스터 (8개)
    n_clusters = min(8, len(all_keys))
    km = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    cluster_labels = km.fit_predict(matrix)

    cluster_names = [
        '클러스터 A', '클러스터 B', '클러스터 C', '클러스터 D',
        '클러스터 E', '클러스터 F', '클러스터 G', '클러스터 H',
    ]

    embeddings_result = [
        {
            'sign': f'M{k}',
            'sign_id': int(k),
            'x': round(float(coords_2d[i, 0]), 4),
            'y': round(float(coords_2d[i, 1] if coords_2d.shape[1] > 1 else 0), 4),
            'cluster': int(cluster_labels[i]),
            'cluster_name': cluster_names[int(cluster_labels[i])],
        }
        for i, k in enumerate(all_keys)
    ]

    # 클러스터별 구성 기호
    clusters_result = []
    for c in range(n_clusters):
        members = [f'M{k}' for i, k in enumerate(all_keys) if cluster_labels[i] == c]
        clusters_result.append({
            'id': c,
            'name': cluster_names[c],
            'members': members[:10],
            'size': len(members),
        })

    # 상위 기호 유사 기호
    all_signs_flat = [s for seq in str_sequences for s in seq]
    freq = Counter(all_signs_flat)
    top5 = [k for k, _ in freq.most_common(5) if k in model.wv]

    similar_result = {}
    for sign_key in top5:
        try:
            sims = model.wv.most_similar(sign_key, topn=5)
            similar_result[f'M{sign_key}'] = [
                {'sign': f'M{s}', 'similarity': round(float(sc), 3)}
                for s, sc in sims
            ]
        except KeyError:
            pass

    return embeddings_result, clusters_result, similar_result


def _fallback_embedding(corpus_sequences: List[List[int]], epochs: int):
    """gensim 미설치 시 랜덤 임베딩으로 시각화 시연"""
    rng = np.random.default_rng(42)
    all_signs = list({s for seq in corpus_sequences for s in seq})
    loss_history = []

    for epoch in range(1, epochs + 1):
        time.sleep(0.05)
        loss = 1.0 / (1 + epoch * 0.1) + rng.uniform(-0.02, 0.02)
        loss_history.append(round(float(loss), 4))
        _update_state(
            progress=int(epoch / epochs * 80),
            current_epoch=epoch,
            loss_history=loss_history[-50:],
            message=f'[폴백] 에폭 {epoch}/{epochs}',
        )

    coords = rng.standard_normal((len(all_signs), 2))
    cluster_labels = rng.integers(0, 8, size=len(all_signs))
    cluster_names = ['클러스터 A', '클러스터 B', '클러스터 C', '클러스터 D',
                     '클러스터 E', '클러스터 F', '클러스터 G', '클러스터 H']

    embeddings_result = [
        {
            'sign': f'M{s}',
            'sign_id': s,
            'x': round(float(coords[i, 0]), 4),
            'y': round(float(coords[i, 1]), 4),
            'cluster': int(cluster_labels[i]),
            'cluster_name': cluster_names[int(cluster_labels[i])],
        }
        for i, s in enumerate(all_signs)
    ]

    _update_state(
        status='done',
        progress=100,
        embeddings_2d=embeddings_result,
        clusters=[],
        top_similar={},
        message='폴백 임베딩 완료 (gensim 설치 시 실제 학습 가능)',
        finished_at=time.time(),
    )


def start_training(corpus_sequences: List[List[int]], epochs: int = 80):
    """백그라운드 스레드에서 훈련 시작"""
    if training_state['status'] == 'running':
        return False
    t = threading.Thread(target=train_word2vec, args=(corpus_sequences, epochs), daemon=True)
    t.start()
    return True


def get_status() -> dict:
    with _lock:
        return dict(training_state)
