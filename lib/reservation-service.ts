import { prisma } from '@/lib/prisma'
import {
  formatDateKey,
  type BlockedDateSummary,
  type PaymentMethod,
  type PaymentStatus,
  type ReservationStatus,
  type ReservationSummary,
} from '@/lib/booking'

export const activeReservationStatuses: ReservationStatus[] = ['PENDING', 'CONFIRMED']

/** 미결제 PENDING 일정 홀드 시간 (12시간) */
export const PENDING_HOLD_MS = 12 * 60 * 60 * 1000

export function pendingHoldCutoff(now = new Date()) {
  return new Date(now.getTime() - PENDING_HOLD_MS)
}

/** 가용성·충돌 검사에 포함할 활성 예약 조건 */
export function activeHoldWhere(now = new Date()) {
  const cutoff = pendingHoldCutoff(now)
  return {
    OR: [
      { status: 'CONFIRMED' as const },
      {
        status: 'PENDING' as const,
        OR: [
          { paymentStatus: { in: ['DEPOSIT_PAID', 'PAID'] as PaymentStatus[] } },
          { createdAt: { gte: cutoff } },
        ],
      },
    ],
  }
}

/** 만료된 미결제 PENDING을 CANCELLED로 정리 */
export async function expireStalePendingReservations(now = new Date()) {
  const cutoff = pendingHoldCutoff(now)
  return prisma.reservation.updateMany({
    where: {
      status: 'PENDING',
      paymentStatus: { in: ['REVIEW_PENDING', 'PAYMENT_GUIDE_SENT'] },
      createdAt: { lt: cutoff },
    },
    data: { status: 'CANCELLED' },
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
