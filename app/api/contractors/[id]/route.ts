import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/contractors/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const contractor = await prisma.contractor.findUnique({
      where: { id },
      include: {
        reviews: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    })

    if (!contractor) {
      return NextResponse.json({ error: '업체를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(contractor)
  } catch (error) {
    console.error('업체 조회 실패:', error)
    return NextResponse.json({ error: '업체 정보를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}

// PATCH /api/contractors/[id] - 관리자 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { verified, trustScore, name, phone, serviceArea, description, specialties } = body

    const updateData: any = {}
    if (verified !== undefined) {
      updateData.verified = verified
      updateData.verifiedAt = verified ? new Date() : null
    }
    if (trustScore !== undefined) updateData.trustScore = Math.min(100, Math.max(0, trustScore))
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (serviceArea !== undefined) updateData.serviceArea = serviceArea
    if (description !== undefined) updateData.description = description
    if (specialties !== undefined) updateData.specialties = JSON.stringify(specialties)

    const contractor = await prisma.contractor.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(contractor)
  } catch (error) {
    console.error('업체 수정 실패:', error)
    return NextResponse.json({ error: '업체 정보 수정에 실패했습니다.' }, { status: 500 })
  }
}

// DELETE /api/contractors/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.contractor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('업체 삭제 실패:', error)
    return NextResponse.json({ error: '업체 삭제에 실패했습니다.' }, { status: 500 })
  }
}
