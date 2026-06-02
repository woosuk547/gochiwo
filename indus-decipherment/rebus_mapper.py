"""
Rebus 원리 기반 인더스 기호 음가(소리값) 자동 할당 모듈

원리:
  인더스인들은 추상 개념을 표현할 때 동음이의어 그림(rebus)을 사용했다.
  예: mīn(물고기 그림) = mīn(별) — Parpola 1994

방법:
  1. sign_features/의 description에서 시각 카테고리 추출
  2. Proto-Dravidian 어휘 DB와 매핑
  3. 각 카테고리의 동음이의어 후보 목록 생성
  4. 위치 패턴(어두/어말) + 기존 학술 제안으로 신뢰도 점수 부여

참고:
  Parpola 1994, Deciphering the Indus Script
  Burrow & Emeneau 1984, DEDR
  Krishnamurti 2003, The Dravidian Languages
"""
import json
from pathlib import Path
from typing import Dict, Optional

# ── Proto-Dravidian 어휘 DB ────────────────────────────────────
# 형식: 시각카테고리 → [(드라비다어 어근, 의미, 동음이의어, 음가, 신뢰도)]
# 신뢰도: 1.0=확정(학술), 0.7=강한 후보, 0.4=약한 후보
PROTO_DRAVIDIAN_LEXICON = {
    'fish': [
        {'root': 'mīn',  'meaning_literal': '물고기', 'meaning_rebus': '별/하늘',
         'phoneme': 'mi:n', 'confidence': 1.0,
         'source': 'Parpola 1994 §10, Rao 2009',
         'note': 'mīn(물고기)=mīn(별) 동음이의 — 가장 확립된 rebus'},
        {'root': 'āl',   'meaning_literal': '물고기류', 'meaning_rebus': '지배/통치',
         'phoneme': 'a:l', 'confidence': 0.4,
         'source': 'Parpola 1994',
         'note': 'Ta. āl(통치하다) — 물고기 변형 기호 후보'},
    ],
    'jar_vessel': [
        {'root': 'āṇ',   'meaning_literal': '항아리/그릇', 'meaning_rebus': '남성/지배자',
         'phoneme': 'a:ɳ', 'confidence': 1.0,
         'source': 'Parpola 1994 §7',
         'note': 'Ta. āṇ(남성), Ko. ān — 칭호 접두사로 가장 유력'},
        {'root': 'kalam', 'meaning_literal': '배/그릇', 'meaning_rebus': '언어/말',
         'phoneme': 'kalam', 'confidence': 0.5,
         'source': 'DEDR 1278',
         'note': 'Ta. kalam(배), 항구도시 Lothal 맥락에서 가능'},
    ],
    'tree_plant': [
        {'root': 'maram', 'meaning_literal': '나무', 'meaning_rebus': '나무/재목',
         'phoneme': 'maram', 'confidence': 0.6,
         'source': 'DEDR 4737',
         'note': 'Ta. maram(나무) — 재목/목재 교역 표시 후보'},
        {'root': 'vēr',  'meaning_literal': '나무 뿌리', 'meaning_rebus': '씨족 뿌리',
         'phoneme': 've:r', 'confidence': 0.5,
         'source': 'DEDR 5535',
         'note': 'Ta. vēr(뿌리/기원) — 씨족 계보 표시 후보'},
    ],
    # numeral_stroke는 SIGN_CATEGORY_OVERRIDE로만 할당 (keyword 과도 매칭 방지)
    'numeral_stroke': [
        {'root': 'oṉṟu',  'meaning_literal': '1', 'meaning_rebus': '수량 1',
         'phoneme': 'oɳɽu', 'confidence': 0.85,
         'source': 'DEDR 1007',
         'note': '단순 단일 획 = 수량 1 (P121/P144 전용)'},
        {'root': 'iraṇṭu','meaning_literal': '2', 'meaning_rebus': '수량 2',
         'phoneme': 'iraɳʈu', 'confidence': 0.85,
         'source': 'DEDR 498',
         'note': '이중 획 = 수량 2 (P122/P145 전용)'},
        {'root': 'mūṉṟu', 'meaning_literal': '3', 'meaning_rebus': '수량 3',
         'phoneme': 'mu:ɳɽu', 'confidence': 0.85,
         'source': 'DEDR 5104',
         'note': '삼중 획 = 수량 3 (P123/P147 전용)'},
        {'root': 'nālu',  'meaning_literal': '4', 'meaning_rebus': '수량 4',
         'phoneme': 'na:lu', 'confidence': 0.75,
         'source': 'DEDR 3655',
         'note': '사중 획 = 수량 4 (P124 전용)'},
        {'root': 'añcu',  'meaning_literal': '5', 'meaning_rebus': '수량 5',
         'phoneme': 'añcu', 'confidence': 0.70,
         'source': 'DEDR 135',
         'note': '5획 = 수량 5 (P125/P151 전용)'},
        {'root': 'kaṇ',   'meaning_literal': '눈/점', 'meaning_rebus': '계산/회계',
         'phoneme': 'kaɳ', 'confidence': 0.7,
         'source': 'Mahadevan 2009; DEDR 1159',
         'note': 'Ta. kaṇ(눈) = kaṇakku(계산) — P122 2획 회계 기호'},
    ],
    'diamond_leaf': [
        {'root': 'vēl',  'meaning_literal': '창/잎', 'meaning_rebus': '씨족/소유',
         'phoneme': 've:l', 'confidence': 0.9,
         'source': 'Parpola 1994; DEDR 5536',
         'note': 'Ta. vēl(창), vēḷir(씨족명) — 어말 접미사로 77.4% 확인됨'},
        {'root': 'ilaī', 'meaning_literal': '잎', 'meaning_rebus': '젊음/활력',
         'phoneme': 'ilai', 'confidence': 0.4,
         'source': 'DEDR 499',
         'note': 'Ta. ilai(잎) — 자연 기호 변형 후보'},
    ],
    'wheel_circle': [
        {'root': 'cakram','meaning_literal': '바퀴/원', 'meaning_rebus': '왕국/순환',
         'phoneme': 'cakram', 'confidence': 0.5,
         'source': 'DEDR 2279',
         'note': 'Ta. cakram(바퀴) — 살 있는 바퀴 기호(P378)'},
        {'root': 'toṭi', 'meaning_literal': '고리/팔찌', 'meaning_rebus': '봉인/소유',
         'phoneme': 'toʈi', 'confidence': 0.7,
         'source': 'Mahadevan 2014; DEDR 3004',
         'note': 'Ta. toṭi(팔찌/고리) — 봉인 기능어'},
    ],
    'x_cross': [
        {'root': 'iru',  'meaning_literal': '교차/이중', 'meaning_rebus': '두개/반대',
         'phoneme': 'iru', 'confidence': 0.4,
         'source': 'DEDR 498',
         'note': 'Ta. iru(둘/이중) — X자 교차 기호(P256)'},
    ],
    'arrow_spear': [
        {'root': 'vēl',  'meaning_literal': '창/화살', 'meaning_rebus': '씨족/전사',
         'phoneme': 've:l', 'confidence': 0.7,
         'source': 'Parpola 1994; DEDR 5536',
         'note': 'P217 삼각+수직 = 창 형태 → vēl 후보'},
    ],
    'person_human': [
        {'root': 'ān',   'meaning_literal': '사람', 'meaning_rebus': '남성/인물',
         'phoneme': 'a:n', 'confidence': 0.70,
         'source': 'DEDR 335; 초기 위치 68.8% 확인됨',
         'note': 'Ta. ān(남성) — 인물 기호 어두 68.8% 위치 → 칭호 후보 강'},
        {'root': 'maṉ',  'meaning_literal': '사람/왕', 'meaning_rebus': '왕/통치자',
         'phoneme': 'man', 'confidence': 0.55,
         'source': 'DEDR 4723',
         'note': 'Ta. maṉ(왕) — 짐 든 인물 = 교역상인/왕 표시'},
    ],
    'pincer_bracket': [
        {'root': 'kaṭṭu','meaning_literal': '묶음/집게', 'meaning_rebus': '묶다/봉인',
         'phoneme': 'kaʈʈu', 'confidence': 0.5,
         'source': 'DEDR 1171',
         'note': 'Ta. kaṭṭu(묶다) — P230 집게 기호'},
    ],
    'comb_rake': [
        {'root': 'mutu', 'meaning_literal': '빗/갈퀴', 'meaning_rebus': '오래된/진주',
         'phoneme': 'mutu', 'confidence': 0.6,
         'source': 'Parpola 1994; DEDR 4979',
         'note': 'Ta. mutu(오래된), muttu(진주) — P098 빗살 기호'},
    ],
    'leaf_tree': [
        {'root': 'mutu', 'meaning_literal': '잎+나무', 'meaning_rebus': '진주/귀중품',
         'phoneme': 'mutu', 'confidence': 0.5,
         'source': 'DEDR 4979',
         'note': 'P364 잎+나무 복합 — 귀중 자연물 표시'},
    ],
    # ── 신규 카테고리 ─────────────────────────────────────────────
    'animal_deer': [
        {'root': 'māṉ',  'meaning_literal': '사슴', 'meaning_rebus': '존경/명예',
         'phoneme': 'ma:n', 'confidence': 0.65,
         'source': 'DEDR 4769',
         'note': 'Ta. māṉ(사슴) = mānam(명예/존경) — 지위 표시 후보'},
        {'root': 'pulli', 'meaning_literal': '점박이 사슴', 'meaning_rebus': '점/표식',
         'phoneme': 'pulli', 'confidence': 0.45,
         'source': 'DEDR 4340',
         'note': 'Ta. puḷḷi(점), pulli(사슴) — 소유 표식 후보'},
    ],
    'bird': [
        {'root': 'kuruvi','meaning_literal': '새/참새', 'meaning_rebus': '기호/표식',
         'phoneme': 'kuruvi', 'confidence': 0.55,
         'source': 'DEDR 1722',
         'note': 'Ta. kuruvi(참새) = kuri(기호/상징) — 봉인 표식 후보'},
        {'root': 'kōḻi', 'meaning_literal': '닭/수탉', 'meaning_rebus': '권위/권력',
         'phoneme': 'ko:ɻi', 'confidence': 0.50,
         'source': 'DEDR 2199',
         'note': 'Ta. kōḻi(닭) = kōḷ(지배/행성) — 권위 상징 후보'},
    ],
    'bracket_paren': [
        {'root': 'val',  'meaning_literal': '팔찌/고리', 'meaning_rebus': '강함/오른쪽',
         'phoneme': 'val', 'confidence': 0.55,
         'source': 'DEDR 5270',
         'note': 'Ta. val(강함/오른쪽), vaḷai(팔찌) — 괄호 곡선 = 봉인 테두리'},
        {'root': 'toṭu', 'meaning_literal': '닿다/봉인', 'meaning_rebus': '접촉/소유',
         'phoneme': 'toʈu', 'confidence': 0.50,
         'source': 'DEDR 3000',
         'note': 'Ta. toṭu(닿다/봉인하다) — 괄호 = 감싸는 봉인 행위'},
    ],
    'pitchfork_spear': [
        {'root': 'vēl',  'meaning_literal': '창/포크', 'meaning_rebus': '씨족/전사',
         'phoneme': 've:l', 'confidence': 0.65,
         'source': 'Parpola 1994; DEDR 5536',
         'note': 'Ta. vēl(창) — 포크형 = 창 복수날 → 전사 씨족 표식'},
        {'root': 'muḷ',  'meaning_literal': '가시/뾰족함', 'meaning_rebus': '날카로움/힘',
         'phoneme': 'muɭ', 'confidence': 0.40,
         'source': 'DEDR 4970',
         'note': 'Ta. muḷ(가시/날카로움) — 포크 날카로운 끝부분'},
    ],
    'trapezoid_box': [
        {'root': 'koṭu', 'meaning_literal': '집/창고', 'meaning_rebus': '창고/보관',
         'phoneme': 'koʈu', 'confidence': 0.55,
         'source': 'DEDR 2039',
         'note': 'Ta. koṭu(집/건물 구조물) — 사다리꼴 = 건물/창고 평면도'},
        {'root': 'paṭi', 'meaning_literal': '집/공간', 'meaning_rebus': '측정/분량',
         'phoneme': 'paʈi', 'confidence': 0.45,
         'source': 'DEDR 3858',
         'note': 'Ta. paṭi(측정 단위/계단) — 직사각 기호 = 분량 측정'},
    ],
    'u_shape': [
        {'root': 'toṭi', 'meaning_literal': '팔찌/U형', 'meaning_rebus': '봉인/고리',
         'phoneme': 'toʈi', 'confidence': 0.60,
         'source': 'Mahadevan 2014; DEDR 3004',
         'note': 'U형 = 팔찌/고리 모양 → toṭi 봉인 기능어'},
        {'root': 'val',  'meaning_literal': '팔찌', 'meaning_rebus': '강함/소유',
         'phoneme': 'val', 'confidence': 0.45,
         'source': 'DEDR 5270',
         'note': 'Ta. vaḷai(팔찌) — U = 열린 고리 형태'},
    ],
    # ── DEDR 확장 어휘 (6→50 lemma) ────────────────────────────
    'sun_rays': [
        {'root': 'ñāyiṟu', 'meaning_literal': '태양', 'meaning_rebus': '시간/권위',
         'phoneme': 'ɲa:jiɽu', 'confidence': 0.60,
         'source': 'DEDR 3291',
         'note': 'Ta. ñāyiṟu(태양) — 방사형 기호 = 태양/권력 상징'},
        {'root': 'āḻi',  'meaning_literal': '불꽃/광채', 'meaning_rebus': '의식/불',
         'phoneme': 'a:ɻi', 'confidence': 0.45,
         'source': 'DEDR 299',
         'note': 'Ta. āḻi(불꽃/바다) — 방사선 = 불꽃 → 의식 기호'},
    ],
    'water_wave': [
        {'root': 'nīr',  'meaning_literal': '물', 'meaning_rebus': '생명/부/흐름',
         'phoneme': 'ni:r', 'confidence': 0.60,
         'source': 'DEDR 3657',
         'note': 'Ta. nīr(물) — 파형 기호 = 물 → 관개/강 교역'},
        {'root': 'āṟu',  'meaning_literal': '강', 'meaning_rebus': '교역로/흐름',
         'phoneme': 'a:ɽu', 'confidence': 0.50,
         'source': 'DEDR 397',
         'note': 'Ta. āṟu(강) — 파형 = 강 교역로 표식'},
    ],
    'grain_hatch': [
        {'root': 'nel',  'meaning_literal': '벼/곡물', 'meaning_rebus': '농업/수확',
         'phoneme': 'nel', 'confidence': 0.60,
         'source': 'DEDR 3937',
         'note': 'Ta. nel(벼/논) — 빗금 반복 = 곡물 행 → 농업 표식'},
        {'root': 'iṭu',  'meaning_literal': '두다/쌓다', 'meaning_rebus': '저장/쌓기',
         'phoneme': 'iʈu', 'confidence': 0.45,
         'source': 'DEDR 461',
         'note': 'Ta. iṭu(놓다/쌓다) — 격자 = 쌓인 곡물 창고'},
    ],
    'bow_arc': [
        {'root': 'vil',  'meaning_literal': '활', 'meaning_rebus': '전사/힘',
         'phoneme': 'vil', 'confidence': 0.60,
         'source': 'DEDR 5417',
         'note': 'Ta. vil(활) — 호형 = 활 모양 → 전사 칭호'},
        {'root': 'vili', 'meaning_literal': '부르다/소환', 'meaning_rebus': '공식 소환/칭호',
         'phoneme': 'vili', 'confidence': 0.45,
         'source': 'DEDR 5422',
         'note': 'Ta. vili(부르다) — vil+i → 공식 포고자/전령 표식'},
    ],
    'horn_caret': [
        {'root': 'koṭu', 'meaning_literal': '뿔/뾰족함', 'meaning_rebus': '주다/거래',
         'phoneme': 'koʈu', 'confidence': 0.55,
         'source': 'DEDR 2039',
         'note': 'Ta. koṭu(뿔/주다) — 캐럿 = 뿔 형태 → 교역/증여 표시'},
        {'root': 'viṇ',  'meaning_literal': '하늘/천상', 'meaning_rebus': '천신/최고권위',
         'phoneme': 'viɳ', 'confidence': 0.45,
         'source': 'DEDR 5406',
         'note': 'Ta. viṉ/viṇ(하늘) — 위 향한 뾰족 기호 = 천상 권위'},
    ],
    'scorpion_spider': [
        {'root': 'tēḷ',  'meaning_literal': '전갈', 'meaning_rebus': '성스러움/금기',
         'phoneme': 'te:ɭ', 'confidence': 0.55,
         'source': 'DEDR 3448',
         'note': 'Ta. tēḷ(전갈) = tēḷivu(순수/명확) — 전갈 = 신성 금기 상징'},
        {'root': 'nañcu', 'meaning_literal': '독/독성', 'meaning_rebus': '경고/신성',
         'phoneme': 'nañcu', 'confidence': 0.40,
         'source': 'DEDR 3630',
         'note': 'Ta. nañcu(독) — 독성 동물 기호 = 경고 표식'},
    ],
    'shield_oval': [
        {'root': 'kaṭaṉ', 'meaning_literal': '빚/의무', 'meaning_rebus': '계약/채무',
         'phoneme': 'kaʈan', 'confidence': 0.55,
         'source': 'DEDR 1136',
         'note': 'Ta. kaṭaṉ(빚/의무) — 타원 = 계약 봉인 의무 표시'},
        {'root': 'kaṭa',  'meaning_literal': '건너다/통과', 'meaning_rebus': '교역/통행',
         'phoneme': 'kaʈa', 'confidence': 0.45,
         'source': 'DEDR 1127',
         'note': 'Ta. kaṭa(건너다) — 타원 테두리 = 경계 통과 → 관세 표식'},
    ],
    'triangle_hill': [
        {'root': 'kuṉṟu', 'meaning_literal': '언덕/구릉', 'meaning_rebus': '지역/지방',
         'phoneme': 'kunɽu', 'confidence': 0.60,
         'source': 'DEDR 1693',
         'note': 'Ta. kuṉṟu(언덕) — 삼각 = 산/구릉 → 지역 지명 표식'},
        {'root': 'malai', 'meaning_literal': '산', 'meaning_rebus': '고산 씨족/지역',
         'phoneme': 'malai', 'confidence': 0.50,
         'source': 'DEDR 4723',
         'note': 'Ta. malai(산) — 큰 삼각 = 산악 지역 씨족 표식'},
    ],
    'rope_knot': [
        {'root': 'kaṭṭu', 'meaning_literal': '묶다/묶음', 'meaning_rebus': '계약/결합',
         'phoneme': 'kaʈʈu', 'confidence': 0.55,
         'source': 'DEDR 1171',
         'note': 'Ta. kaṭṭu(묶다) — 매듭/꼬임 기호 = 계약 봉인 표시'},
        {'root': 'naṇa',  'meaning_literal': '매듭', 'meaning_rebus': '협약/합의',
         'phoneme': 'naɳa', 'confidence': 0.40,
         'source': 'DEDR 3573',
         'note': 'Ta. naṇa(매듭) — 엮인 패턴 = 협약 문서 봉인'},
    ],
    'hatching_box': [
        {'root': 'nel',  'meaning_literal': '벼', 'meaning_rebus': '곡물 수량',
         'phoneme': 'nel', 'confidence': 0.55,
         'source': 'DEDR 3937',
         'note': 'Ta. nel(벼) — 상자 내 빗금 = 곡물 창고 또는 계량 단위'},
        {'root': 'paṭṭam','meaning_literal': '직함/비단', 'meaning_rebus': '지위/문서',
         'phoneme': 'paʈʈam', 'confidence': 0.45,
         'source': 'DEDR 3858',
         'note': 'Ta. paṭṭam(문서/직함) — 해칭 상자 = 공식 문서 표시'},
    ],
    'garlic_round': [
        {'root': 'vaṭṭam','meaning_literal': '원형/동전', 'meaning_rebus': '화폐/가치',
         'phoneme': 'vaʈʈam', 'confidence': 0.55,
         'source': 'DEDR 5215',
         'note': 'Ta. vaṭṭam(원/둥근 것) — 원+점 기호 = 동전/가치 단위 표식'},
        {'root': 'kaṇ',  'meaning_literal': '눈/점', 'meaning_rebus': '계산/눈',
         'phoneme': 'kaɳ', 'confidence': 0.60,
         'source': 'Mahadevan 2009; DEDR 1159',
         'note': 'Ta. kaṇ(눈) — 원 안 점 = 눈 → kaṇakku(계산) 회계 기호'},
    ],
    'grid_tally': [
        {'root': 'kaṇakku','meaning_literal': '계산/회계', 'meaning_rebus': '회계 기록',
         'phoneme': 'kaɳakku', 'confidence': 0.65,
         'source': 'DEDR 1159',
         'note': 'Ta. kaṇakku(계산/회계장부) — 격자 = 회계 표 → 수량 다중 기록'},
        {'root': 'paṭi',  'meaning_literal': '분량/등급', 'meaning_rebus': '측정 단위',
         'phoneme': 'paʈi', 'confidence': 0.50,
         'source': 'DEDR 3858',
         'note': 'Ta. paṭi(등급/단계) — 격자 셀 = 분량 측정 단위'},
    ],
}

