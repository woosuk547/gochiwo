export const siteNavigation = [
  { label: '공간 소개', href: '/space' },
  { label: '이용 안내', href: '/guide' },
  { label: '브랜드', href: '/brand' },
  { label: '제휴 예약', href: '/partnership' },
]

export const primaryStay = {
  brand: '리포즈',
  name: '리포즈 프라이빗 독채',
  location: '프라이빗 스테이',
  address: '강원 홍천군 서면 숲속길 21',
  opening: '2026년 6월부터 운영',
  subtitle: '고요가 흐르는 프라이빗 스테이',
  heroHeadline: '고요가 흐르는 시간,\n자연이 설계한 휴식',
  heroSub: '그저 머무는 것만으로도 충분한 곳. 오롯이 나와 우리에게 집중하는 쉼을 제안합니다.',
  description: '전면창 거실, 자쿠지, 프라이빗 데크와 지하수 풀이 있는 독채예요.',
  fromPrice: '680,000원~',
  stayType: '럭셔리 프라이빗 독채',
  guests: '4인 기준 · 최대 6인',
  checkIn: '16:00 입실 · 11:00 퇴실',
  bookingNotice: '결제 완료 시 확정',
}

export const stayFeatures = [
  { title: '온전한 안식', desc: '오직 단 한 팀만을 위한 독립된 하이엔드 공간' },
  { title: '계절의 전면창', desc: '사계절의 풍경을 오롯이 담아내는 창' },
  { title: '자쿠지', desc: '하루의 끝을 부드럽게 감싸는 반신욕 공간' },
  { title: '비움의 시간', desc: '아무것도 하지 않아도 충만한 정신적 회복' },
]

export const staySnapshot = [
  { label: '유형', value: '럭셔리 독채' },
  { label: '기본 요금', value: '680,000원~/박' },
  { label: '정원', value: '최대 6인' },
  { label: '체크인/아웃', value: '16:00 / 11:00' },
]

export const signatureHighlights = [
  {
    title: '자연을 응시하는 거실',
    description: '한쪽 벽 전체를 창으로 연 거실이에요. 빛과 풍경이 공간으로 천천히 들어옵니다.',
  },
  {
    title: '자쿠지',
    description: '따뜻한 물에 몸을 담그는 저녁. 하루의 긴장이 조용히 풀리는 자리입니다.',
  },
  {
    title: '포치 아래',
    description: '포치 아래 의자에 앉아 잠시 눈을 감아보세요. 우리만의 시간이 천천히 열립니다.',
  },
]

/** 홈 전용 — 감성·여정 중심 (공간 상세 페이지와 역할 분리) */
export const homeNarrative = {
  pullQuote:
    '자연을 응시하는 거실, 지하수 풀이 반짝이는 낮,\n포치 아래 잠시 감은 눈 끝에 가닿는 온전한 고요.',
  brandQuote: '고요가 흐르는 시간, 자연이 설계한 휴식.',
  locationTeaser: '강원 홍천, 프라이빗 독채',
  partnershipBadge: '제휴사 임직원 우대',
}

export const homeSignatureFacts = [
  { title: '프라이빗 독채', desc: '단 한 팀을 위한 독립 공간', detail: '250평 정원 · 48평 실내' },
  { title: '이용 인원', desc: '기준 4인 · 최대 6인', detail: '6인 예약 시 토퍼·침구 추가' },
  { title: '느긋한 연박', desc: '2박 이상 머물 때', detail: '1박당 2만원 할인' },
  { title: '사계절 전용 풀', desc: '지하수로 채운 프라이빗 풀', detail: '가을·겨울 미온수' },
]

