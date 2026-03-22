import 'dotenv/config'
import { PrismaClient } from './lib/generated/prisma/client'

const prisma = new PrismaClient()

// data.go.kr에서 발급받은 키 (없으면 KISCON 단계 스킵)
const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY || ''

// ── 카테고리 설정 ─────────────────────────────────────────────

// verified: true + 높은 신뢰점수
const VERIFIED_CATEGORIES: Record<string, number> = {
  '서비스,산업 > 건설,건축 > 시공업체 > 배관,누수시공': 88,
  '서비스,산업 > 건설,건축 > 시공업체 > 주택수리':     85,
  '서비스,산업 > 건설,건축 > 시공업체 > 전기시공':     85,
  '서비스,산업 > 건설,건축 > 시공업체 > 냉난방기시공': 85,
  '서비스,산업 > 건설,건축 > 시공업체 > 방수,방음시공':85,
  '서비스,산업 > 건설,건축 > 시공업체 > 산업설비시공': 82,
  '서비스,산업 > 건설,건축 > 시공업체':               80,
  '서비스,산업 > 건설,건축 > 인테리어':               78,
  '서비스,산업 > 건설,건축 > 인테리어 > 한샘리하우스': 82,
  '서비스,산업 > 건설,건축 > 인테리어 > LX지인':      82,
  '서비스,산업 > 건설,건축 > 인테리어 > 리바트집테리어':80,
  '서비스,산업 > 건설,건축 > 소방기구,소방설비':       78,
}

// verified: false + 보통 신뢰점수 (유관 업종)
const RELATED_CATEGORIES: Record<string, number> = {
  '가정,생활 > 전자제품 > 전자제품서비스센터':              65,
  '가정,생활 > 전자제품 > 전자제품판매 > 보일러판매':        62,
  '가정,생활 > 전자제품 > 전자제품판매 > 보일러판매 > 귀뚜라미보일러': 68,
  '서비스,산업 > 건설,건축 > 건설자재':                    60,
  '서비스,산업 > 건설,건축 > 건설자재 > 바닥재':           60,
  '서비스,산업 > 건설,건축 > 건설자재 > 페인트,도장':       62,
  '서비스,산업 > 건설,건축 > 건설자재 > 내,외장재':         60,
  '서비스,산업 > 건설,건축':                              65,
  '가정,생활 > 생활용품점 > 철물점':                      55,
  '서비스,산업 > 전문대행 > 청소대행':                    55,
  '가정,생활 > 전자제품':                                60,
  '서비스,산업 > 제조업 > 전기,전자 > 전기자재,부품':       58,
  '서비스,산업 > 제조업 > 전기,전자 > 냉난방기제조':        60,
}

// 삭제 대상 (집수리와 무관)
const DELETE_CATEGORIES = new Set([
  '교육,학문 > 직업전문교육',
  '교육,학문 > 학원',
  '금융,보험 > 금융서비스 > 자산관리,자산운용',
  '교통,수송 > 자동차 > 자동차정비',
  '사회,공공기관 > 공사,공단',
  '사회,공공기관 > 공사,공단 > 한국수자원공사',
  '사회,공공기관 > 단체,협회',
  '서비스,산업 > 전문대행 > 직업소개,인력파견',
  '가정,생활 > 중고용품 > 중고가전',
  '가정,생활 > 생활용품점 > 열쇠',
  '가정,생활 > 생활용품점 > 열쇠,도장',
  '가정,생활 > 생활용품점 > 인테리어장식판매',
  '가정,생활 > 전자제품 > 전파사',
  '가정,생활 > 전자제품 > 전자제품판매',
  '가정,생활 > 전자제품 > 전자제품판매 > 조명기기판매',
])

// 전화번호 유효성 검사 (한국 번호 형식)
function isValidKoreanPhone(phone: string): boolean {
  const digits = phone.replace(/[^0-9]/g, '')
  // 02-xxxx-xxxx, 0xx-xxxx-xxxx, 1xxx-xxxx, 1xxx-xxxx-xxxx
  if (digits.length < 9 || digits.length > 11) return false
  if (digits.startsWith('02')) return digits.length >= 9
  if (digits.startsWith('0')) return digits.length === 10 || digits.length === 11
  if (digits.startsWith('1')) return digits.length === 8 || digits.length === 11
  return false
}

// ── KISCON API (serviceKey 있을 때만) ─────────────────────────

const SIDO_LIST = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
]

interface KisconItem {
  ncrGsKname?: string   // 업체명
  ncrAreaName?: string  // 등록시도
  ncrItemName?: string  // 등록업종
  ncrGsAddr?: string    // 소재지
}

interface KisconLookup {
  names: Set<string>
  phones: Set<string>
}