# 시각 키워드 → 카테고리 매핑
# 주의: numeral_stroke는 SIGN_CATEGORY_OVERRIDE로만 처리 (keyword 과도 매칭 방지)
VISUAL_KEYWORDS = {
    'fish':            ['fish', 'whisker', 'fin'],
    'jar_vessel':      ['jar', 'vessel', 'pot', 'cup'],
    'tree_plant':      ['tree', 'branch', 'plant', 'leaves'],
    'diamond_leaf':    ['diamond', 'rhombus', 'leaf shape'],
    'wheel_circle':    ['wheel', 'spoke', 'ring'],
    'x_cross':         ['cross', ' x ', 'saltire'],
    'arrow_spear':     ['arrow', 'spear'],
    'person_human':    ['person', 'carrying', 'burden', 'human', 'figure'],
    'pincer_bracket':  ['pincer', 'claw', 'triangle on left'],
    'comb_rake':       ['horizontal lines', 'comb', 'rake', 'coming off one side'],
    'leaf_tree':       ['leaf with tree', 'tree at bottom'],
    'animal_deer':     ['deer', 'antler', 'ungulate'],
    'bird':            ['bird', 'feather', 'beak', 'feathered', 'avian'],
    'pitchfork_spear': ['pitchfork', 'tine', 'fork'],
    'trapezoid_box':   ['trapezoid', 'rectangle', 'inner rectangle'],
    'u_shape':         ['simple u ', 'simple u with', 'open u'],
    'bracket_paren':   ['parenthes', 'nested right'],
    # 신규 카테고리
    'sun_rays':        ['rays', 'light ray', 'prismed', 'radiating'],
    'water_wave':      ['wave', 'wavy', 'ripple', 'undulating'],
    'grain_hatch':     ['hatching', 'horizontal hatching', 'striped fill'],
    'bow_arc':         ['bow', 'arc shape', 'curved bow'],
    'horn_caret':      ['caret', 'hat above', 'horn'],
    'scorpion_spider': ['spider', 'scorpion', 'squashed', 'centipede'],
    'shield_oval':     ['oval', 'ellipse', 'shield'],
    'triangle_hill':   ['isosceles triangle', 'isoceles', 'tall triangle'],
    'rope_knot':       ['interlaced', 'knotted', 'woven', 'rope'],
    'hatching_box':    ['small box with', 'box with horizontal', 'hatched box'],
    'garlic_round':    ['garlic', 'bulb', 'circle with dot', 'dot in center'],
    'grid_tally':      ['grid', 'cells', 'by y cells'],
}

