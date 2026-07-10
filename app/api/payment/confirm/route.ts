import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReservationConfirmed } from '@/lib/mailer'
import { serializeReservation } from '@/lib/reservation-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentKey, orderId, amount, reservationId, paymentType } = body

    if (!paymentKey || !orderId || amount == null || !reservationId) {
      return NextResponse.json({ error: '필수 결제 승인 정보가 누락되었습니다.' }, { status: 400 })
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    })

    if (!reservation) {
      return NextResponse.json({ error: '해당 예약을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 동일 paymentKey 멱등 처리
    if (reservation.paymentKey && reservation.paymentKey === paymentKey) {
      if (reservation.paymentStatus === 'PAID' || reservation.paymentStatus === 'DEPOSIT_PAID') {
        return NextResponse.json({
          message: '이미 결제가 승인된 예약입니다.',
          status: 'ALREADY_PAID',
          reservationId: reservation.id,
        })
      }
    }

    if (reservation.paymentStatus === 'PAID' || reservation.paymentStatus === 'DEPOSIT_PAID') {
      return NextResponse.json({ message: '이미 결제가 승인된 예약입니다.', status: 'ALREADY_PAID' }, { status: 200 })
    }

    if (reservation.status === 'CANCELLED' || reservation.status === 'DECLINED') {
      return NextResponse.json({ error: '취소되거나 거절된 예약은 결제할 수 없습니다.' }, { status: 400 })
    }

    if (reservation.status !== 'PENDING' && reservation.status !== 'CONFIRMED') {
      return NextResponse.json({ error: '결제할 수 없는 예약 상태입니다.' }, { status: 400 })
    }

    // paymentType 누락 시 기본 예약금. 이미 예약금 납부된 건은 위에서 early return.
    const resolvedType = paymentType === 'FULL' ? 'FULL' : 'DEPOSIT'
    const isDeposit = resolvedType === 'DEPOSIT'
    const expectedAmount = isDeposit ? reservation.depositAmount : reservation.finalAmount

    if (expectedAmount <= 0) {
      return NextResponse.json({ error: '온라인 결제가 불가능한 예약입니다.' }, { status: 400 })
    }

    if (Number(amount) !== expectedAmount) {
      return NextResponse.json({ error: '결제 금액이 올바르지 않습니다.' }, { status: 400 })
    }

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
      // 이미 승인된 paymentKey면 DB만 동기화 시도
      const alreadyApproved =
        tossData.code === 'ALREADY_PROCESSED_PAYMENT' ||
        tossData.code === 'DUPLICATE_REQUEST' ||
        String(tossData.message || '').includes('이미')

      if (!alreadyApproved) {
        console.error('Toss Payments confirmation failed API response:', tossData)
        return NextResponse.json(
          { error: tossData.message || '토스페이먼츠 결제 승인에 실패했습니다.' },
          { status: tossResponse.status }
        )
      }
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: isDeposit ? 'DEPOSIT_PAID' : 'PAID',
        paidAt: new Date(),
        paymentKey,
        orderId,
      },
    })

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
      paymentCompleted: true,
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
    console.error('Payment confirmation error:', error)
    return NextResponse.json({ error: '결제 승인 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
