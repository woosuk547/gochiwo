import 'dotenv/config'
import { PrismaClient } from './lib/generated/prisma/client'

const prisma = new PrismaClient()
const KAKAO_API_KEY = process.env.KAKAO_API_KEY || ''

// 전국 시/구 단위 검색 지역
const NATIONWIDE_AREAS = [
  // 서울 25개 구
  '서울 강남구', '서울 강동구', '서울 강북구', '서울 강서구', '서울 관악구',
  '서울 광진구', '서울 구로구', '서울 금천구', '서울 노원구', '서울 도봉구',
  '서울 동대문구', '서울 동작구', '서울 마포구', '서울 서대문구', '서울 서초구',
  '서울 성동구', '서울 성북구', '서울 송파구', '서울 양천구', '서울 영등포구',
  '서울 용산구', '서울 은평구', '서울 종로구', '서울 중구', '서울 중랑구',

  // 부산 16개 구/군
  '부산 강서구', '부산 금정구', '부산 기장군', '부산 남구', '부산 동구',
  '부산 동래구', '부산 부산진구', '부산 북구', '부산 사상구', '부산 사하구',
  '부산 서구', '부산 수영구', '부산 연제구', '부산 영도구', '부산 중구', '부산 해운대구',

  // 대구 8개 구/군
  '대구 남구', '대구 달서구', '대구 달성군', '대구 동구', '대구 북구',
  '대구 서구', '대구 수성구', '대구 중구',

  // 인천 10개 구/군
  '인천 계양구', '인천 남동구', '인천 동구', '인천 미추홀구', '인천 부평구',
  '인천 서구', '인천 연수구', '인천 중구', '인천 강화군', '인천 옹진군',

  // 광주 5개 구
  '광주 광산구', '광주 남구', '광주 동구', '광주 북구', '광주 서구',

  // 대전 5개 구
  '대전 대덕구', '대전 동구', '대전 서구', '대전 유성구', '대전 중구',

  // 울산 5개 구/군
  '울산 남구', '울산 동구', '울산 북구', '울산 중구', '울산 울주군',

  // 세종
  '세종시',

  // 경기도 주요 31개 시/군
  '경기 수원시', '경기 성남시', '경기 고양시', '경기 용인시', '경기 부천시',
  '경기 안산시', '경기 안양시', '경기 남양주시', '경기 화성시', '경기 평택시',
  '경기 의정부시', '경기 시흥시', '경기 파주시', '경기 김포시', '경기 광명시',
  '경기 광주시', '경기 군포시', '경기 하남시', '경기 오산시', '경기 이천시',
  '경기 안성시', '경기 의왕시', '경기 여주시', '경기 동두천시', '경기 과천시',
  '경기 구리시', '경기 포천시', '경기 양주시', '경기 가평군', '경기 연천군', '경기 양평군',

  // 강원도 주요 시/군
  '강원 춘천시', '강원 원주시', '강원 강릉시', '강원 동해시', '강원 속초시',
  '강원 삼척시', '강원 태백시', '강원 홍천군', '강원 횡성군', '강원 평창군',

  // 충청북도 주요 시/군
  '충북 청주시', '충북 충주시', '충북 제천시', '충북 음성군', '충북 진천군',
  '충북 증평군', '충북 괴산군', '충북 보은군',

  // 충청남도 주요 시/군
  '충남 천안시', '충남 공주시', '충남 보령시', '충남 아산시', '충남 서산시',
  '충남 논산시', '충남 계룡시', '충남 당진시', '충남 홍성군', '충남 예산군',

  // 전라북도 주요 시/군
  '전북 전주시', '전북 군산시', '전북 익산시', '전북 정읍시', '전북 남원시',
  '전북 김제시', '전북 완주군', '전북 고창군', '전북 부안군',

  // 전라남도 주요 시/군
  '전남 목포시', '전남 여수시', '전남 순천시', '전남 나주시', '전남 광양시',
  '전남 담양군', '전남 곡성군', '전남 화순군', '전남 장성군', '전남 영암군',

  // 경상북도 주요 시/군
  '경북 포항시', '경북 경주시', '경북 김천시', '경북 안동시', '경북 구미시',
  '경북 영주시', '경북 영천시', '경북 상주시', '경북 문경시', '경북 경산시',
  '경북 칠곡군', '경북 성주군',

  // 경상남도 주요 시/군
  '경남 창원시', '경남 진주시', '경남 통영시', '경남 사천시', '경남 김해시',
  '경남 밀양시', '경남 거제시', '경남 양산시', '경남 함안군', '경남 창녕군',
  '경남 고성군', '경남 하동군', '경남 합천군',

  // 제주
  '제주 제주시', '제주 서귀포시',
]