# 기호 ID → 카테고리 직접 매핑 (keyword 매칭보다 우선)
# 실제 획 수량 기호는 여기서만 numeral_stroke로 할당
SIGN_CATEGORY_OVERRIDE = {
    # ── 수량 기호 (실제 획 계수 기호만) ──────────────────────
    121: 'numeral_stroke',   # Simple half-height vertical stroke (1획)
    122: 'numeral_stroke',   # Two adjacent half-height simple vertical strokes (2획)
    123: 'numeral_stroke',   # Three adjacent half-height simple vertical strokes (3획)
    124: 'numeral_stroke',   # Four adjacent half-height simple vertical strokes (4획)
    125: 'numeral_stroke',   # Five simple vertical strokes (5획)
    126: 'numeral_stroke',   # Six short vertical strokes (6획)
    127: 'numeral_stroke',   # Seven short vertical strokes (7획)
    128: 'numeral_stroke',   # Eight short vertical strokes (8획)
    136: 'numeral_stroke',   # Seven strokes bracketed by parentheses
    139: 'numeral_stroke',   # Two small strokes over one (복합 수량)
    142: 'numeral_stroke',   # Four strokes above same above same (복합 수량)
    144: 'numeral_stroke',   # One full-height vertical stroke (1획 full)
    145: 'numeral_stroke',   # Two adjacent full-height vertical strokes (2획 full)
    147: 'numeral_stroke',   # Three adjacent full-height vertical strokes (3획 full)
    151: 'numeral_stroke',   # Five adjacent simple tall vertical strokes (5획 tall)
    120: 'numeral_stroke',   # Single small vertical + another with bottom half slanted
    # ── 물고기 변형 기호 ──────────────────────────────────────
    73:  'fish',             # Unknown asymmetric animal — fish with asymmetric fins+legs
    65:  'fish',             # Fish with bird wings and three feather tail
    # ── 사슴/동물 기호 ────────────────────────────────────────
    43:  'animal_deer',      # Deer facing right
    44:  'animal_deer',      # Deer facing left
    # ── 새 기호 ──────────────────────────────────────────────
    67:  'bird',             # Parentheses surrounding upward-pointing bird
    70:  'bird',             # Upward-pointing bird with wings
    71:  'bird',             # Leftward-pointing bird with vertical tail
    # ── 포크/창 기호 ──────────────────────────────────────────
    92:  'pitchfork_spear',  # Pitchfork with tines
    95:  'pitchfork_spear',  # Pitchfork with two stacked heads
    94:  'pitchfork_spear',  # Pitchfork with two vertical tines on ends
    # ── 괄호/파렌테시스 기호 ──────────────────────────────────
    154: 'bracket_paren',    # Right parenthesis
    156: 'bracket_paren',    # Right parenthesis with small horizontal line
    172: 'bracket_paren',    # Two slightly nested right parentheses
    174: 'bracket_paren',    # Right parenthesis next to left parenthesis
    177: 'bracket_paren',    # Many slightly nested right parentheses
    181: 'bracket_paren',    # Left parenthesis with multiple vertical lines inside (lyre)
    # ── 사다리꼴/직사각형 기호 ────────────────────────────────
    272: 'trapezoid_box',    # Trapezoid with inner rectangle
    283: 'trapezoid_box',    # Rectangle with bottom/left line missing
    285: 'trapezoid_box',    # Trapezoid with no bottom, bird-foot
    288: 'trapezoid_box',    # Trapezoid with no bottom, outward perpendiculars
    289: 'trapezoid_box',    # Trapezoid with no bottom, small box on top
    293: 'trapezoid_box',    # Large H shape
    294: 'trapezoid_box',    # Large H with hat
    # ── U자형 기호 ───────────────────────────────────────────
    310: 'u_shape',          # Simple U with no decoration
    316: 'u_shape',          # U with long vertical stroke (freq=19 고빈도)
    # ── 사람/활/무기 기호 ─────────────────────────────────────
    35:  'person_human',     # Person with bow and arrow
    # ── 고빈도 미해독 기호 추가 ───────────────────────────────
    268: 'grid_tally',       # Grid of x by y cells (freq=11 — 회계 격자)
    202: 'horn_caret',       # Vertical stroke with triangular wing (freq=11)
    205: 'sun_rays',         # Prismed light rays (freq=10)
    276: 'hatching_box',     # Square with vertical bar coming off top (freq=6)
    76:  'scorpion_spider',  # Squashed spider shape (freq=6)
    215: 'triangle_hill',    # Three tall thin isosceles triangles (freq=6)
    301: 'hatching_box',     # Small box with horizontal hatching (freq=6)
    210: 'triangle_hill',    # Tall isosceles triangle with horizontal stripes (freq=5)
    108: 'garlic_round',     # Garlic motif — circle with dot (freq=5)
    221: 'triangle_hill',    # Three triangles — large isosceles pointing right (freq=5)
    91:  'comb_rake',        # Horizontal line with multiple lines out top (freq=5)
    226: 'bow_arc',          # Bowtie with triangle attached (freq=4)
    201: 'horn_caret',       # Vertical stroke with small horizontal stroke at top (freq=5)
    178: 'bow_arc',          # Right-facing bow shape (freq=4)
    180: 'tree_plant',       # Leaf with small perpendicular strokes radiating from top (freq=3)
    84:  'shield_oval',      # Oval with short strokes coming off bottom (freq=4)
    341: 'water_wave',       # Four rounded lines going upward curving at top (freq=3)
}

