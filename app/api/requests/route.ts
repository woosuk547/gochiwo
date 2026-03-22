import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/requests - 고객 요청 목록 조회
export async function GET() {
  try {
    const requests = await prisma.customerRequest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('고객 요청 조회 실패:', error)
    return NextResponse.json(
      { error: '고객 요청 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/requests - 고객 요청 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, address, latitude, longitude, imageUrl } = body

    // 입력값 검증
    if (!title || !description) {
      return NextResponse.json(
        { error: '필수 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    const newRequest = await prisma.customerRequest.create({
      data: {
        title,
        description,
        address: address || null,
        latitude: latitude || null,
        longitude: longitude || null,
        imageUrl: imageUrl || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json(newRequest, { status: 201 })
  } catch (error) {
    console.error('고객 요청 생성 실패:', error)
    return NextResponse.json(
      { error: '고객 요청을 생성하는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
