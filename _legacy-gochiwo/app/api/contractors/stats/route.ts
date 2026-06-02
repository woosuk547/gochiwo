import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

// GET /api/contractors/stats
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const [total, verified, avgResult] = await Promise.all([
      prisma.contractor.count(),
      prisma.contractor.count({ where: { verified: true } }),
      prisma.contractor.aggregate({ _avg: { trustScore: true } }),
    ])

    return NextResponse.json({
      total,
      verified,
      avgTrustScore: avgResult._avg.trustScore ?? 0,
    })
  } catch (error) {
    console.error('통계 조회 실패:', error)
    return NextResponse.json({ total: 0, verified: 0, avgTrustScore: 0 }, { status: 500 })
  }
}