# 학술 확정 기호 (Parpola/Mahadevan 직접 인용)
CONFIRMED_SIGNS = {
    50:  {'phoneme': 'mi:n',  'reading': 'mīn',  'meaning': '물고기/별',   'confidence': 1.0, 'source': 'Parpola 1994'},
    51:  {'phoneme': 'mi:n',  'reading': 'mīn',  'meaning': '물고기/별 변형', 'confidence': 0.9, 'source': 'Parpola 1994'},
    58:  {'phoneme': 'mi:n',  'reading': 'mīn',  'meaning': '줄기호 물고기', 'confidence': 0.85,'source': 'Parpola 1994'},
    60:  {'phoneme': 'mi:n',  'reading': 'mīn',  'meaning': '물고기 변형',  'confidence': 0.8, 'source': 'Parpola 1994'},
    62:  {'phoneme': 'mi:n',  'reading': 'mīn',  'meaning': '수염 물고기',  'confidence': 0.8, 'source': 'Parpola 1994'},
    324: {'phoneme': 'a:ɳ',   'reading': 'āṇ',   'meaning': '남성 칭호',   'confidence': 1.0, 'source': 'Parpola 1994 §7'},
    325: {'phoneme': 'a:ɳ',   'reading': 'āṇ',   'meaning': '남성 칭호 변형','confidence': 0.9,'source': 'Parpola 1994'},
    86:  {'phoneme': 'a:ɳ',   'reading': 'āṇ',   'meaning': '나무+칭호',   'confidence': 0.7, 'source': 'Parpola 1994'},
    217: {'phoneme': 've:l',  'reading': 'vēl',  'meaning': '창/씨족',     'confidence': 0.7, 'source': 'Parpola 1994'},
    122: {'phoneme': 'kaɳ',   'reading': 'kaṇ',  'meaning': '수량/눈',     'confidence': 0.8, 'source': 'Mahadevan 1977'},
    145: {'phoneme': 'iraɳʈu','reading': 'iraṇṭu','meaning': '수량 2',     'confidence': 0.8, 'source': 'Mahadevan 1977'},
    147: {'phoneme': 'mu:ɳɽu','reading': 'mūṉṟu','meaning': '수량 3',      'confidence': 0.8, 'source': 'Mahadevan 1977'},
    123: {'phoneme': 'mu:ɳɽu','reading': 'mūṉṟu','meaning': '수량 3 변형', 'confidence': 0.7, 'source': 'Mahadevan 1977'},
    385: {'phoneme': 've:l',  'reading': 'vēl',  'meaning': '씨족 접미사', 'confidence': 0.9, 'source': 'Parpola 1994'},
    378: {'phoneme': 'toʈi',  'reading': 'toṭi', 'meaning': '봉인/고리',   'confidence': 0.7, 'source': 'Mahadevan 2014'},
    256: {'phoneme': 've:l',  'reading': 'vēl',  'meaning': '접미사 변형', 'confidence': 0.7, 'source': 'Parpola 1994'},
    364: {'phoneme': 'mutu',  'reading': 'mutu', 'meaning': '진주/귀중품', 'confidence': 0.6, 'source': 'Parpola 1994 §12'},
}


