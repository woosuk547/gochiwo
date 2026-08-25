/** 미결제 PENDING 일정 홀드 시간 (12시간) */
export const PENDING_HOLD_MS = 12 * 60 * 60 * 1000

export function pendingHoldCutoff(now = new Date()) {
  return new Date(now.getTime() - PENDING_HOLD_MS)
}

export function isUnpaidHoldExpired(input: {
  status: string
  paymentStatus: string
  createdAt: string | Date
}) {
  if (input.status !== 'PENDING') return false
  if (input.paymentStatus !== 'REVIEW_PENDING' && input.paymentStatus !== 'PAYMENT_GUIDE_SENT') return false
  const created = typeof input.createdAt === 'string' ? new Date(input.createdAt) : input.createdAt
  return created.getTime() < pendingHoldCutoff().getTime()
}

export function orderIdBelongsToReservation(orderId: string, reservationId: string) {
  return orderId.startsWith(`rep_${reservationId}_`)
}

/** `rep_{reservationId}_{suffix}` */
export function reservationIdFromOrderId(orderId: string): string | null {
  if (!orderId.startsWith('rep_')) return null
  const last = orderId.lastIndexOf('_')
  if (last <= 4) return null
  const id = orderId.slice(4, last)
  return id || null
}