async function buildKisconMap(): Promise<KisconLookup> {
  const empty = { names: new Set<string>(), phones: new Set<string>() }
  if (!PUBLIC_DATA_API_KEY) return empty

  console.log('\n[3단계] KISCON 건설업 면허 DB 구축 중...')
  const names = new Set<string>()
  const phones = new Set<string>()

  for (const sido of SIDO_LIST) {
    let page = 1
    let total = 999

    while ((page - 1) * 1000 < total) {
      try {
        const params = new URLSearchParams({
          serviceKey: PUBLIC_DATA_API_KEY,
          pageNo: String(page),
          numOfRows: '1000',
          sDate: '20030101',
          eDate: '20261231',
          ncrAreaName: sido,
          _type: 'json',
        })

        const res = await fetch(
          `https://apis.data.go.kr/1613000/ConAdminInfoSvc1/GongsiReg?${params}`,
          { signal: AbortSignal.timeout(15000) }
        )

        if (!res.ok) break
        const data = await res.json()
        const body = data?.response?.body
        total = body?.totalCount || 0
        const items: KisconItem[] = body?.items?.item || []
        if (!Array.isArray(items)) break

        for (const item of items) {
          if (item.ncrGsKname) names.add(item.ncrGsKname.trim())
          if (item.ncrOffTel) phones.add(item.ncrOffTel.replace(/[^0-9]/g, ''))
        }

        page++
        await new Promise(r => setTimeout(r, 150))
      } catch {
        process.stdout.write('!')
        break
      }
    }

    process.stdout.write('.')
  }

  console.log(`\n→ KISCON 업체명 ${names.size}개 / 전화번호 ${phones.size}개 수집`)
  return { names, phones }
}

// ── 메인 ─────────────────────────────────────────────────────

async function main() {
  console.log('=== 업체 종합 검증 시작 ===\n')

  const all = await prisma.contractor.findMany()
  console.log(`전체 업체: ${all.length}개`)

  let deleted = 0
  let verified = 0
  let related = 0
  let phoneInvalid = 0
  let kisconMatched = 0

  // 3단계: KISCON 면허 DB (선택)
  const kiscon = await buildKisconMap()

  console.log('\n[1단계] 무관련 업체 제거 중...')
  for (const c of all) {
    const cat = c.description || ''
    if (DELETE_CATEGORIES.has(cat)) {
      await prisma.contractor.delete({ where: { id: c.id } })
      deleted++
    }
  }
  console.log(`→ 삭제: ${deleted}개`)

  console.log('\n[2단계] 카테고리 기반 검증 중...')
  const remaining = await prisma.contractor.findMany()

  for (const c of remaining) {
    const cat = c.description || ''
    const phoneValid = isValidKoreanPhone(c.phone)
    if (!phoneValid) phoneInvalid++

    let newVerified = c.verified
    let newTrustScore = c.trustScore

    // 전화번호 불량: -10점 처리 (기존 -5에서 강화)
    const phonePenalty = phoneValid ? 0 : -10

    if (VERIFIED_CATEGORIES[cat]) {
      newVerified = true
      newTrustScore = VERIFIED_CATEGORIES[cat] + phonePenalty
      verified++
    } else if (RELATED_CATEGORIES[cat]) {
      newVerified = false
      newTrustScore = RELATED_CATEGORIES[cat] + phonePenalty
      related++
    } else {
      // 카테고리 미분류 (시드 데이터 등)
      newTrustScore = phoneValid ? 70 : 60
    }

    // KISCON 면허 확인 (이름 또는 전화번호 매칭) — +5점으로 조정 (기존 +10)
    if (kiscon.names.size > 0) {
      const phoneKey = c.phone.replace(/[^0-9]/g, '')
      const phoneMatch = kiscon.phones.has(phoneKey)
      const nameMatch = kiscon.names.has(c.name.trim())
      if (phoneMatch || nameMatch) {
        newVerified = true
        newTrustScore = Math.min(100, newTrustScore + 5)
        kisconMatched++
      }
    }

    if (newVerified !== c.verified || newTrustScore !== c.trustScore) {
      await prisma.contractor.update({
        where: { id: c.id },
        data: { verified: newVerified, trustScore: newTrustScore, verifiedAt: newVerified && !c.verified ? new Date() : c.verifiedAt },
      })
    }
  }

  console.log(`→ 시공업체 verified: ${verified}개`)
  console.log(`→ 유관업체 (unverified): ${related}개`)
  console.log(`→ 전화번호 형식 불량: ${phoneInvalid}개 (-5점 처리)`)
  if (kiscon.names.size > 0) console.log(`→ KISCON 면허 추가 인증: ${kisconMatched}개`)

  // 최종 통계
  const final = await prisma.contractor.findMany({ select: { verified: true, trustScore: true } })
  const verifiedCount = final.filter(c => c.verified).length
  const avgTrust = (final.reduce((s, c) => s + c.trustScore, 0) / final.length).toFixed(1)

  console.log('\n=== 최종 결과 ===')
  console.log(`전체: ${final.length}개 (삭제: ${deleted}개)`)
  console.log(`인증됨: ${verifiedCount}개 (${((verifiedCount/final.length)*100).toFixed(1)}%)`)
  console.log(`평균 신뢰점수: ${avgTrust}점`)
}

main()
  .catch(e => { console.error('실패:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