export const homeDayJourney = [
  {
    time: '아침',
    label: '데크 · 거실',
    title: '포치 아래, 전면창의 빛',
    copy: '포치 아래 첫 숨과 전면창으로 스며드는 아침 빛. 하루의 속도가 천천히 풀려요.',
  },
  {
    time: '낮',
    label: '수영장',
    title: '지하수 풀에서의 낮',
    copy: '지하수로 채운 사계절 전용 풀에서 맘껏 놀아요. 우리만의 물놀이 시간이에요.',
  },
  {
    time: '저녁',
    label: '실내',
    title: '우리끼리의 저녁',
    copy: '식탁과 소파에 둘러앉아 이야기 나누는 저녁. 방해 없는 우리만의 시간이 이어져요.',
  },
  {
    time: '밤',
    label: '침실',
    title: '깊은 고요',
    copy: '온전한 정적이 깃드는 밤. 잠드는 것조차 아깝다는 말을 자주 듣는 방이에요.',
  },
]

/** 홈 공간 프리뷰 — 3컷, 짧은 카피 */
export const homeSpacePreviews = [
  {
    label: '거실',
    image: '/repause/editorial-living.jpg',
    title: '거실과 전면창',
    copy: '도착하는 순간, 일상의 속도가 고요히 늦춰집니다.',
  },
  {
    label: '욕실',
    image: '/repause/editorial-bath.jpg',
    title: '자쿠지',
    copy: '따뜻한 물에 몸을 맡기면 하루가 안식으로 바뀌어요.',
  },
  {
    label: '데크',
    image: '/repause/editorial-deck.jpg',
    title: '프라이빗 데크',
    copy: '포치 아래, 시간의 흐름조차 가만히 멈춰 서는 자리.',
  },
]

export const homeParallaxLayers = [
  { src: '/repause/parallax/forest-canopy.jpg', speed: 0.15, zIndex: 1 },
  { src: '/repause/parallax/trees-layer.jpg', speed: 0.35, zIndex: 2 },
  { src: '/repause/parallax/forest-path.jpg', speed: 0.55, zIndex: 3 },
  { src: '/repause/parallax/villa-reveal.jpg', speed: 0.75, zIndex: 4 },
]

export const roomHighlights = [
  {
    label: '거실과 전면창',
    image: '/repause/editorial-living.jpg',
    title: '거실과 전면창',
    copy: '자연이 액자처럼 들어오는 거실. 도착하는 순간, 일상의 속도가 고요히 늦춰집니다.',
  },
  {
    label: '고요한 침실',
    image: '/repause/editorial-bedroom.jpg',
    title: '침실',
    copy: '밤이 고요하고 깊숙이 찾아옵니다. 온전한 정적이 깃드는 나만의 아늑한 침실입니다.',
  },
  {
    label: '자쿠지',
    image: '/repause/editorial-bath.jpg',
    title: '자쿠지',
    copy: '따뜻한 물에 천천히 몸을 담그는 반신욕. 고단했던 하루의 여정이 안식으로 바뀝니다.',
  },
  {
    label: '프라이빗 데크',
    image: '/repause/editorial-deck.jpg',
    title: '프라이빗 데크',
    copy: '포치 아래 의자에 앉아 잠시 눈을 감아보세요. 마음이 차분해지면서 명상에 잠기게 됩니다. 시간의 흐름조차 가만히 멈춰 서는 자리입니다.',
  },
]

export const amenityGroups = [
  {
    title: '가전 · 침구',
    items: [
      'TV',
      '라지킹사이즈 침대 2',
      '6인용 식탁',
      '소파',
      '시스템 에어컨',
      '공기청정기',
      '헤어드라이어 · 고데기',
    ],
  },
  {
    title: '욕실 · 어메니티',
    items: [
      '자쿠지',
      '비치용 샴푸 · 린스 · 바디워시',
      '일회용 샤워타월',
      '목욕가운 · 수건',
    ],
  },
  {
    title: '주방 · 식기',
    items: [
      '4구 인덕션',
      '직수정수기',
      '커피포트',
      '렌지오븐',
      '빌트인 냉장고',
      '와인냉장고',
      '네스프레소 커피머신',
      '음식물 처리기',
      '6인용 식기 · 접시 · 수저세트 · 주류잔',
    ],
  },
  {
    title: '야외 · 안전',
    items: ['사계절 전용 풀 (지하수)', '가을·겨울 미온수', '프라이빗 데크', '소화기'],
  },
]

