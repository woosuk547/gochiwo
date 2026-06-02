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
  requestedAt: Date | null
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
}): ReservationSummary {
  return {
    ...reservation,
    checkIn: formatDateKey(reservation.checkIn),
    checkOut: formatDateKey(reservation.checkOut),
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
  const [blockedDates, reservations] = await Promise.all([
    prisma.blockedDate.findMany({ orderBy: { date: 'asc' } }),
    prisma.reservation.findMany({
      where: { status: { in: activeReservationStatuses } },
      orderBy: { checkIn: 'asc' },
    }),
  ])

  return {
    blockedDates: blockedDates.map(serializeBlockedDate),
    reservations: reservations.map(serializeReservation),
  }
}
