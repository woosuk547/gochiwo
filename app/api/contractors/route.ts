import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/contractors?page=1&limit=20&search=강남&verified=true
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))
  const search = searchParams.get('search') || ''
  const verifiedParam = searchParams.get('verified')
  const category = searchParams.get('category') || ''
  const region = searchParams.get('region') || ''
  const minTrustScore = searchParams.get('minTrustScore')
  const maxTrustScore = searchParams.get('maxTrustScore')

  const where: any = {}

  if (minTrustScore || maxTrustScore) {
    where.trustScore = {
      ...(minTrustScore ? { gte: parseFloat(minTrustScore) } : {}),
      ...(maxTrustScore ? { lte: parseFloat(maxTrustScore) } : {}),
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { serviceArea: { contains: search } },
      { description: { contains: search } },
    ]
  }

  if (category) {
    where.description = { contains: category }
  }

  if (region) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : []),
      { OR: [
        { serviceArea: { contains: region } },
        { address: { contains: region } },
      ]},
    ]
  }

  if (verifiedParam !== null) {
    where.verified = verifiedParam === 'true'
  }

  try {
    const [data, total] = await Promise.all([
      prisma.contractor.findMany({
        where,
        orderBy: { trustScore: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
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
          completedJobs: true,
          trustScore: true,
          responseTime: true,
          profileImage: true,
          description: true,
          specialties: true,
          verified: true,
          verifiedAt: true,
          createdAt: true,
        },
      }),
      prisma.contractor.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('업체 조회 실패:', error)
    return NextResponse.json({ error: '업체 목록을 가져오는데 실패했습니다.' }, { status: 500 })
  }
}

// POST /api/contractors - 업체 가입 신청
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, serviceArea, latitude, longitude, description, specialties } = body

    if (!name || !phone || !serviceArea) {
      return NextResponse.json({ error: '업체명, 전화번호, 서비스 지역은 필수입니다.' }, { status: 400 })
    }

    if (!latitude || !longitude) {
      return NextResponse.json({ error: '서비스 지역 좌표가 필요합니다.' }, { status: 400 })
    }

    const existing = await prisma.contractor.findFirst({
      where: { phone: { contains: phone.replace(/[^0-9]/g, '').slice(-8) } },
    })

    if (existing) {
      return NextResponse.json({ error: '이미 등록된 전화번호입니다.' }, { status: 409 })
    }

    const contractor = await prisma.contractor.create({
      data: {
        name,
        phone,
        serviceArea,
        latitude,
        longitude,
        description: description || null,
        specialties: specialties ? JSON.stringify(specialties) : null,
        verified: false,
        trustScore: 70.0,
      },
    })

    return NextResponse.json(contractor, { status: 201 })
  } catch (error) {
    console.error('업체 가입 실패:', error)
    return NextResponse.json({ error: '업체 등록에 실패했습니다.' }, { status: 500 })
  }
}