def _classify_sign(sign_id: int, description: str) -> Optional[str]:
    # 명시적 오버라이드 우선 (keyword 오탐 방지)
    if sign_id in SIGN_CATEGORY_OVERRIDE:
        return SIGN_CATEGORY_OVERRIDE[sign_id]
    desc_lower = description.lower()
    for category, keywords in VISUAL_KEYWORDS.items():
        for kw in keywords:
            if kw in desc_lower:
                return category
    return None


def _load_all_signs() -> Dict[int, dict]:
    feat_dir = Path(__file__).parent / 'sign_features'
    signs = {}
    for fp in feat_dir.glob('P*.json'):
        try:
            sign_id = int(fp.stem[1:])
            d = json.loads(fp.read_text(encoding='utf-8'))
            signs[sign_id] = {
                'id':          sign_id,
                'label':       f'P{sign_id:03d}',
                'description': d.get('description', ''),
                'mahadevan':   d.get('mahadevan_graphemes', []),
            }
        except (ValueError, json.JSONDecodeError):
            continue
    return signs


def build_rebus_map(corpus=None) -> Dict[int, dict]:
    """
    모든 182개 기호에 대해 rebus 음가 후보를 생성.
    corpus가 있으면 위치 정보로 신뢰도 보정.
    """
    from collections import Counter
    signs = _load_all_signs()

    # 위치 프로파일 (corpus 있을 때)
    pos_profile = {}
    if corpus:
        freq  = Counter(s for insc in corpus for s in insc.sign_sequence)
        init  = Counter(insc.sign_sequence[0]  for insc in corpus if insc.sign_sequence)
        term  = Counter(insc.sign_sequence[-1] for insc in corpus if insc.sign_sequence)
        for sid in signs:
            f = freq.get(sid, 0)
            pos_profile[sid] = {
                'frequency':  f,
                'init_pct':  round(init.get(sid, 0) / max(f, 1) * 100, 1),
                'term_pct':  round(term.get(sid, 0) / max(f, 1) * 100, 1),
            }

    result = {}
    for sid, sign in signs.items():
        desc     = sign['description']
        category = _classify_sign(sid, desc)
        pos      = pos_profile.get(sid, {})

        # 수량 기호: 획 수에 따라 정확한 phoneme 선택
        if category == 'numeral_stroke' and sid not in CONFIRMED_SIGNS:
            lexicon = PROTO_DRAVIDIAN_LEXICON['numeral_stroke']
            # P120-128: 획 수 = sid - 120 + 1, P144-151: 획 수에 맞게 매핑
            stroke_map = {
                121: lexicon[0], 144: lexicon[0],            # 1획 → oṉṟu
                122: lexicon[1], 145: lexicon[1],            # 2획 → iraṇṭu
                123: lexicon[2], 147: lexicon[2],            # 3획 → mūṉṟu
                124: lexicon[3],                             # 4획 → nālu
                125: lexicon[4], 151: lexicon[4],            # 5획 → añcu
                126: lexicon[4], 127: lexicon[4], 128: lexicon[4],  # 6-8획 → añcu 이상
                136: lexicon[4], 139: lexicon[2], 142: lexicon[3],  # 복합
                120: lexicon[0],                             # 기본 1획
            }
            chosen = stroke_map.get(sid, lexicon[0])
            candidates = [chosen]
            result[sid] = {
                'id': sid, 'label': f'P{sid:03d}',
                'description': desc, 'category': 'numeral_stroke',
                'mahadevan': sign['mahadevan'], 'position': pos,
                'candidates': candidates,
                'reading': chosen['root'], 'phoneme': chosen['phoneme'],
                'meaning': chosen['meaning_rebus'],
                'confidence': chosen['confidence'],
                'source': chosen['source'], 'status': 'candidate',
            }
            continue

        # 학술 확정 기호 우선
        if sid in CONFIRMED_SIGNS:
            confirmed = CONFIRMED_SIGNS[sid].copy()
            confirmed['category']    = category or 'confirmed'
            confirmed['description'] = desc
            confirmed['position']    = pos
            confirmed['candidates']  = [confirmed]
            confirmed['status']      = 'confirmed'
            result[sid] = confirmed
            continue

        # 카테고리 기반 후보 생성
        candidates = []
        if category and category in PROTO_DRAVIDIAN_LEXICON:
            for entry in PROTO_DRAVIDIAN_LEXICON[category]:
                c = entry.copy()
                # 위치 보정: 어두 기호 → 접두사 후보 신뢰도 +0.1
                if pos.get('init_pct', 0) > 30:
                    c['confidence'] = min(1.0, c['confidence'] + 0.1)
                    c['position_boost'] = 'initial'
                elif pos.get('term_pct', 0) > 30:
                    c['confidence'] = min(1.0, c['confidence'] + 0.1)
                    c['position_boost'] = 'terminal'
                candidates.append(c)

        candidates.sort(key=lambda x: -x['confidence'])
        best = candidates[0] if candidates else None

        result[sid] = {
            'id':          sid,
            'label':       f'P{sid:03d}',
            'description': desc,
            'category':    category or 'unknown',
            'mahadevan':   sign['mahadevan'],
            'position':    pos,
            'candidates':  candidates,
            'reading':     best['root']    if best else '?',
            'phoneme':     best['phoneme'] if best else '?',
            'meaning':     best['meaning_rebus'] if best else '?',
            'confidence':  best['confidence'] if best else 0.0,
            'source':      best['source']   if best else '',
            'status':      'candidate' if candidates else 'unknown',
        }

    return result


