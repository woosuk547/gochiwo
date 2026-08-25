import { prisma } from '@/lib/prisma'
import {
  formatDateKey,
  type BlockedDateSummary,
  type PaymentMethod,
  type PaymentStatus,
  type ReservationStatus,
  type ReservationSummary,
} from '@/lib/booking'
import type { PrismaClient } from '@/lib/generated/prisma/client'
import { pendingHoldCutoff } from '@/lib/reservation-hold'

export { PENDING_HOLD_MS, pendingHoldCutoff, isUnpaidHoldExpired, orderIdBelongsToReservation, reservationIdFromOrderId } from '@/lib/reservation-hold'

export const UNPAID_PAYMENT_STATUSES = ['REVIEW_PENDING', 'PAYMENT_GUIDE_SENT'] as const

type ReservationStore = Pick<PrismaClient, 'reservation' | 'blockedDate'>

export const activeReservationStatuses: ReservationStatus[] = ['PENDING', 'CONFIRMED']

/** 가용성·충돌 검사에 포함할 활성 예약 조건. 법인 정산 미승인은 캘린더를 막지 않는다. */
export function activeHoldWhere(now = new Date()) {
  const cutoff = pendingHoldCutoff(now)
  return {
    OR: [
      { status: 'CONFIRMED' as const },
      {
        status: 'PENDING' as const,
        paymentMethod: { not: 'CORPORATE_BILLING' as const },
        OR: [
          { paymentStatus: { in: ['DEPOSIT_PAID', 'PAID'] as PaymentStatus[] } },
          { createdAt: { gte: cutoff } },
        ],
      },
    ],
  }
}

export function staleUnpaidPendingWhere(now = new Date()) {
  return {
    status: 'PENDING' as const,
    paymentStatus: { in: ['REVIEW_PENDING', 'PAYMENT_GUIDE_SENT'] as PaymentStatus[] },
    createdAt: { lt: pendingHoldCutoff(now) },
  }
}

/** 만료된 미결제 PENDING을 CANCELLED로 정리. 트랜잭션 안에서는 첫 write로 SQLite 락을 잡는다. */
export async function expireStalePendingReservations(now = new Date(), db: ReservationStore = prisma) {
  return db.reservation.updateMany({
    where: staleUnpaidPendingWhere(now),
    data: { status: 'CANCELLED' },
  })
}

export async function findOverlappingHold(
  db: ReservationStore,
  checkIn: Date,
  checkOut: Date,
  excludeId?: string,
) {
  return db.reservation.findFirst({
    where: {
      AND: [
        activeHoldWhere(),
        { checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
        ...(excludeId ? [{ id: { not: excludeId } }] : []),
      ],
    },
  })
}

export function serializeReservation(reservation: {
  id: string
  source: 'DIRECT' | 'PARTNERSHIP'
  status: ReservationStatus
  guestName: string
  companyName: string | null
  email: string
  phone: string
  guests: number
  checkIn: Date
  checkOut: Date
  arrivalTime: string | null
  benefitLabel: string | null
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  baseAmount: number
  extraGuestAmount: number
  discountAmount: number
  finalAmount: number
  depositAmount: number
  note: string | null
  paymentKey?: string | null
  orderId?: string | null
  requestedAt: Date | null
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
}): ReservationSummary {
  return {
    id: reservation.id,
    source: reservation.source,
    status: reservation.status,
    guestName: reservation.guestName,
    companyName: reservation.companyName,
    email: reservation.email,
    phone: reservation.phone,
    guests: reservation.guests,
    checkIn: formatDateKey(reservation.checkIn),
    checkOut: formatDateKey(reservation.checkOut),
    arrivalTime: reservation.arrivalTime,
    benefitLabel: reservation.benefitLabel,
    paymentMethod: reservation.paymentMethod,
    paymentStatus: reservation.paymentStatus,
    baseAmount: reservation.baseAmount,
    extraGuestAmount: reservation.extraGuestAmount,
    discountAmount: reservation.discountAmount,
    finalAmount: reservation.finalAmount,
    depositAmount: reservation.depositAmount,
    note: reservation.note,
    requestedAt: reservation.requestedAt?.toISOString() ?? null,
    paidAt: reservation.paidAt?.toISOString() ?? null,
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
  }
}

export function serializeBlockedDate(blockedDate: {
  id: string
  date: Date
  label: string | null
  createdAt: Date
}): BlockedDateSummary {
  return {
    id: blockedDate.id,
    date: formatDateKey(blockedDate.date),
    label: blockedDate.label,
    createdAt: blockedDate.createdAt.toISOString(),
  }
}

export async function getAvailabilitySnapshot() {
  await expireStalePendingReservations()

  const [blockedDates, reservations] = await Promise.all([
    prisma.blockedDate.findMany({ orderBy: { date: 'asc' } }),
    prisma.reservation.findMany({
      where: activeHoldWhere(),
      orderBy: { checkIn: 'asc' },
    }),
  ])

  return {
    blockedDates: blockedDates.map(serializeBlockedDate),
    reservations: reservations.map(serializeReservation),
  }
}

export async function markReservationPaid(input: {
  reservationId: string
  paymentKey: string
  orderId: string
  isDeposit: boolean
}) {
  const { reservationId, paymentKey, orderId, isDeposit } = input
  const result = await prisma.reservation.updateMany({
    where: {
      id: reservationId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      paymentStatus: { in: [...UNPAID_PAYMENT_STATUSES] },
      OR: [{ paymentKey: null }, { paymentKey }],
    },
    data: {
      status: 'CONFIRMED',
      paymentStatus: isDeposit ? 'DEPOSIT_PAID' : 'PAID',
      paidAt: new Date(),
      paymentKey,
      orderId,
    },
  })

  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } })

  if (result.count === 0) {
    if (reservation && (reservation.paymentStatus === 'PAID' || reservation.paymentStatus === 'DEPOSIT_PAID')) {
      return { applied: false as const, alreadyPaid: true as const, reservation }
    }
    return { applied: false as const, alreadyPaid: false as const, reservation }
  }

  return { applied: true as const, alreadyPaid: false as const, reservation }
}
