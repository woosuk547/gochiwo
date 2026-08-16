import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReservationConfirmed } from '@/lib/mailer'
import {
  expireStalePendingReservations,
  findOverlappingHold,
  isUnpaidHoldExpired,
  orderIdBelongsToReservation,
  serializeReservation,
} from '@/lib/reservation-service'

const UNPAID_STATUSES = ['REVIEW_PENDING', 'PAYMENT_GUIDE_SENT'] as const

async function fetchTossPayment(paymentKey: string, basicAuth: string) {
  const response = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`, {
    headers: { Authorization: `Basic ${basicAuth}` },
  })
  const data = await response.json()
  return { ok: response.ok, data }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentKey, orderId, amount, reservationId, paymentType } = body

    if (!paymentKey || !orderId || amount == null || !reservationId) {
      return NextResponse.json({ error: '필수 결제 승인 정보가 누락되었습니다.' }, { status: 400 })
    }

    if (typeof paymentKey !== 'string' || typeof orderId !== 'string' || typeof reservationId !== 'string') {
      return NextResponse.json({ error: '결제 승인 정보가 올바르지 않습니다.' }, { status: 400 })
    }

    if (!orderIdBelongsToReservation(orderId, reservationId)) {
      return NextResponse.json({ error: '주문 정보가 예약과 일치하지 않습니다.' }, { status: 400 })
    }

    await expireStalePendingReservations()

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    })

    if (!reservation) {
      return NextResponse.json({ error: '해당 예약을 찾을 수 없습니다.' }, { status: 404 })
    }

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

    if (isUnpaidHoldExpired(reservation)) {
      await prisma.reservation.updateMany({
        where: { id: reservationId, ...{ status: 'PENDING', paymentStatus: { in: [...UNPAID_STATUSES] } } },
        data: { status: 'CANCELLED' },
      })
      return NextResponse.json({ error: '결제 기한이 지나 일정이 해제되었어요. 다시 예약해 주세요.' }, { status: 400 })
    }

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

    const claimed = await prisma.$transaction(async (tx) => {
      await expireStalePendingReservations(new Date(), tx)

      const current = await tx.reservation.findUnique({ where: { id: reservationId } })
      if (!current) return { ok: false as const, error: '해당 예약을 찾을 수 없습니다.', status: 404 }
      if (current.status === 'CANCELLED' || current.status === 'DECLINED') {
        return { ok: false as const, error: '취소되거나 거절된 예약은 결제할 수 없습니다.', status: 400 }
      }
      if (current.paymentStatus === 'PAID' || current.paymentStatus === 'DEPOSIT_PAID') {
        return { ok: false as const, error: 'ALREADY_PAID', status: 200 }
      }
      if (isUnpaidHoldExpired(current)) {
        await tx.reservation.updateMany({
          where: { id: reservationId, status: 'PENDING', paymentStatus: { in: [...UNPAID_STATUSES] } },
          data: { status: 'CANCELLED' },
        })
        return { ok: false as const, error: '결제 기한이 지나 일정이 해제되었어요. 다시 예약해 주세요.', status: 400 }
      }

      const overlap = await findOverlappingHold(tx, current.checkIn, current.checkOut, current.id)
      if (overlap) {
        return { ok: false as const, error: '선택한 일정에는 이미 다른 예약이 있습니다.', status: 409 }
      }

      const keyTaken = await tx.reservation.findFirst({
        where: { paymentKey, id: { not: reservationId } },
      })
      if (keyTaken) {
        return { ok: false as const, error: '이미 다른 예약에 사용된 결제입니다.', status: 409 }
      }

      const claim = await tx.reservation.updateMany({
        where: {
          id: reservationId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          paymentStatus: { in: [...UNPAID_STATUSES] },
          OR: [{ paymentKey: null }, { paymentKey }],
        },
        data: { paymentKey, orderId },
      })

      if (claim.count === 0) {
        return { ok: false as const, error: '결제를 동시에 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.', status: 409 }
      }

      return { ok: true as const }
    }, { timeout: 15000 })

    if (!claimed.ok) {
      if (claimed.error === 'ALREADY_PAID') {
        return NextResponse.json({ message: '이미 결제가 승인된 예약입니다.', status: 'ALREADY_PAID' }, { status: 200 })
      }
      return NextResponse.json({ error: claimed.error }, { status: claimed.status })
    }

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
      const alreadyApproved =
        tossData.code === 'ALREADY_PROCESSED_PAYMENT' ||
        tossData.code === 'DUPLICATE_REQUEST' ||
        String(tossData.message || '').includes('이미')

      if (!alreadyApproved) {
        await prisma.reservation.updateMany({
          where: {
            id: reservationId,
            paymentKey,
            paymentStatus: { in: [...UNPAID_STATUSES] },
          },
          data: { paymentKey: null, orderId: null },
        })
        console.error('Toss Payments confirmation failed API response:', tossData)
        return NextResponse.json(
          { error: tossData.message || '토스페이먼츠 결제 승인에 실패했습니다.' },
          { status: tossResponse.status },
        )
      }

      const existing = await fetchTossPayment(paymentKey, basicAuth)
      const tossOrderId = typeof existing.data?.orderId === 'string' ? existing.data.orderId : ''
      const tossAmount = Number(existing.data?.totalAmount ?? existing.data?.balanceAmount ?? 0)
      if (!existing.ok || !orderIdBelongsToReservation(tossOrderId, reservationId) || tossAmount !== expectedAmount) {
        await prisma.reservation.updateMany({
          where: {
            id: reservationId,
            paymentKey,
            paymentStatus: { in: [...UNPAID_STATUSES] },
          },
          data: { paymentKey: null, orderId: null },
        })
        return NextResponse.json({ error: '결제 정보가 이 예약과 일치하지 않습니다.' }, { status: 409 })
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
