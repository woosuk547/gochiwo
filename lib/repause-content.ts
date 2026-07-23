export const siteNavigation = [
  { label: '공간 소개', href: '/space' },
  { label: '이용 안내', href: '/guide' },
  { label: '브랜드', href: '/brand' },
  { label: '제휴 예약', href: '/partnership' },
]

export const primaryStay = {
  brand: '리포즈',
  name: '리포즈 포레스트 하우스',
  location: '프라이빗 스테이',
  address: '강원 홍천군 서면 숲속길 21',
  opening: '2026년 6월부터 운영',
  subtitle: '온전한 안식과 고요가 흐르는 프라이빗 스테이',
  heroHeadline: '고요가 흐르는 시간,\n자연이 설계한 휴식',
  heroSub: '그저 머무는 것만으로도 충분한 치유가 되는 곳. 오롯이 나와 우리에게 집중하는 진정한 쉼의 시간을 제안합니다.',
  description: '전면창 거실, 히노끼 욕조, 프라이빗 데크. 세상의 알람을 끄고 자연의 숨소리에 주파수를 맞추는 하이엔드 독채 스테이입니다.',
  fromPrice: '680,000원~',
  stayType: '럭셔리 프라이빗 독채',
  guests: '2인 기준 · 최대 6인',
  checkIn: '16:00 입실 · 11:00 퇴실',
  bookingNotice: '개별 승인 후 정산',
}

export const stayFeatures = [
  { title: '온전한 안식', desc: '오직 단 한 팀만을 위한 독립된 하이엔드 공간' },
  { title: '계절의 전면창', desc: '사계절의 풍경을 오롯이 담아내는 창' },
  { title: '히노끼 잔향', desc: '정취를 더하는 깊은 반신욕 공간' },
  { title: '비움의 시간', desc: '아무것도 하지 않아도 충만한 정신적 회복' },
]

export const staySnapshot = [
  { label: '유형', value: '럭셔리 독채' },
  { label: '기본 요금', value: '680,000원~/박' },
  { label: '정원', value: '2~6인' },
  { label: '체크인/아웃', value: '16:00 / 11:00' },
]

export const signatureHighlights = [
  {
    title: '자연을 응시하는 거실',
    description: '공간 안에서 마주하는 사색의 깊이가 길어질수록, 회복의 부피 또한 깊어집니다. 한쪽 벽 전체를 창으로 열어 자연의 빛과 정취가 공간으로 가만히 스며듭니다.',
  },
  {
    title: '히노끼 욕조',
    description: '여유로운 자쿠지에서 은은한 편백 잔향과 함께 반신욕까지 가닿는 유려하고 섬세한 쉼의 흐름입니다.',
  },
  {
    title: '포치 아래 명상',
    description: '포치 아래 의자에 앉아 잠시 눈을 감아보세요. 마음이 차분해지면서 자연스레 명상에 잠기게 됩니다. 우리만의 온전한 시간을 누리는 자리입니다.',
  },
]

/** 홈 전용 — 감성·여정 중심 (공간 상세 페이지와 역할 분리) */
export const homeNarrative = {
  pullQuote:
    '자연을 응시하는 거실, 히노끼 편백 향이 채우는 밤,\n포치 아래 잠시 감은 눈 끝에 가닿는 온전한 고요.',
  brandQuote: '고요가 흐르는 시간, 자연이 설계한 휴식.',
  locationTeaser: '강원 홍천, 프라이빗 독채',
  partnershipBadge: '네오위즈 · 이스트소프트 임직원 우대',
}

export const homeSignatureFacts = [
  { title: '프라이빗 독채', desc: '단 한 팀을 위한 독립 공간', detail: '250평 정원 · 48평 실내' },
  { title: '이용 인원', desc: '기준 2인 · 최대 6인', detail: '6인 예약 시 토퍼·침구 추가' },
  { title: '느긋한 연박', desc: '2박 이상 머무는 여정', detail: '연박 할인 특별가' },
  { title: '사계절 전용 풀', desc: '추운 계절 미온수 포함', detail: '봄·여름은 자연수 풀' },
]

export const homeDayJourney = [
  {
    time: '아침',
    label: '데크',
    title: '포치 아래 첫 숨',
    copy: '새벽 공기와 함께 눈을 뜨면, 하루의 속도가 천천히 풀려요.',
    image: '/repause/editorial-deck.jpg',
  },
  {
    time: '낮',
    label: '거실',
    title: '전면창의 빛',
    copy: '자연이 액자처럼 들어오는 거실에서 아무것도 하지 않아도 충분해요.',
    image: '/repause/editorial-living.jpg',
  },
  {
    time: '저녁',
    label: '욕실',
    title: '히노끼의 잔향',
    copy: '편백 향이 스며드는 반신욕으로 하루의 여정이 안식으로 바뀌어요.',
    image: '/repause/editorial-bath.jpg',
  },
  {
    time: '밤',
    label: '침실',
    title: '깊은 고요',
    copy: '온전한 정적이 깃드는 밤. 잠드는 것조차 아깝다는 말을 자주 듣는 방이에요.',
    image: '/repause/editorial-bedroom.jpg',
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
    title: '히노끼 욕조',
    copy: '은은한 편백 향과 함께 하루가 안식으로 바뀌어요.',
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
    label: '온수 히노끼',
    image: '/repause/editorial-bath.jpg',
    title: '히노끼 욕조',
    copy: '히노끼의 은은한 향이 퍼지는 욕조. 온전한 반신욕을 통해 고단했던 하루의 여정이 안식으로 바뀝니다.',
  },
  {
    label: '프라이빗 데크',
    image: '/repause/editorial-deck.jpg',
    title: '프라이빗 데크',
    copy: '포치 아래 의자에 앉아 잠시 눈을 감아보세요. 마음이 차분해지면서 명상에 잠기게 됩니다. 시간의 흐름조차 가만히 멈춰 서는 자리입니다.',
  },
]

