import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/contractors/subregions?area=강남구
// 해당 지역 업체들의 주소에서 세부 지역(동/읍/면/로/길) 목록을 동적으로 반환
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const area = searchParams.get('area') || ''

  if (!area) return NextResponse.json([])

  const contractors = await prisma.contractor.findMany({
    where: {
      OR: [
        { serviceArea: { contains: area } },
        { address: { contains: area } },
      ],
      address: { not: null },
    },
    select: { address: true },
    take: 3000,
  })

  const countMap = new Map<string, number>()

  for (const c of contractors) {
    if (!c.address) continue
    const parts = c.address.split(' ')
    // area가 나오는 index 다음 token이 세부 지역
    const areaIdx = parts.findIndex(p => p.includes(area))
    if (areaIdx === -1) continue
    const token = parts[areaIdx + 1]
    if (!token || token.length < 2) continue
    // 숫자로만 이루어진 토큰 제외
    if (/^\d/.test(token)) continue
    countMap.set(token, (countMap.get(token) || 0) + 1)
  }

  // 빈도순 정렬, 상위 40개
  const sorted = Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([name]) => name)

  return NextResponse.json(sorted)
}
