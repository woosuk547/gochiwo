import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateDistance } from '@/lib/distance'

// 수리·시공과 무관한 광고성/판매 카테고리
const SPAM_KEYWORDS = [
  '전자제품판매', '건설자재', '철물점', '전기자재', '중고가전',
  '조명기기판매', '직업전문교육', '인테리어장식판매', '공사,공단',
  '청소대행', '냉난방기제조',
]

// GET /api/contractors/match?lat=37.5&lng=127.0&radius=10&limit=20
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const radius = parseFloat(searchParams.get('radius') || '10')
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))

  if (!lat || !lng) {
    return NextResponse.json({ error: '위치 정보가 필요합니다.' }, { status: 400 })
  }

  try {
    // 바운딩 박스로 1차 필터 (DB 부하 감소)
    const latDelta = radius / 111
    const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180))

    const candidates = await prisma.contractor.findMany({
      where: {
        latitude: { gte: lat - latDelta, lte: lat + latDelta },
        longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
        trustScore: { gte: 50 }, // 광고성 업체(30점) 1차 제외
      },
      select: {
        id: true,
        name: true,
        phone: true,
        serviceArea: true,
        address: true,
        latitude: true,
        longitude: true,
        rating: true,
        reviewCount: true,
        trustScore: true,
        responseTime: true,
        completedJobs: true,
        specialties: true,
        description: true,
        verified: true,
      },
    })

    // 유효하지 않은 전화번호 + 광고성 업체 제외
    const validCandidates = candidates.filter((c) => {
      const digits = c.phone.replace(/[^0-9]/g, '')
      if (digits.length < 9 || digits.length > 11) return false
      if (c.description && SPAM_KEYWORDS.some(kw => c.description!.includes(kw))) return false
      return true
    })

    // 정확한 거리 계산 + 개선된 매칭 점수
    const results = validCandidates
      .map((c) => {
        const distance = calculateDistance(lat, lng, c.latitude, c.longitude)
        // 거리 점수: 반경 내 거리 반비례 (가까울수록 높음)
        const distanceScore = Math.max(0, 100 - (distance / radius) * 100)
        // 리뷰 평점 보너스: 리뷰가 있는 경우만 반영 (최대 ±10점)
        const ratingBonus = c.reviewCount > 0
          ? Math.max(-10, Math.min(10, (c.rating - 3.5) * 5))
          : 0
        // 완료 건수 보너스
        const jobsBonus = c.completedJobs >= 50 ? 8
          : c.completedJobs >= 10 ? 4
          : c.completedJobs >= 3 ? 2
          : 0
        // 개선된 가중치: 신뢰점수 50% + 거리 40% + 인증 +5 + 리뷰/건수 보너스
        const score = c.trustScore * 0.5
          + distanceScore * 0.4
          + (c.verified ? 5 : 0)
          + ratingBonus
          + jobsBonus
        return { ...c, distance, score }
      })
      .filter((c) => c.distance <= radius)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return NextResponse.json(results)
  } catch (error) {
    console.error('업체 매칭 실패:', error)
    return NextResponse.json({ error: '업체 매칭에 실패했습니다.' }, { status: 500 })
  }
}