export const propertyFacts = [
  { label: '기본 제공', value: '웰컴 티 · 40ml 기프트 어메니티 · 주차 2대' },
  { label: '공간 추천', value: '커플 · 가족 · 조용한 회복' },
  { label: '결제 수단', value: '카드 · 계좌이체 · 법인 결제' },
]

export const recommendedGuests = [
  '조용한 회복이 필요할 때',
  '서로에게 온전히 집중하고 싶을 때',
  '자연 속 독채에서 머물고 싶을 때',
]

export const closingMessage = '리포즈의 쉼을 직접 경험해 보세요.'

export const guideGroups = [
  { title: '입실 및 퇴실', items: ['체크인 16:00 이후', '체크아웃 11:00 이전', '비대면 체크인. 당일 오전 상세 가이드를 보내 드려요'] },
  { title: '공간 이용 수칙', items: ['기준 4인 · 최대 6인 (6인 예약 시 토퍼·침구 추가, 초과 인원 요금 적용)', '반려동물 동반 불가', '실내 전 구역 금연. 사적 파티 및 예약 정원 외 인원 출입 제한'] },
  { title: '예약 및 환불', items: ['결제가 완료되면 예약 확정', '카드 · 계좌이체 · 법인 결제', '비수기 10일 전·성수기 15일 전 취소 시 전액 환불 (상세 표 참고)'] },
]

export const reservationNotes = [
  {
    title: '예상 요금 바로 확인',
    description: '날짜와 인원을 고르면 예상 요금을 바로 보여드려요.',
  },
  {
    title: '결제하면 바로 확정',
    description: '날짜가 겹치지 않는지 확인한 뒤, 카드·계좌이체는 결제가 끝나면 바로 확정돼요.',
  },
  {
    title: '제휴·대관은 따로',
    description: '임직원 혜택과 VIP 일정은 제휴 예약에서, 상업 촬영·워케이션은 [미디어 대관 · 워케이션 문의] 탭에서 상담해 드려요.',
  },
]

export const reservationSteps = [
  { step: '1', title: '날짜 선택', copy: '체크인과 체크아웃 날짜를 선택하세요. 가용 일정을 캘린더에서 바로 확인할 수 있어요.' },
  { step: '2', title: '인원 입력', copy: '2인 · 4인 · 6인 중 머무실 인원과 요청사항을 남겨주세요.' },
  { step: '3', title: '결제', copy: '결제가 완료되면 예약이 확정돼요. 일정은 12시간 동안 임시로 확보돼요.' },
  { step: '4', title: '체크인 가이드', copy: '체크인 당일 오전, 오시는 길과 프라이빗 출입 안내를 전달해 드립니다.' },
]

export const partnershipBenefits = [
  {
    title: '임직원 전용 우대',
    copy: '제휴사 임직원을 위해 평일 30%, 주말·공휴일 및 성수기 20% 우대 혜택을 제공합니다.',
  },
  {
    title: '미디어 대관 · 워케이션 문의',
    copy: '쇼핑몰 룩북, 광고·미디어 촬영, 워케이션은 [미디어 대관 · 워케이션 문의] 탭에서 상담해 드려요.',
  },
  {
    title: '기업 맞춤 정산',
    copy: '법인 일괄 정산과 임직원 개별 정산을 지원해요. 세금계산서 발행도 가능해요.',
  },
]

export interface GuideFaqItem {
  question: string
  answer: string
  cta?: { href: string; label: string }
}

export interface GuideFaqGroup {
  title: string
  items: GuideFaqItem[]
}

export interface GuideFaqSection {
  title: string
  groups: GuideFaqGroup[]
}