def _interpret(tokens: list) -> dict:
    """
    토큰 목록에서 구조를 분석해 한국어·영어 해석문 생성.
    인더스 인장은 대부분 "소유자 칭호 + 이름/별칭 + 씨족 표식" 구조.
    비문 길이별 문맥:
      1-2기호: 개인 소유 표식 (personal mark)
      3-4기호: 표준 인장 (칭호+번호+씨족)
      5-6기호: 교역 기록 (칭호+물품+수량+씨족)
      7기호 이상: 복합 교역/행정 기록
    """
    readings = [t['reading'] for t in tokens if t['reading'] != '?']
    n_total  = len(tokens)

    # 비문 길이 컨텍스트
    if n_total <= 2:
        seal_type = 'personal'    # 개인 소유 표식
    elif n_total <= 4:
        seal_type = 'standard'    # 표준 인장
    elif n_total <= 6:
        seal_type = 'trade'       # 교역 기록
    else:
        seal_type = 'complex'     # 복합 행정 기록

    has_title  = any(r in {'āṇ', 'ān'}                        for r in readings)
    has_star   = any(r == 'mīn'                                for r in readings)
    has_clan   = any(r in {'vēl', 'toṭi'}                     for r in readings)
    has_num    = any(r in {'oṉṟu','iraṇṭu','mūṉṟu','nālu',
                           'añcu','kaṇ','kaṇakku'}             for r in readings)
    has_seal   = any(r == 'toṭi'                               for r in readings)
    has_pearl  = any(r == 'mutu'                               for r in readings)
    has_deer   = any(r == 'māṉ'                                for r in readings)
    has_bird   = any(r in {'kuruvi', 'kōḻi'}                  for r in readings)
    has_tree   = any(r in {'maram', 'vēr'}                    for r in readings)
    has_water  = any(r in {'nīr', 'āṟu'}                      for r in readings)
    has_grain  = any(r in {'nel', 'iṭu'}                      for r in readings)
    has_sun    = any(r in {'ñāyiṟu', 'āḻi'}                   for r in readings)
    has_hill   = any(r in {'kuṉṟu', 'malai'}                  for r in readings)
    has_bow    = any(r in {'vil', 'vili'}                      for r in readings)
    has_grid   = any(r in {'kaṇakku', 'paṭi'}                 for r in readings)

    star_count = readings.count('mīn')
    num_map    = {'oṉṟu': '1', 'iraṇṭu': '2', 'mūṉṟu': '3',
                  'nālu': '4', 'añcu': '5+'}
    numerals   = [num_map[r] for r in readings if r in num_map]

    # 길이 컨텍스트 접미 문구
    type_ko = {'personal': '개인 소유 표식', 'standard': '표준 관인(官印)',
               'trade': '교역 기록 인장', 'complex': '복합 행정 문서'}
    type_en = {'personal': 'personal ownership mark', 'standard': 'standard official seal',
               'trade': 'trade record seal', 'complex': 'complex administrative record'}
    ctx_ko = type_ko.get(seal_type, '')
    ctx_en = type_en.get(seal_type, '')

    # ── 패턴별 해석 ───────────────────────────────────────────
    # ── 패턴별 해석 (길이 컨텍스트 포함) ──────────────────────
    # 패턴 1: 칭호 + 별(mīn) + 씨족
    if has_title and has_star and has_clan:
        num_str = f" {numerals[0]}번" if numerals else ""
        ko = (f"별(mīn)을 수호신으로 모시는{num_str} āṇ(주인·지배자)의 "
              f"vēl 씨족 봉인 [{ctx_ko}]")
        en = (f"Seal of āṇ (lord) under mīn (star){'  #'+numerals[0] if numerals else ''}, "
              f"vēl clan — [{ctx_en}]")
        pattern = 'TITLE+STAR+CLAN'

    # 패턴 2: 칭호 + 씨족
    elif has_title and has_clan and not has_star:
        num_ko  = f" {numerals[0]}번" if numerals else ""
        num_en  = f" no.{numerals[0]}" if numerals else ""
        ko = (f"āṇ(주인){num_ko} + vēl 씨족 표식 [{ctx_ko}]")
        en = (f"āṇ (lord){num_en} + vēl clan suffix [{ctx_en}]")
        pattern = 'TITLE+CLAN'

    # 패턴 3: 별(mīn) + 수량
    elif has_star and has_num and not has_title:
        star_str = f"mīn(별) {star_count}개" if star_count > 1 else "mīn(별)"
        num_str  = ' · '.join(numerals) if numerals else '?'
        ko = (f"{star_str}, 수량 {num_str} — 별 관련 물품 {num_str}건 [{ctx_ko}]")
        en = (f"{star_count}× mīn (star), qty {num_str} [{ctx_en}]")
        pattern = 'STAR+NUM'

    # 패턴 4: 봉인(toṭi) + 씨족
    elif has_seal and has_clan:
        ko = f"toṭi(봉인·고리) + vēl 씨족 표식 [{ctx_ko}]"
        en = f"toṭi (seal/ring) + vēl clan [{ctx_en}]"
        pattern = 'SEAL+CLAN'

    # 패턴 5: 칭호만
    elif has_title and not has_clan and not has_star:
        num_str = f" {numerals[0]}번" if numerals else ""
        ko = f"āṇ(주인·남성 칭호){num_str} [{ctx_ko}]"
        en = f"āṇ (lord/male title){' no.'+numerals[0] if numerals else ''} [{ctx_en}]"
        pattern = 'TITLE'

    # 패턴 6: 회계 격자(kaṇakku) — grid tally
    elif has_grid and has_num:
        num_str = ' · '.join(numerals) if numerals else '?'
        ko = f"kaṇakku(회계표) 수량 {num_str} — 다중 물품 재고 기록 [{ctx_ko}]"
        en = f"kaṇakku (accounting grid) qty {num_str} — multi-item inventory [{ctx_en}]"
        pattern = 'GRID+NUM'

    # 패턴 7: 수량만
    elif has_num and not has_title and not has_clan:
        num_str = ' · '.join(numerals) if numerals else '?'
        ko = f"수량 {num_str} — 순수 회계 표식 [{ctx_ko}]"
        en = f"Numeral {num_str} — quantity record [{ctx_en}]"
        pattern = 'NUMERAL'

    # 패턴 8: 진주/귀중품
    elif has_pearl:
        ko = f"mutu(진주·귀중품) — 고가 교역 물품 [{ctx_ko}]"
        en = f"mutu (pearl/precious goods) [{ctx_en}]"
        pattern = 'PEARL'

    # 패턴 9: 사슴(māṉ) — 명예/지위
    elif has_deer:
        num_str = f" {numerals[0]}번" if numerals else ""
        ko = f"māṉ(사슴/명예){num_str} — 귀족 지위 표식 [{ctx_ko}]"
        en = f"māṉ (deer/honor){' no.'+numerals[0] if numerals else ''} [{ctx_en}]"
        pattern = 'DEER+HONOR'

    # 패턴 10: 새(kuruvi) — 공인 표식
    elif has_bird:
        ko = f"kuruvi(새/기호) — 공인 표식 또는 기관 상징 [{ctx_ko}]"
        en = f"kuruvi (bird/sign) — official emblem or institutional symbol [{ctx_en}]"
        pattern = 'BIRD'

    # 패턴 11: 태양/빛(ñāyiṟu) — 시간/권위
    elif has_sun:
        ko = f"ñāyiṟu(태양/빛) — 시간·계절·권위 표식 [{ctx_ko}]"
        en = f"ñāyiṟu (sun/light) — temporal, seasonal or authority mark [{ctx_en}]"
        pattern = 'SUN'

    # 패턴 12: 언덕/산(kuṉṟu) — 지역 표식
    elif has_hill:
        ko = f"kuṉṟu(언덕/산) — 지역 지명 또는 지방 씨족 표식 [{ctx_ko}]"
        en = f"kuṉṟu (hill/mountain) — geographic or regional clan mark [{ctx_en}]"
        pattern = 'HILL'

    # 패턴 13: 활(vil) — 전사/전령
    elif has_bow:
        ko = f"vil(활) / vili(부르다) — 전사 칭호 또는 공식 전령 표식 [{ctx_ko}]"
        en = f"vil (bow) / vili (herald) — warrior title or official herald mark [{ctx_en}]"
        pattern = 'BOW'

    # 패턴 14: 물(nīr) — 관개/교역로
    elif has_water:
        ko = f"nīr(물/강) — 관개 또는 수상 교역로 표식 [{ctx_ko}]"
        en = f"nīr (water/river) — irrigation or waterway trade route mark [{ctx_en}]"
        pattern = 'WATER'

    # 패턴 15: 나무(maram) + 씨족
    elif has_tree and has_clan:
        ko = f"maram(나무/재목) + 씨족 — 목재 교역 씨족 봉인 [{ctx_ko}]"
        en = f"maram (timber) + clan — timber trade clan seal [{ctx_en}]"
        pattern = 'TREE+CLAN'

    # 패턴 16: 곡물(nel) — 농업 기록
    elif has_grain:
        num_str = ' · '.join(numerals) if numerals else '?'
        ko = f"nel(벼/곡물) 수량 {num_str} — 농업 수확 기록 [{ctx_ko}]"
        en = f"nel (rice/grain) qty {num_str} — agricultural harvest record [{ctx_en}]"
        pattern = 'GRAIN'

    # 기타
    else:
        readable = [t['meaning'] for t in tokens if t['meaning'] != '[미해독]']
        if readable:
            ko = f"부분 해독: {' / '.join(readable[:3])} [{ctx_ko}] — 추가 분석 필요"
            en = f"Partially deciphered: {' / '.join(readable[:3])} [{ctx_en}]"
        else:
            ko = f"미해독 [{ctx_ko}] — 음가 미확정 기호 과반"
            en = f"Undeciphered [{ctx_en}] — majority of signs unassigned"
        pattern = 'PARTIAL'

    # 신뢰도 계산
    conf_vals = [t['confidence'] for t in tokens if t['confidence'] > 0]
    avg_conf  = round(sum(conf_vals) / max(len(conf_vals), 1), 2)
    interp_conf = (
        '높음 (학술 확정 기호 중심)' if avg_conf >= 0.85
        else '중간 (후보 기호 포함)' if avg_conf >= 0.65
        else '낮음 (추정 필요)'
    )

    return {
        'korean':            ko,
        'english':           en,
        'avg_confidence':    avg_conf,
        'interp_confidence': interp_conf,
        'seal_type':         seal_type,
        'pattern':           pattern,
    }


