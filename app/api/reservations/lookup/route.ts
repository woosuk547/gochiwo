import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clientIp, rateLimitExceeded, tooManyRequestsResponse } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  if (rateLimitExceeded(`lookup:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return tooManyRequestsResponse()
  }

  const { searchParams } = request.nextUrl
  const id = searchParams.get('id')
  const email = searchParams.get('email')
  const phone = searchParams.get('phone')
  const name = searchParams.get('name')

  const select = {
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
  } as const

  function serialize(reservation: {
    checkIn: Date
    checkOut: Date
    createdAt: Date
  } & Record<string, unknown>) {
    return {
      ...reservation,
      checkIn: reservation.checkIn.toISOString().slice(0, 10),
      checkOut: reservation.checkOut.toISOString().slice(0, 10),
      createdAt: reservation.createdAt.toISOString(),
    }
  }

  // 전화번호 조회: 성함 + 전화번호로 본인 예약 목록 반환
  if (phone !== null || name !== null) {
    if (!phone?.trim() || !name?.trim()) {
      return NextResponse.json({ error: '예약자 성함과 전화번호를 모두 입력해 주세요.' }, { status: 400 })
    }
    const candidates = await prisma.reservation.findMany({
      where: { guestName: name.trim() },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { ...select, phone: true },
    })
    const digits = phone.replace(/[^0-9]/g, '')
    const reservations = candidates
      .filter((c) => c.phone.replace(/[^0-9]/g, '') === digits)
      .slice(0, 5)
      .map(({ phone: _omitted, ...rest }) => serialize(rest))
    if (reservations.length === 0) {
      return NextResponse.json(
        { error: '일치하는 예약 정보를 찾을 수 없어요. 성함과 전화번호를 다시 확인해 주세요.' },
        { status: 404 },
      )
    }
    return NextResponse.json({ reservations })
  }

  if (!id || !email) {
    return NextResponse.json({ error: '예약 번호와 이메일을 모두 입력해 주세요.' }, { status: 400 })
  }

  const reservation = await prisma.reservation.findFirst({
    where: {
      id: id.trim(),
      email: email.trim().toLowerCase(),
    },
    select,
  })

  if (!reservation) {
    return NextResponse.json(
      { error: '일치하는 예약 정보를 찾을 수 없습니다. 예약 번호와 이메일을 다시 확인해 주세요.' },
      { status: 404 },
    )
  }

  return NextResponse.json(serialize(reservation))
}
