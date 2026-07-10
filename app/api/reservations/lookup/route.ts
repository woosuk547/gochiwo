import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const id = searchParams.get('id')
  const email = searchParams.get('email')

  if (!id || !email) {
    return NextResponse.json({ error: '예약 번호와 이메일을 모두 입력해 주세요.' }, { status: 400 })
  }

  const reservation = await prisma.reservation.findFirst({
    where: {
      id: id.trim(),
      email: email.trim().toLowerCase(),
    },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      guestName: true,
      email: true,
      checkIn: true,
      checkOut: true,
      guests: true,
      finalAmount: true,
      depositAmount: true,
      paymentMethod: true,
      createdAt: true,
    },
  })

  if (!reservation) {
    return NextResponse.json(
      { error: '일치하는 예약 정보를 찾을 수 없습니다. 예약 번호와 이메일을 다시 확인해 주세요.' },
      { status: 404 },
    )
  }

  return NextResponse.json({
    ...reservation,
    checkIn: reservation.checkIn.toISOString().slice(0, 10),
    checkOut: reservation.checkOut.toISOString().slice(0, 10),
    createdAt: reservation.createdAt.toISOString(),
  })
}