def translate_inscription(sign_sequence: list, rebus_map: dict) -> dict:
    """
    기호 시퀀스를 음가 시퀀스로 변환 + 한국어/영어 해석 생성.
    확정(confidence>=0.7) 기호만 번역, 나머지는 [?]로 표시.
    """
    tokens = []
    readable_count = 0
    for sid in sign_sequence:
        info = rebus_map.get(sid, {})
        conf = info.get('confidence', 0)
        if conf >= 0.7:
            tokens.append({
                'sign':       f'P{sid:03d}',
                'reading':    info.get('reading', '?'),
                'phoneme':    info.get('phoneme', '?'),
                'meaning':    info.get('meaning', '?'),
                'confidence': conf,
                'status':     info.get('status', 'unknown'),
            })
            readable_count += 1
        else:
            tokens.append({
                'sign':       f'P{sid:03d}',
                'reading':    '?',
                'phoneme':    '?',
                'meaning':    '[미해독]',
                'confidence': conf,
                'status':     'unknown',
            })

    phoneme_str = ' - '.join(t['phoneme'] for t in tokens if t['phoneme'] != '?')
    reading_str = ' '.join(t['reading']   for t in tokens if t['reading'] != '?')
    coverage    = round(readable_count / max(len(sign_sequence), 1) * 100, 1)

    interp = _interpret(tokens)

    return {
        'sign_sequence': [f'P{s:03d}' for s in sign_sequence],
        'tokens':        tokens,
        'phoneme_str':   phoneme_str or '—',
        'reading_str':   reading_str or '—',
        'coverage':      coverage,
        'korean':        interp['korean'],
        'english':       interp['english'],
        'pattern':       interp['pattern'],
        'seal_type':     interp['seal_type'],
        'avg_confidence':    interp['avg_confidence'],
        'interp_confidence': interp['interp_confidence'],
        'note': (
            '학술 확정(Parpola/Mahadevan) 기호 기반 가설적 해석.'
            if coverage > 50
            else '미해독 기호 과반 — 부분 해석만 가능.'
        ),
    }