export const guideFaqSections: GuideFaqSection[] = [
  {
    title: '체크인 전',
    groups: [
      {
        title: '예약 및 결제',
        items: [
          {
            question: '예약은 어떻게 진행되나요?',
            answer:
              '공식 홈페이지를 통한 실시간 예약을 우선으로 받고 있어요. 예약 시 결제가 완료되면 확정 안내를 보내드립니다.',
            cta: { href: '/reservation', label: '예약하기' },
          },
          {
            question: '하루에 몇 팀이 이용 가능한가요?',
            answer:
              '리포즈는 하루에 한 팀만 받아요. 250평 정원과 48평 실내를 우리만 씁니다.',
          },
          {
            question: '연박 할인이 있나요?',
            answer:
              '2박 이상이면 1박당 2만원을 깎아 드려요. 예약 화면 요금에 바로 반영됩니다.',
          },
        ],
      },
      {
        title: '입 · 퇴실 안내',
        items: [
          {
            question: '입실과 퇴실 시간은 어떻게 되나요?',
            answer:
              '고객님을 위한 정비 시간을 위해 입실은 오후 4시, 퇴실은 오전 11시예요. 다음 팀을 위한 공간 정돈과 수질 관리에 시간이 필요하니 입·퇴실 시간을 지켜 주세요. 얼리 체크인·레이트 체크아웃은 당일 예약 상황에 따라 달라질 수 있어요. 필요하면 미리 문의해 주세요.',
          },
          {
            question: '체크인은 어떻게 진행되나요?',
            answer:
              '고객님의 온전한 휴식을 방해하지 않도록 비대면 체크인 시스템을 운영 중입니다. 입실 당일 오전에 상세 안내와 출입 비밀번호를 예약 시 작성해 주셨던 연락처로 발송해 드립니다.',
          },
          {
            question: '방문객 입실이 가능한가요?',
            answer:
              '쾌적한 휴식 환경을 위해 예약 시 지정하신 확정 인원 외의 추가 인원 혹은 외부 방문객 입실이 엄격히 제한됩니다. 최대 투숙 인원을 초과하거나 사전 협의 없는 인원 추가 발생 시 입실이 거부되며 환불 없이 퇴실 처리될 수 있으니 양해 부탁드립니다.',
          },
          {
            question: '예약 인원 규정과 추가 요금은 어떻게 적용되나요?',
            answer:
              '기준 인원은 4인, 최대 인원은 6인이에요. 숙박 인원은 2인 · 4인 · 6인으로 예약할 수 있어요.\n\n3인 투숙 시에는 4인으로, 5인 투숙 시에는 6인으로 예약해 주세요.\n\n4인까지는 추가 인원 요금이 없고, 6인 예약 시 기준 초과 2명분에 대해 1인당 40,000원/박이 적용돼요. 6인 예약에는 토퍼와 프리미엄 침구가 추가로 준비돼요.\n\n6인을 넘는 인원은 예약할 수 없으며, 사전 협의 없는 초과 인원이 확인되면 입실이 제한될 수 있어요.',
          },
        ],
      },
      {
        title: '취소 및 환불',
        items: [
          {
            question: '예약 취소 시 환불 규정은 어떻게 되나요?',
            answer:
              '환불은 최종 납부 금액을 기준으로, 입실일까지 남은 일수에 따라 산정됩니다.\n\n비수기: 이용 10일 전까지 100% 환불, 이후 일수에 따라 차감되며 이용 2일 전~당일은 환불 불가입니다.\n\n성수기(여름 7/15~8/24, 겨울 12/1~1/15): 이용 15일 전까지만 100% 환불이며, 이후 일수에 따라 위약금이 발생하고 이용 3일 전~당일은 환불 불가입니다.\n\n자세한 비율은 아래 환불 규정 표를 기준으로 합니다.',
          },
          {
            question: '천재지변으로 인한 취소는 어떻게 되나요?',
            answer:
              '이용 당일 강원도 홍천 지역에 기상청이 발령한 기상특보(태풍, 홍수 등)로 인해 방문이 불가능한 경우, 증빙 서류 확인 후 전액 환불해 드립니다.',
          },
        ],
      },
    ],
  },
  {
    title: '체크인 후',
    groups: [
      {
        title: '시설 이용',
        items: [
          {
            question: '야외 수영장은 어떻게 운영되나요? 이용 시간 제한이 있나요?',
            answer:
              '야외 수영장은 고객님의 투숙 기간 동안 상시 이용 가능합니다. 다만 늦은 밤에는 이웃 가구를 위해 고성방가는 삼가해 주시기 바랍니다. 또한 안전을 위해 음주 후 수영장 입장이 엄격히 제한됩니다.',
          },
          {
            question: '수영장 미온수는 기본 셋팅인가요?',
            answer:
              '사계절 전용 풀은 지하수로 운영됩니다. 봄·여름에는 지하수 자연수 풀이 기본이며, 가을·겨울에는 미온수를 제공해요. 미온수 유지 비용은 숙박료에 포함되어 있어요. 수질 관리를 위해 입욕제나 배쓰밤 사용은 제한하며, 아이들은 반드시 보호자와 함께 이용해 주세요.',
          },
          {
            question: '바비큐 이용이 가능한가요?',
            answer:
              '야외 바비큐 설비는 추가 도입을 준비 중이에요. 도입 일정과 이용 방법은 확정되는 대로 안내드릴게요. 지금은 주방에서 간단한 조리와 실내에서 우리끼리의 저녁 시간을 즐겨 주세요.',
          },
          {
            question: '객실 내에서 바비큐나 요리가 가능한가요?',
            answer:
              '쾌적한 실내와 가구 보호를 위해 냄새가 많이 나는 육류·생선류 조리는 제한돼요. 주방의 지정 조리 기구를 이용해 주세요. 화재 예방을 위해 개인 화기(버너, 숯, 폭죽 등) 반입은 금지됩니다.',
          },
        ],
      },
      {
        title: '주변 환경 및 기타 안내',
        items: [
          {
            question: '주차 공간은 충분한가요?',
            answer:
              '독채 부지 내에 전용 주차공간이 마련되어 있어 여유롭게 주차하실 수 있습니다.\n\n· 2대 가능\n· 전기차 충전 가능',
          },
          {
            question: '머무르는 동안 불편 사항이 생기면 어떻게 연락하나요?',
            answer:
              '머무시는 동안 도움이 필요하면 아래 채널로 연락해 주세요. 채팅이 가장 빨라요.\n\n· 홈페이지 우측 하단 채팅 문의\n· 고객센터(오전 10시~18시 운영): 02-514-5536\n· 인스타그램: @repause_poolvilla',
            cta: { href: 'tel:025145536', label: '전화로 문의하기' },
          },
        ],
      },
      {
        title: '기타 유의사항',
        items: [
          {
            question: '반려동물과 함께 입실할 수 있나요?',
            answer:
              '쾌적한 객실 환경과 알레르기 방지를 위해 안타깝게도 반려동물 동반 입실은 제한하고 있습니다. 고객님의 깊은 양해 부탁드립니다.',
          },
          {
            question: '숙소 내 흡연이 가능한가요?',
            answer:
              '모든 실내 공간과 테라스는 금연 구역입니다. 객실 내 쾌적함과 다음 고객님을 위하여 반드시 협조 부탁드립니다. 흡연이 적발될 경우 환불 없이 퇴실 처리됩니다.',
          },
          {
            question: '상업적 촬영이나 유튜브 촬영, 브라이덜 샤워 등이 가능한가요?',
            answer:
              '투숙 고객님의 개인적인 기념 촬영이나 SNS 업로드용 사진 촬영은 얼마든지 환영합니다. 다만, 사전 협의 없는 쇼핑몰 공구 촬영, 브랜드 룩북 촬영, 유튜브 리뷰 등 상업적 목적의 촬영 및 대관은 규정상 금지되어 있습니다. 상업 촬영이 필요하신 경우 반드시 사전에 대관 예약을 통해 진행해 주셔야 합니다. 대관 관련 자세한 사항은 고객센터를 통해 별도로 문의 부탁드립니다.',
            cta: { href: '/partnership', label: '대관 예약' },
          },
          {
            question: '공간 내에서 연기나 불꽃을 사용하는 이벤트(연막탄, 헬륨풍선 등)가 가능한가요?',
            answer:
              '건축물과 인테리어 자재 보호, 그리고 화재 안전을 위해 객실 내 벽면에 접착제를 붙이는 행위나 불꽃, 연기 등을 동반한 이벤트 물품 사용은 전면 금지하고 있습니다. 다음 고객님께도 무결점의 공간을 제공하기 위한 조치이오니 양해를 부탁드립니다.',
          },
        ],
      },
    ],
  },
]

