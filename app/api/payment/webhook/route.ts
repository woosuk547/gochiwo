import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReservationConfirmed } from '@/lib/mailer'
import {
  markReservationPaid,
  orderIdBelongsToReservation,
  reservationIdFromOrderId,
  serializeReservation,
} from '@/lib/reservation-service'

const seenTransmissions = new Map<string, number>()
const TRANSMISSION_TTL_MS = 3 * 24 * 60 * 60 * 1000

function rememberTransmission(id: string) {
  const now = Date.now()
  for (const [key, at] of seenTransmissions) {
    if (now - at > TRANSMISSION_TTL_MS) seenTransmissions.delete(key)
  }
  seenTransmissions.set(id, now)
}

async function fetchTossPayment(paymentKey: string, basicAuth: string) {
  const response = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`, {
    headers: { Authorization: `Basic ${basicAuth}` },
  })
  const data = await response.json()
  return { ok: response.ok, data }
}

export async function POST(request: NextRequest) {
  const transmissionId = request.headers.get('tosspayments-webhook-transmission-id')
  if (transmissionId && seenTransmissions.has(transmissionId)) {
    return NextResponse.json({ ok: true })
  }

  let body: {
    eventType?: string
    data?: { status?: string; paymentKey?: string; orderId?: string; totalAmount?: number }
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  if (body.eventType && body.eventType !== 'PAYMENT_STATUS_CHANGED') {
    if (transmissionId) rememberTransmission(transmissionId)
    return NextResponse.json({ ok: true })
  }

  const paymentKey = typeof body.data?.paymentKey === 'string' ? body.data.paymentKey : ''
  const payloadStatus = body.data?.status
  if (!paymentKey || (payloadStatus && payloadStatus !== 'DONE')) {
    if (transmissionId) rememberTransmission(transmissionId)
    return NextResponse.json({ ok: true })
  }

  const secretKey = process.env.TOSS_SECRET_KEY
  if (!secretKey) {
    console.error('TOSS_SECRET_KEY missing for webhook')
    return NextResponse.json({ error: '결제 설정이 완료되지 않았습니다.' }, { status: 500 })
  }

  const basicAuth = Buffer.from(`${secretKey}:`).toString('base64')
  const existing = await fetchTossPayment(paymentKey, basicAuth)
  if (!existing.ok || existing.data?.status !== 'DONE') {
    if (transmissionId) rememberTransmission(transmissionId)
    return NextResponse.json({ ok: true })
  }

  const tossOrderId = typeof existing.data?.orderId === 'string' ? existing.data.orderId : ''
  const reservationId = reservationIdFromOrderId(tossOrderId)
  if (!reservationId || !orderIdBelongsToReservation(tossOrderId, reservationId)) {
    if (transmissionId) rememberTransmission(transmissionId)
    return NextResponse.json({ ok: true })
  }

  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } })
  if (!reservation) {
    if (transmissionId) rememberTransmission(transmissionId)
    return NextResponse.json({ ok: true })
  }

  const tossAmount = Number(existing.data?.totalAmount ?? existing.data?.balanceAmount ?? 0)
  const isDeposit = tossAmount === reservation.depositAmount
  const isFull = tossAmount === reservation.finalAmount
  if (!isDeposit && !isFull) {
    if (transmissionId) rememberTransmission(transmissionId)
    return NextResponse.json({ ok: true })
  }

  const paid = await markReservationPaid({
    reservationId,
    paymentKey,
    orderId: tossOrderId,
    isDeposit,
  })

  if (paid.applied && paid.reservation) {
    const serialized = serializeReservation(paid.reservation)
    void sendReservationConfirmed({
      to: paid.reservation.email,
      guestName: paid.reservation.guestName,
      checkIn: serialized.checkIn,
      checkOut: serialized.checkOut,
      guests: paid.reservation.guests,
      paymentMethod: paid.reservation.paymentMethod,
      finalAmount: paid.reservation.finalAmount,
      paidAmount: tossAmount,
      isDepositOnly: isDeposit,
      paymentCompleted: true,
    }).catch((emailError) => {
      console.error('Failed to send confirmation email from webhook:', emailError)
    })
  }

  if (transmissionId) rememberTransmission(transmissionId)
  return NextResponse.json({ ok: true })
}