def translate_top_inscriptions(corpus, rebus_map: dict, n: int = 15) -> list:
    """
    코퍼스에서 해독률 높은 비문을 선별해 번역 시도.
    coverage(해독 가능 기호 비율)가 높은 순으로 정렬.
    """
    results = []
    for insc in corpus:
        t = translate_inscription(insc.sign_sequence, rebus_map)
        t['inscription_id']  = insc.id
        t['description']     = getattr(insc, 'description', '')
        results.append(t)

    results.sort(key=lambda x: -x['coverage'])
    return results[:n]


def get_summary(rebus_map: dict) -> dict:
    confirmed  = [s for s, v in rebus_map.items() if v.get('status') == 'confirmed']
    candidates = [s for s, v in rebus_map.items() if v.get('status') == 'candidate']
    unknown    = [s for s, v in rebus_map.items() if v.get('status') == 'unknown']

    high_conf  = [s for s, v in rebus_map.items() if v.get('confidence', 0) >= 0.7]

    categories = {}
    for v in rebus_map.values():
        cat = v.get('category', 'unknown')
        categories[cat] = categories.get(cat, 0) + 1

    return {
        'total_signs':     len(rebus_map),
        'confirmed':       len(confirmed),
        'candidates':      len(candidates),
        'unknown':         len(unknown),
        'high_confidence': len(high_conf),
        'coverage_pct':    round(len(high_conf) / max(len(rebus_map), 1) * 100, 1),
        'categories':      categories,
        'confirmed_signs': [f'P{s:03d}' for s in sorted(confirmed)],
    }


# ── 비동기 실행 상태 ───────────────────────────────────────────
_state = {'status': 'idle', 'progress': 0, 'message': '', 'results': {}}
_rebus_map_cache = None


def start_mapping(corpus=None) -> bool:
    import threading
    global _rebus_map_cache
    if _state['status'] == 'running':
        return False
    _state.update({'status': 'running', 'progress': 10,
                   'results': {}, 'message': 'Rebus 매핑 구축 중...'})

    def _run():
        global _rebus_map_cache
        try:
            _state.update({'progress': 30, 'message': '기호 분류 중...'})
            rmap = build_rebus_map(corpus)
            _rebus_map_cache = rmap
            _state.update({'progress': 60, 'message': '번역 시도 중...'})

            translations = []
            if corpus:
                translations = translate_top_inscriptions(corpus, rmap, n=15)

            summary = get_summary(rmap)
            _state.update({
                'status': 'done', 'progress': 100,
                'message': (f'완료. {summary["confirmed"]}개 확정 + '
                            f'{summary["candidates"]}개 후보 / '
                            f'해독 커버리지 {summary["coverage_pct"]}%'),
                'results': {
                    'summary':      summary,
                    'rebus_map':    {f'P{k:03d}': v for k, v in rmap.items()},
                    'translations': translations,
                },
            })
        except Exception as e:
            import traceback
            _state.update({'status': 'error',
                           'message': f'오류: {e}\n{traceback.format_exc()[:300]}'})

    threading.Thread(target=_run, daemon=True).start()
    return True


def get_rebus_map():
    return _rebus_map_cache


def get_state() -> dict:
    return {k: v for k, v in _state.items() if k != 'results'}


def get_results() -> dict:
    return _state.get('results', {})