export const cancellationPolicy = {
  intro: [
    '환불금은 최종 납부 금액을 기준으로 계산해요.',
    '당일 신청·당일 취소도 이용 예정일 기준으로 같은 규정을 적용해요.',
  ],
  tableRows: [
    { daysLabel: '15일 전', offpeak: '100% 환불', peak: '100% 환불' },
    { daysLabel: '14~11일 전', offpeak: '100% 환불', peak: '80% 환불' },
    { daysLabel: '10일 전', offpeak: '100% 환불', peak: '70% 환불' },
    { daysLabel: '9일 전', offpeak: '90% 환불', peak: '60% 환불' },
    { daysLabel: '8일 전', offpeak: '80% 환불', peak: '50% 환불' },
    { daysLabel: '7일 전', offpeak: '70% 환불', peak: '40% 환불' },
    { daysLabel: '6일 전', offpeak: '60% 환불', peak: '30% 환불' },
    { daysLabel: '5일 전', offpeak: '50% 환불', peak: '20% 환불' },
    { daysLabel: '4일 전', offpeak: '40% 환불', peak: '10% 환불' },
    { daysLabel: '3일 전', offpeak: '30% 환불', peak: '환불 불가' },
    { daysLabel: '2일 전~당일', offpeak: '환불 불가', peak: '환불 불가' },
  ],
  peakSeasons: [
    '여름 성수기: 7/15 ~ 8/24',
    '겨울 성수기: 12/1 ~ 1/15',
  ],
  notes: [
    '노쇼: 이용 당일 연락 없이 오시지 않으면 일정과 결제는 돌려드리지 않아요.',
    '일정 변경: 이용 예정일 10일 전까지만 바꿀 수 있어요. 그 뒤에는 취소 규정을 따릅니다.',
    '기상 악화로 교통이 끊기면 증빙을 주시면 전액 환불 또는 날짜 변경이 가능해요.',
    '환불금은 요청을 받은 뒤 영업일 기준 3~5일 안에 보내 드려요.',
  ],
}

/** 숙박 제공·결제 당사자 (푸터·심사용) */
export const lodgingProvider = {
  title: '숙박 제공 및 결제 당사자',
  company: '슈가스테이',
  ceo: '문혜은',
  businessNumber: '753-32-01614',
  mailOrderNumber: '제2026-화도수동-0450 호',
  address: '경기도 남양주시 화도읍 수레로 1178, 104동 902호',
  phone: '010-7584-5353',
}

/** 예약 대행·시스템 운영 (푸터·심사용) + 사이트 문의 기본 연락처 */
export const contactInfo = {
  brand: '리포즈',
  roleTitle: '예약 대행 및 시스템 운영',
  company: '(주)크리오스',
  ceo: '이상민',
  businessNumber: '422-87-00064',
  mailOrderNumber: '제2026-서울강남-03705 호',
  address: '서울특별시 강남구 강남대로160길 26, 2층',
  phone: '02-514-5536',
  site: 'repause.co.kr',
  instagram: 'https://www.instagram.com/repause_poolvilla/',
  email: 'creaos@naver.com',
  privacyOfficer: '이상민',
  notice: '',
}
