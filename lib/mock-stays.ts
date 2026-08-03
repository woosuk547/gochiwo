export interface MockStay {
  slug: string
  name: string
  region: string
  category: string
  guests: string
  price: string
  badge: string
  coverImage: string
  interiorImage: string
  summary: string
  intro: string
  highlights: string[]
  facts: Array<{ label: string; value: string }>
  amenities: string[]
}

export const mockStays: MockStay[] = [
  {
    slug: 'sol-atelier',
    name: '솔 아틀리에',
    region: '강원 양양',
    category: '프라이빗 풀빌라',
    guests: '2~4명',
    price: '390,000원~',
    badge: '프라이빗 독채',
    coverImage: '/repause/collection/sol-atelier-cover.jpg',
    interiorImage: '/repause/collection/sol-atelier-room.jpg',
    summary: '소나무 숲 한가운데 놓인 전면창 독채. 늦은 오후 빛과 실내 온수 풀이 오래 기억에 남는 스테이입니다.',
    intro:
      '솔 아틀리에는 능선 아래로 내려앉은 소나무 숲과 맞닿아 있는 단독 스테이입니다. 길게 열린 거실과 낮은 침실, 실내 온수 풀이 한 흐름으로 이어져 하루 종일 객실 안에서 머물러도 지루하지 않도록 구성했습니다.',
    highlights: ['실내 온수 풀', '전면 숲 전망 거실', '사우나 룸', '프라이빗 파이어핏'],
    facts: [
      { label: '기준 인원', value: '2인 기준, 최대 4인' },
      { label: '체크인', value: '16:00 / 11:00' },
      { label: '포함 서비스', value: '웰컴 스낵 · 온수 풀 · 주차 2대' },
    ],
    amenities: ['퀸 베드 2', '실내 온수 풀', '핀란드식 사우나', '블루투스 스피커', '주방 / 다이닝', '무료 주차'],
  },
  {
    slug: 'morae-cove',
    name: '모래 코브',
    region: '제주 애월',
    category: '오션 클리프 스테이',
    guests: '2~3명',
    price: '420,000원~',
    badge: '오션뷰 스테이',
    coverImage: '/repause/collection/morae-cove-cover.jpg',
    interiorImage: '/repause/collection/morae-cove-room.jpg',
    summary: '해안 절벽 가까이 자리한 2인 중심 스테이. 저녁 노을과 욕조 옆 바다 풍경을 오래 즐기기 좋은 객실입니다.',
    intro:
      '모래 코브는 애월의 낮은 절벽을 따라 자리한 소형 럭셔리 스테이입니다. 객실 안에서는 수평선이 길게 펼쳐지고, 욕조와 침실이 한 방향으로 열려 있어 머무는 동안 계속 바다를 바라보게 됩니다.',
    highlights: ['오션뷰 욕조', '선셋 라운지', '와인 바스켓', '애월 해안 산책로 인접'],
    facts: [
      { label: '기준 인원', value: '2인 기준, 최대 3인' },
      { label: '체크인', value: '16:00 / 11:00' },
      { label: '포함 서비스', value: '와인 바스켓 · 주차 1대' },
    ],
    amenities: ['킹 베드 1', '오션뷰 욕조', '테라스 라운지', '캡슐 커피 머신', '빔프로젝터', '무료 주차'],
  },
  {
    slug: 'noeul-ridge',
    name: '노을 릿지',
    region: '경주 감포',
    category: '코트야드 풀 빌라',
    guests: '2~6명',
    price: '510,000원~',
    badge: '코트야드 빌라',
    coverImage: '/repause/collection/noeul-ridge-cover.jpg',
    interiorImage: '/repause/collection/noeul-ridge-room.jpg',
    summary: '마당과 수영장을 중심으로 객실이 둘러앉은 코트야드형 빌라. 가족 여행과 조용한 모임에 잘 어울립니다.',
    intro:
      '노을 릿지는 경주 외곽의 낮은 지형을 따라 만든 중정형 풀 빌라입니다. 침실 두 개와 거실, 다이닝이 마당을 향해 열려 있어 함께 머무르면서도 각자의 시간을 지키기 좋습니다.',
    highlights: ['중정 풀', '침실 2개', '대형 다이닝', '야간 조명 정원'],
    facts: [
      { label: '기준 인원', value: '4인 기준, 최대 6인' },
      { label: '체크인', value: '16:00 / 11:00' },
      { label: '포함 서비스', value: '웰컴 티 · 40ml 기프트 어메니티 · 주차 2대' },
    ],
    amenities: ['퀸 베드 2', '중정 풀', '야외 다이닝', '독립 욕실 2개', '풀 키친', '무료 주차'],
  },
]

export function getMockStay(slug: string) {
  return mockStays.find((stay) => stay.slug === slug)
}
