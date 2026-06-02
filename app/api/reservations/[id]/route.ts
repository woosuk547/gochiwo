import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { formatDateKey, type PaymentMethod, type PaymentStatus, type ReservationStatus } from '@/lib/booking'
import { sendPaymentGuide, sendReservationConfirmed } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'
import { serializeReservation } from '@/lib/reservation-service'

const allowedStatuses: ReservationStatus[] = ['PENDING', 'CONFIRMED', 'DECLINED', 'CANCELLED']
const allowedPaymentStatuses: PaymentStatus[] = ['REVIEW_PENDING', 'PAYMENT_GUIDE_SENT', 'DEPOSIT_PAID', 'PAID', 'REFUNDED']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const status = typeof body.status === 'string' ? body.status : ''
    const paymentStatus = typeof body.paymentStatus === 'string' ? body.paymentStatus : ''
    const note = typeof body.note === 'string' ? body.note : undefined
    const { id } = await params

    if (status && !allowedStatuses.includes(status as ReservationStatus)) {
      return NextResponse.json({ error: '올바르지 않은 예약 상태입니다.' }, { status: 400 })
    }

    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus as PaymentStatus)) {
      return NextResponse.json({ error: '올바르지 않은 결제 상태입니다.' }, { status: 400 })
    }

    if (!status && !paymentStatus && note === undefined) {
      return NextResponse.json({ error: '업데이트할 값이 없습니다.' }, { status: 400 })
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        ...(status ? { status: status as ReservationStatus } : {}),
        ...(paymentStatus ? { paymentStatus: paymentStatus as PaymentStatus } : {}),
        ...(paymentStatus === 'PAYMENT_GUIDE_SENT' ? { requestedAt: new Date() } : {}),
        ...(paymentStatus === 'PAID' ? { paidAt: new Date() } : {}),
        ...(note !== undefined ? { note } : {}),
      },
    })

    if (status === 'CONFIRMED') {
      sendReservationConfirmed({
        to: reservation.email,
        guestName: reservation.guestName,
        checkIn: formatDateKey(reservation.checkIn),
        checkOut: formatDateKey(reservation.checkOut),
        guests: reservation.guests,
        finalAmount: reservation.finalAmount,
        paymentMethod: reservation.paymentMethod as PaymentMethod,
      }).catch((emailError) => {
        console.error('Failed to send reservation confirmed email:', emailError)
      })
    }

    if (paymentStatus === 'PAYMENT_GUIDE_SENT') {
      sendPaymentGuide({
        id: reservation.id,
        to: reservation.email,
        guestName: reservation.guestName,
        checkIn: formatDateKey(reservation.checkIn),
        checkOut: formatDateKey(reservation.checkOut),
        finalAmount: reservation.finalAmount,
        depositAmount: reservation.depositAmount,
        paymentMethod: reservation.paymentMethod as PaymentMethod,
      }).catch((emailError) => {
        console.error('Failed to send payment guide email:', emailError)
      })
    }

    return NextResponse.json(serializeReservation(reservation))
  } catch {
    return NextResponse.json({ error: '예약 상태를 업데이트하지 못했습니다.' }, { status: 500 })
  }
}
