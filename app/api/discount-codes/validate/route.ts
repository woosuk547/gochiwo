import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  discountCodeError,
  normalizeDiscountCode,
  toQuoteDiscountCode,
} from '@/lib/discount-codes'
import { calculateReservationQuote } from '@/lib/repause-pricing'
import { clientIp, rateLimitExceeded, tooManyRequestsResponse } from '@/lib/rate-limit'

/** 할인코드 미리보기 검증. 조회만 하고 사용 횟수는 차감하지 않는다. */
export async function POST(request: NextRequest) {
  try {
    if (rateLimitExceeded(`dcv:${clientIp(request)}`, 20, 15 * 60 * 1000)) {
      return tooManyRequestsResponse()
    }

    const body = await request.json()
    const source = body.source === 'PARTNERSHIP' ? 'PARTNERSHIP' : 'DIRECT'
    if (source !== 'DIRECT') {
      return NextResponse.json({ error: '제휴 예약에는 할인코드를 쓸 수 없어요.' }, { status: 400 })
    }

    const code = typeof body.code === 'string' ? normalizeDiscountCode(body.code) : ''
    if (!code) {
      return NextResponse.json({ error: '할인코드를 입력해 주세요.' }, { status: 400 })
    }

    const row = await prisma.discountCode.findUnique({ where: { code } })
    if (!row) {
      return NextResponse.json({ error: '등록되지 않은 할인코드예요.' }, { status: 400 })
    }

    const codeError = discountCodeError(row)
    if (codeError) {
      return NextResponse.json({ error: codeError }, { status: 400 })
    }

    const quote = calculateReservationQuote({
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: Number(body.guests),
      source: 'DIRECT',
      paymentMethod: body.paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'CARD',
      discountCode: toQuoteDiscountCode(row),
    })

    if (!quote) {
      return NextResponse.json({ error: '날짜와 인원을 먼저 선택해 주세요.' }, { status: 400 })
    }

    return NextResponse.json({
      code: row.code,
      label: row.label,
      type: row.type,
      value: row.value,
      codeDiscount: quote.codeDiscount,
      discountAmount: quote.discountAmount,
      finalAmount: quote.finalAmount,
      depositAmount: quote.depositAmount,
    })
  } catch {
    return NextResponse.json({ error: '할인코드 확인 중 오류가 발생했어요.' }, { status: 500 })
  }
}
