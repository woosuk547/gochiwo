import 'dotenv/config'
import { PrismaClient } from './lib/generated/prisma/client'

const prisma = new PrismaClient()
const KAKAO_API_KEY = process.env.KAKAO_API_KEY || ''

async function searchKakaoByName(name: string, serviceArea: string): Promise<string | null> {
  const params = new URLSearchParams({
    query: `${serviceArea} ${name}`,
    size: '5',
    sort: 'accuracy',
  })

  const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params}`, {
    headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
    signal: AbortSignal.timeout(8000),
  })

  if (!response.ok) return null
  const data: any = await response.json()
  const docs = data.documents || []

  for (const doc of docs) {
    if (doc.place_name === name || doc.place_name.includes(name) || name.includes(doc.place_name)) {
      return doc.road_address_name || doc.address_name || null
    }
  }

  return null
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  const contractors = await prisma.contractor.findMany({
    where: { address: null },
    select: { id: true, name: true, serviceArea: true },
  })

  console.log(`주소 없는 업체: ${contractors.length}개`)

  let updated = 0
  let notFound = 0
  let errors = 0

  for (let i = 0; i < contractors.length; i++) {
    const c = contractors[i]
    try {
      const address = await searchKakaoByName(c.name, c.serviceArea)
      if (address) {
        await prisma.contractor.update({
          where: { id: c.id },
          data: { address },
        })
        updated++
      } else {
        notFound++
      }
    } catch {
      errors++
    }

    if ((i + 1) % 100 === 0) {
      console.log(`진행: ${i + 1}/${contractors.length} (업데이트: ${updated}, 미발견: ${notFound}, 에러: ${errors})`)
    }

    await delay(100)
  }

  console.log(`\n완료! 업데이트: ${updated}, 미발견: ${notFound}, 에러: ${errors}`)
}

main()
  .catch(e => { console.error('실패:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