const SEARCH_KEYWORDS = [
  // 보일러/난방
  { keyword: '보일러수리', specialties: ['보일러수리', '난방', '온수'] },
  { keyword: '보일러집수리', specialties: ['보일러수리', '집수리', '난방'] },
  { keyword: '보일러설치', specialties: ['보일러설치', '보일러교체', '난방공사'] },

  // 배관/누수
  { keyword: '누수수리', specialties: ['누수탐지', '배관수리', '방수'] },
  { keyword: '누수탐지', specialties: ['누수탐지', '방수공사', '누수수리'] },
  { keyword: '배관수리', specialties: ['배관공사', '수도배관', '하수구'] },
  { keyword: '하수구막힘', specialties: ['하수구', '배수구', '막힘해결'] },
  { keyword: '수도공사', specialties: ['수도배관', '수전교체', '배관공사'] },

  // 전기
  { keyword: '전기수리', specialties: ['전기공사', '누전수리', '조명'] },
  { keyword: '전기공사', specialties: ['전기공사', '배선', '분전반'] },

  // 인테리어/도배
  { keyword: '도배장판', specialties: ['도배', '장판', '인테리어'] },
  { keyword: '도배사', specialties: ['도배', '벽지', '인테리어'] },

  // 에어컨
  { keyword: '에어컨수리', specialties: ['에어컨설치', '에어컨수리', 'A/S'] },
  { keyword: '에어컨설치', specialties: ['에어컨설치', '에어컨이전', '냉방'] },

  // 욕실/타일
  { keyword: '욕실수리', specialties: ['욕실리모델링', '타일', '방수'] },
  { keyword: '타일공사', specialties: ['타일', '욕실타일', '바닥타일'] },
  { keyword: '방수공사', specialties: ['방수', '누수방지', '외벽방수'] },

  // 종합
  { keyword: '집수리', specialties: ['종합수리', '집수리', '인테리어'] },
  { keyword: '싱크대수리', specialties: ['싱크대', '주방설비', '수전교체'] },
]

interface KakaoPlace {
  id: string
  place_name: string
  phone: string
  address_name: string
  road_address_name: string
  x: string
  y: string
  category_name: string
}

interface KakaoResponse {
  documents: KakaoPlace[]
  meta: {
    total_count: number
    pageable_count: number
    is_end: boolean
  }
}

async function searchKakao(query: string, page = 1): Promise<KakaoResponse> {
  const params = new URLSearchParams({
    query,
    page: page.toString(),
    size: '15',
    sort: 'accuracy',
  })

  const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params}`, {
    headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) throw new Error(`Kakao API ${response.status}: ${await response.text()}`)
  return response.json() as Promise<KakaoResponse>
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function extractServiceArea(address: string): string {
  const parts = address.split(' ')
  if (parts.length >= 2) return `${parts[0]} ${parts[1]}`
  return address
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

async function main() {
  console.log('카카오 로컬 API 전국 업체 수집 시작...')
  console.log(`키워드 ${SEARCH_KEYWORDS.length}개 × 전국 ${NATIONWIDE_AREAS.length}개 지역\n`)

  const collectedMap = new Map<string, KakaoPlace & { specialties: string[] }>()
  let totalApiCalls = 0

  for (const { keyword, specialties } of SEARCH_KEYWORDS) {
    process.stdout.write(`[${keyword}] `)

    for (const area of NATIONWIDE_AREAS) {
      const query = `${area} ${keyword}`
      let page = 1

      try {
        while (page <= 3) {
          const result = await searchKakao(query, page)
          totalApiCalls++

          for (const place of result.documents) {
            if (!place.phone) continue

            const key = normalizePhone(place.phone)
            if (key.length < 9) continue

            if (!collectedMap.has(key)) {
              collectedMap.set(key, { ...place, specialties })
            }
          }

          if (result.meta.is_end) break
          page++
          await delay(80)
        }
      } catch {
        process.stdout.write('!')
      }

      process.stdout.write('.')
      await delay(80)
    }

    console.log(` → 누적 ${collectedMap.size}개`)
  }

  console.log(`\n총 API 호출: ${totalApiCalls}회`)
  console.log(`고유 업체 수집: ${collectedMap.size}개`)

  if (collectedMap.size === 0) {
    console.log('수집된 업체가 없습니다.')
    return
  }

  console.log('\nDB 저장 시작...')

  let saved = 0
  let skipped = 0
  let errors = 0

  for (const [phoneKey, place] of collectedMap) {
    try {
      const existing = await prisma.contractor.findFirst({
        where: { phone: { contains: phoneKey.slice(-8) } },
      })

      if (existing) {
        // address 없으면 업데이트
        if (!existing.address) {
          const fullAddress = place.road_address_name || place.address_name || null
          if (fullAddress) {
            await prisma.contractor.update({
              where: { id: existing.id },
              data: { address: fullAddress },
            })
          }
        }
        skipped++
        continue
      }

      await prisma.contractor.create({
        data: {
          name: place.place_name,
          phone: place.phone,
          serviceArea: extractServiceArea(place.address_name),
          address: place.road_address_name || place.address_name || null,
          latitude: parseFloat(place.y),
          longitude: parseFloat(place.x),
          rating: 4.0,
          reviewCount: 0,
          completedJobs: 0,
          trustScore: 70.0,
          responseTime: 60,
          description: place.category_name || null,
          specialties: JSON.stringify(place.specialties),
          verified: false,
        },
      })

      saved++
    } catch {
      errors++
    }
  }

  console.log(`\n저장: ${saved}개`)
  console.log(`중복 스킵: ${skipped}개`)
  if (errors > 0) console.log(`에러: ${errors}개`)
  console.log('완료!')
}

main()
  .catch(e => {
    console.error('실패:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