export const amenityGroups = [
  { title: '침실 및 거실', items: ['라지 킹 침대 2', '소파 1', '야외 풀', 'BBQ 존', '프라이빗 데크'] },
  { title: '미니멀 키친', items: ['인덕션', '빌트인 냉장고', '커피머신', '전자레인지', '기본 식기 · 와인잔'] },
  { title: '자쿠지 & 바스', items: ['히노끼 욕조', '40ml 기프트 어메니티', '욕실 디스펜서 어메니티', '헤어드라이어', '목욕가운 · 수건'] },
]

export const propertyFacts = [
  { label: '기본 제공', value: '웰컴 티 · 40ml 기프트 어메니티 · 주차 2대' },
  { label: '공간 추천', value: '커플 · 가족 · 조용한 회복' },
  { label: '정산 수단', value: '카드 · 계좌이체 · 법인 정산' },
]

export const recommendedGuests = [
  '내면의 깊은 회복이 필요한 순간',
  '온전히 서로에게 몰입하는 독립된 시간',
  '자연의 숨결과 감각적인 공간 미학을 마주하고 싶을 때',
]

export const closingMessage = '리포즈가 지향하는 깊고 온전한 안식을 직접 경험해 보시기 바랍니다.'

export const guideGroups = [
  { title: '입실 및 퇴실', items: ['체크인 16:00 이후', '체크아웃 11:00 이전', '비대면 체크인 서비스. 여정 당일 오전 상세 가이드 개별 전송'] },
  { title: '공간 이용 수칙', items: ['기준 2인, 최대 6인 (6인 예약 시 2인용 토퍼 및 프리미엄 침구 세트 추가 제공)', '반려동물 동반 불가', '실내 전 구역 금연. 사적 파티 및 예약 정원 외 인원 출입 제한'] },
  { title: '예약 및 환불', items: ['여정 일정 조율 후 개별 승인 결제', '카드 · 계좌이체 · 법인 정산', '비수기 10일 전·성수기 15일 전 취소 시 전액 환불 (상세 표 참고)'] },
]

export const reservationNotes = [
  {
    title: '우아한 여정 설계',
    description: '원하시는 날짜와 인원을 선택하시면 정교하게 조율된 예상 요금을 즉시 보여드립니다.',
  },
  {
    title: '정성 어린 조율',
    description: '고객님의 온전한 안식을 위해 일정이 겹치지 않도록 세심히 검토한 후, 최종 예약 승인 안내를 차분히 전해 드립니다.',
  },
  {
    title: '파트너 전용 배려',
    description: '제휴 파트너사 임직원 혜택 및 VIP 투숙 일정은 제휴 예약 채널을 통해 조율해 드립니다. 상업 촬영·대관은 제휴 페이지의 [미디어 대관 문의] 탭을 이용해 주세요.',
  },
]

export const reservationSteps = [
  { step: '1', title: '날짜 선택', copy: '체크인과 체크아웃 날짜를 선택하세요. 가용 일정을 캘린더에서 바로 확인할 수 있어요.' },
  { step: '2', title: '인원 입력', copy: '2인, 4인, 6인 중 머무실 인원과 요청사항을 남겨주세요.' },
  { step: '3', title: '승인 및 결제', copy: '24시간 이내에 승인 여부와 결제 안내를 보내드려요.' },
  { step: '4', title: '체크인 가이드', copy: '체크인 당일 오전, 오시는 길과 프라이빗 출입 안내를 전달해 드립니다.' },
]

