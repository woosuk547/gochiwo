export type ReservationSource = 'DIRECT' | 'PARTNERSHIP'
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED'
export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'CORPORATE_BILLING'
export type PaymentStatus = 'REVIEW_PENDING' | 'PAYMENT_GUIDE_SENT' | 'DEPOSIT_PAID' | 'PAID' | 'REFUNDED'

export interface ReservationSummary {
  id: string
  source: ReservationSource
  status: ReservationStatus
  guestName: string
  companyName: string | null
  email: string
  phone: string
  guests: number
  checkIn: string
  checkOut: string
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
  requestedAt: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BlockedDateSummary {
  id: string
  date: string
  label: string | null
  createdAt: string
}

export const reservationStatusLabel: Record<ReservationStatus, string> = {
  PENDING: '결제 대기',
  CONFIRMED: '예약 확정',
  DECLINED: '승인 거절',
  CANCELLED: '예약 취소',
}

export const reservationSourceLabel: Record<ReservationSource, string> = {
  DIRECT: '일반 예약',
  PARTNERSHIP: '제휴 예약',
}

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  CARD: '카드 결제',
  BANK_TRANSFER: '계좌이체',
  CORPORATE_BILLING: '법인 정산',
}

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  REVIEW_PENDING: '결제 검토 전',
  PAYMENT_GUIDE_SENT: '결제 안내 발송',
  DEPOSIT_PAID: '예약금 결제 완료',
  PAID: '결제 완료',
  REFUNDED: '환불 완료',
}

export function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('ko-KR').format(value)}원`
}

export function parseDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }

  return new Date(`${value}T00:00:00.000Z`)
}

export function formatDateKey(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toISOString().slice(0, 10)
}

export function getTodayKey() {
  const today = new Date()
  const shifted = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  return shifted.toISOString().slice(0, 10)
}

export const PARTNERSHIP_MIN_ADVANCE_DAYS = 21
export const ALLOWED_GUEST_COUNTS = [2, 4, 6] as const
export const MAX_NIGHTS = 14
export const MAX_GUEST_NAME_LENGTH = 80
export const MAX_NOTE_LENGTH = 2000

export function nightsBetween(checkIn: Date, checkOut: Date) {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const parsed = parseDateInput(dateKey)
  if (!parsed) return dateKey
  parsed.setUTCDate(parsed.getUTCDate() + days)
  return formatDateKey(parsed)
}

export function getMinBookableDateKey(minAdvanceDays = 0) {
  const today = getTodayKey()
  return minAdvanceDays > 0 ? addDaysToDateKey(today, minAdvanceDays) : today
}

export function isCheckInAllowedForSource(checkInKey: string, source: ReservationSource) {
  if (source !== 'PARTNERSHIP') return true
  return checkInKey >= getMinBookableDateKey(PARTNERSHIP_MIN_ADVANCE_DAYS)
}

export function formatDateLabel(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date)
}

export function formatDateTime(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getNightCount(checkIn: string, checkOut: string) {
  const start = parseDateInput(checkIn)
  const end = parseDateInput(checkOut)

  if (!start || !end) {
    return 0
  }

  const difference = end.getTime() - start.getTime()
  return Math.max(0, Math.round(difference / 86400000))
}

export function expandDateKeys(checkIn: Date | string, checkOut: Date | string) {
  const start = typeof checkIn === 'string' ? parseDateInput(checkIn) : checkIn
  const end = typeof checkOut === 'string' ? parseDateInput(checkOut) : checkOut

  if (!start || !end || end <= start) {
    return []
  }

  const dates: string[] = []
  const cursor = new Date(start)

  while (cursor < end) {
    dates.push(formatDateKey(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return dates
}

export function buildReservedDateKeys(
  reservations: Array<Pick<ReservationSummary, 'checkIn' | 'checkOut'>>
) {
  return new Set(reservations.flatMap((reservation) => expandDateKeys(reservation.checkIn, reservation.checkOut)))
}

export function isRangeAvailable(
  checkIn: Date,
  checkOut: Date,
  blockedDateKeys: Set<string>,
  reservations: Array<{ checkIn: Date; checkOut: Date }>
) {
  const blockedOverlap = expandDateKeys(checkIn, checkOut).some((dateKey) => blockedDateKeys.has(dateKey))
  const reservationOverlap = reservations.some(
    (reservation) => reservation.checkIn < checkOut && reservation.checkOut > checkIn
  )

  return !blockedOverlap && !reservationOverlap
}
