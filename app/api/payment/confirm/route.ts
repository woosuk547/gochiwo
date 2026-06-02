import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReservationConfirmed } from '@/lib/mailer'
import { serializeReservation } from '@/lib/reservation-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentKey, orderId, amount, reservationId, paymentType } = body

    if (!paymentKey || !orderId || !amount || !reservationId) {
      return NextResponse.json({ error: '필수 결제 승인 정보가 누락되었습니다.' }, { status: 400 })
    }

    // 1. 해당 예약 데이터가 실존하는지 확인
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    })

    if (!reservation) {
      return NextResponse.json({ error: '해당 예약을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (reservation.paymentStatus === 'PAID' || reservation.paymentStatus === 'DEPOSIT_PAID') {
      return NextResponse.json({ message: '이미 결제가 승인된 예약입니다.', status: 'ALREADY_PAID' }, { status: 200 })
    }

    // 1-1. 결제 금액 위변조 방지: 클라이언트 amount를 신뢰하지 않고 DB 기준으로 재검증한다.
    const isDeposit = paymentType === 'DEPOSIT'
    const expectedAmount = isDeposit ? reservation.depositAmount : reservation.finalAmount

    if (expectedAmount <= 0) {
      return NextResponse.json({ error: '온라인 결제가 불가능한 예약입니다.' }, { status: 400 })
    }

    if (Number(amount) !== expectedAmount) {
      return NextResponse.json({ error: '결제 금액이 올바르지 않습니다.' }, { status: 400 })
    }

    // 2. 토스페이먼츠 시크릿 키 인코딩 및 API 호출
    const secretKey = process.env.TOSS_SECRET_KEY
    if (!secretKey) {
      console.error('TOSS_SECRET_KEY environment variable is not set')
      return NextResponse.json({ error: '결제 설정이 완료되지 않았습니다.' }, { status: 500 })
    }
    const basicAuth = Buffer.from(`${secretKey}:`).toString('base64')

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: expectedAmount,
      }),
    })

    const tossData = await tossResponse.json()

    if (!tossResponse.ok) {
      console.error('Toss Payments confirmation failed API response:', tossData)
      return NextResponse.json(
        { error: tossData.message || '토스페이먼츠 결제 승인에 실패했습니다.' },
        { status: tossResponse.status }
      )
    }

    // 3. 결제 승인 성공 시 DB 상태 업데이트
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: isDeposit ? 'DEPOSIT_PAID' : 'PAID',
        paidAt: new Date(),
      },
    })

    // 4. 예약 확정 알림 메일 전송
    const serialized = serializeReservation(updatedReservation)
    void sendReservationConfirmed({
      to: updatedReservation.email,
      guestName: updatedReservation.guestName,
      checkIn: serialized.checkIn,
      checkOut: serialized.checkOut,
      guests: updatedReservation.guests,
      paymentMethod: updatedReservation.paymentMethod,
      finalAmount: updatedReservation.finalAmount,
      paidAmount: expectedAmount,
      isDepositOnly: isDeposit,
    }).catch((emailError) => {
      console.error('Failed to send confirmation email:', emailError)
    })

    return NextResponse.json({
      success: true,
      reservationId: updatedReservation.id,
      status: updatedReservation.status,
      paymentStatus: updatedReservation.paymentStatus,
    })
  } catch (error) {
    console.error('Internal payment confirmation error:', error)
    return NextResponse.json(
      { error: '결제 승인 처리 중 서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
