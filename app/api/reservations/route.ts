import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import {
  parseDateInput,
  type PaymentMethod,
  type ReservationSource,
} from '@/lib/booking'
import { sendReservationConfirmation } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'
import {
  calculateReservationQuote,
  isPartnerBenefitLabel,
} from '@/lib/repause-pricing'
import {
  activeReservationStatuses,
  serializeReservation,
} from '@/lib/reservation-service'

const allowedPaymentMethods: PaymentMethod[] = ['CARD', 'BANK_TRANSFER', 'CORPORATE_BILLING']

class ReservationConflictError extends Error {
  constructor() {
    super('RESERVATION_CONFLICT')
    this.name = 'ReservationConflictError'
  }
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const reservations = await prisma.reservation.findMany({
    orderBy: [{ createdAt: 'desc' }, { checkIn: 'asc' }],
  })

  return NextResponse.json(reservations.map(serializeReservation))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const source: ReservationSource = body.source === 'PARTNERSHIP' ? 'PARTNERSHIP' : 'DIRECT'
    const guestName = typeof body.guestName === 'string' ? body.guestName.trim() : ''
    const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const guests = Number(body.guests)
    const checkIn = typeof body.checkIn === 'string' ? parseDateInput(body.checkIn) : null
    const checkOut = typeof body.checkOut === 'string' ? parseDateInput(body.checkOut) : null
    const arrivalTime = typeof body.arrivalTime === 'string' ? body.arrivalTime.trim() : ''
    const benefitLabel = typeof body.benefitLabel === 'string' ? body.benefitLabel.trim() : ''
    const paymentMethod = typeof body.paymentMethod === 'string' ? body.paymentMethod : ''
    const note = typeof body.note === 'string' ? body.note.trim() : ''

    if (!guestName || !email || !phone || !checkIn || !checkOut) {
      return NextResponse.json({ error: '필수 정보를 모두 입력해주세요.' }, { status: 400 })
    }

    if (source === 'PARTNERSHIP' && !companyName) {
      return NextResponse.json({ error: '제휴 예약은 회사명 또는 제휴 구분이 필요합니다.' }, { status: 400 })
    }

    if (!allowedPaymentMethods.includes(paymentMethod as PaymentMethod)) {
      return NextResponse.json({ error: '결제 방식을 다시 선택해주세요.' }, { status: 400 })
    }

    if (source !== 'PARTNERSHIP' && paymentMethod === 'CORPORATE_BILLING') {
      return NextResponse.json({ error: '법인 정산은 제휴 예약에서만 선택할 수 있습니다.' }, { status: 400 })
    }

    if (benefitLabel && !isPartnerBenefitLabel(benefitLabel)) {
      return NextResponse.json({ error: '제휴 구분을 다시 선택해주세요.' }, { status: 400 })
    }

    if (!Number.isInteger(guests) || guests < 1 || guests > 4) {
      return NextResponse.json({ error: '인원은 1명부터 4명까지 입력할 수 있습니다.' }, { status: 400 })
    }

    if (checkOut <= checkIn) {
      return NextResponse.json({ error: '체크아웃 날짜는 체크인 이후여야 합니다.' }, { status: 400 })
    }

    const quote = calculateReservationQuote({
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests,
      source,
      paymentMethod: paymentMethod as PaymentMethod,
      benefitLabel: benefitLabel || undefined,
    })

    if (!quote) {
      return NextResponse.json({ error: '예상 결제 금액을 계산할 수 없습니다.' }, { status: 400 })
    }

    const reservation = await prisma.$transaction(async (tx) => {
      const [blockedDates, overlappingReservation] = await Promise.all([
        tx.blockedDate.findMany({
          where: { date: { gte: checkIn, lt: checkOut } },
        }),
        tx.reservation.findFirst({
          where: {
            status: { in: activeReservationStatuses },
            checkIn: { lt: checkOut },
            checkOut: { gt: checkIn },
          },
        }),
      ])

      if (blockedDates.length > 0 || overlappingReservation) {
        throw new ReservationConflictError()
      }

      return tx.reservation.create({
        data: {
          source,
          guestName,
          companyName: companyName || null,
          email,
          phone,
          guests,
          checkIn,
          checkOut,
          arrivalTime: arrivalTime || null,
          benefitLabel: benefitLabel || null,
          paymentMethod: paymentMethod as PaymentMethod,
          baseAmount: quote.roomAmount,
          extraGuestAmount: quote.extraGuestAmount,
          discountAmount: quote.discountAmount,
          finalAmount: quote.finalAmount,
          depositAmount: quote.depositAmount,
          note: note || null,
        },
      })
    }, { timeout: 10000 })

    void sendReservationConfirmation({
      to: email,
      guestName,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      source,
      paymentMethod: paymentMethod as PaymentMethod,
      benefitLabel: benefitLabel || null,
      finalAmount: quote.finalAmount,
      depositAmount: quote.depositAmount,
    }).catch((emailError) => {
      console.error('Failed to send reservation confirmation email:', emailError)
    })

    return NextResponse.json(serializeReservation(reservation), { status: 201 })
  } catch (error) {
    if (error instanceof ReservationConflictError) {
      return NextResponse.json({ error: '선택한 일정에는 이미 예약 또는 차단일이 있습니다.' }, { status: 409 })
    }
    console.error('Reservation creation error:', error)
    return NextResponse.json({ error: '예약 접수 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