export const partnershipBenefits = [
  {
    title: '임직원 전용 우대',
    copy: '네오위즈와 이스트소프트 임직원을 위해 평일 30%, 주말·공휴일 및 성수기 20% 우대 혜택을 제공합니다.',
  },
  {
    title: '미디어 대관 문의',
    copy: '쇼핑몰 룩북, 광고·미디어 촬영 등 상업 목적 이용은 제휴 페이지의 [미디어 대관 문의] 탭을 통해 별도 접수해 주세요.',
  },
  {
    title: '정교한 기업 정산',
    copy: '법인 일괄 정산 및 개별 임직원 정산 등 기업 환경에 알맞는 매끄럽고 체계적인 맞춤 정산 프로토콜을 지원합니다.',
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
              'RE:PAUSE는 오직 한 팀만을 위한 100% 프라이빗 독채 풀빌라로 운영됩니다. 250평의 넓은 대지와 48평의 여유로운 공간을 하루 동안 온전히 단독으로 사용하시며, 누구에게도 방해 받지 않는 깊은 휴식을 누리실 수 있습니다.',
          },
          {
            question: '연박 할인이 있나요?',
            answer:
              '2박 이상 머무시는 고객님께는 감사의 마음을 담아 연박 할인 혜택을 드리고 있습니다. 자세한 금액은 결제 시 확인하실 수 있습니다.',
          },
        ],
      },
      {
        title: '입 · 퇴실 안내',
        items: [
          {
            question: '입실과 퇴실 시간은 어떻게 되나요?',
            answer:
              '고객님을 위한 정성스러운 정비 시간을 위해 입실은 오후 4시, 퇴실은 오전 11시를 준수하고 있습니다. 다음 고객님을 위한 완벽한 공간 정돈과 수질 관리, 방역을 위해 정비 시간이 엄격히 소요되므로 입·퇴실 시간을 준수해 주시기를 정중히 부탁드립니다. 얼리 체크인 및 레이트 체크아웃은 당일 예약 상황에 따라 제한될 수 있으므로, 사전에 고객센터로 문의해 주시기 바랍니다.',
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
              '투숙하시는 모든 고객님께 최상의 쾌적함을 선사하기 위해 객실 내 서비스는 짝수 인원을 기준으로 제공됩니다. 따라서 숙박 인원은 2인, 4인, 6인으로 선택하셔서 예약 가능합니다.\n\n홀수 인원 선택 기준: 3인 투숙 시에는 4인 옵션을, 5인 투숙 시에는 6인 옵션을 선택해 주셔야 합니다. 인원 추가 요금 또한 선택하신 옵션(2인/4인/6인) 기준으로 일괄 설정되어 적용됩니다. (예: 3인이 머무시더라도 4인 옵션의 인원 추가 요금이 적용됩니다.)\n\n6인 초과 인원 안내: 6인을 초과하는 인원의 예약을 원하실 경우에는, 먼저 6인 옵션으로 예약을 완료하신 후 반드시 고객센터로 미리 문의해 주시기 바랍니다.\n\n유의 사항: 사전에 협의되지 않은 6인 초과 인원의 숙박이 확인될 경우, 공간 관리 및 안전 규정상 예약이 즉시 취소되며 숙박료는 환불되지 않는 점 정중히 안내해 드립니다.',
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
              '봄, 여름, 가을 시즌에는 자연수 풀이 기본으로 준비되어 있습니다. 겨울철에는 미온수를 제공해 드리고 있으며, 숙박료에 미온수 유지 비용이 포함되어 있습니다. 수질 관리를 위해 입욕제나 배쓰밤 등 사용은 제한하고 있으며, 안전을 위해 아이들은 반드시 보호자와 함께 이용해 주시기 바랍니다.',
          },
          {
            question: '바비큐 이용이 가능한가요?',
            answer:
              '자연 속에서 즐기는 특별한 식사를 위해 개별 테라스에 프리미엄 바비큐 장비가 마련되어 있습니다. 예약 시 미리 신청해 주시면 필요한 물품을 준비해 드립니다.',
          },
          {
            question: '객실 내에서 바비큐나 요리가 가능한가요?',
            answer:
              '쾌적하고 깔끔한 실내 환경과 가구 보호를 위해 객실 내에서는 냄새가 많이 나는 육류나 생선류의 조리가 제한됩니다. 대신 지정된 야외 바비큐 공간이나 주방 내 지정된 조리 기구를 이용해 주시기 바랍니다. 화재 예방을 위해 개인 화기(버너, 숯, 폭죽 등)의 반입은 금지됩니다.',
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
              '고객님의 온전한 휴식을 방해하지 않도록 비대면 서비스를 지향하고 있습니다. 다만, 머무시는 동안 도움이 필요하시거나 문의 사항이 있으실 경우 아래 채널 중 하나로 연락해 주시면 신속하고 정중하게 안내해 드리겠습니다.\n\n· 고객센터(오전 10시~18시 운영): 02-514-5536\n· 카카오톡: @REPAUSE 채널\n· 인스타그램: @repause_poolvilla',
            cta: { href: 'https://pf.kakao.com/_repause', label: '카카오톡 문의하기' },
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
    '환불 대금은 최종 납부 금액을 기준으로 정교하게 산정되어 정돈됩니다.',
    '예약 신청 및 접수 당일 취소의 경우에도 이용 예정일을 기준으로 반환 기준이 동일하게 적용됩니다.',
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
    '노쇼(No-Show): 이용 당일 사전 연락 없는 부재 시 일정 및 결제 반환은 불가합니다.',
    '일정 변경: 이용 예정일 10일 전까지만 조정이 가용하며, 그 이후에는 정해진 규정에 의거하여 정산 처리됩니다.',
    '기상 악화로 교통 결항 시 증빙 제출하면 100% 환불 또는 날짜 변경 가능.',
    '정산 대금 환급은 요청 접수일 이후 영업일 기준 3~5일 내외로 매끄럽게 정리됩니다.',
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
