import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/requests/[id] - 고객 요청 상태 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, contractorId } = body
    const { id } = params

    const updateData: Record<string, any> = {}

    if (contractorId !== undefined) {
      updateData.contractorId = contractorId
      // 업체 배정 시 자동으로 MATCHED 상태 전환
      updateData.status = 'MATCHED'
    }

    if (status) {
      const allowedStatuses = ['PENDING', 'MATCHED', 'COMPLETED']
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          { error: '올바르지 않은 상태값입니다.' },
          { status: 400 }
        )
      }
      updateData.status = status
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '업데이트할 항목이 없습니다.' }, { status: 400 })
    }

    const updatedRequest = await prisma.customerRequest.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedRequest)
  } catch (error: any) {
    console.error('고객 요청 업데이트 실패:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: '해당 요청을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: '고객 요청을 업데이트하는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
