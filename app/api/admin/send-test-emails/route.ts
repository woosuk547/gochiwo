import { NextRequest, NextResponse } from 'next/server'
import { hasAdminSession, requireAdmin } from '@/lib/admin-auth'
import {
  sendReservationConfirmation,
  sendReservationConfirmed,
  sendPaymentGuide,
} from '@/lib/mailer'

export async function POST(request: NextRequest) {
  // 세션 확인
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim() : 'woosuk547@naver.com'

    if (!email) {
      return NextResponse.json({ error: '수신인 이메일이 필요합니다.' }, { status: 400 })
    }

    // 1. 예약 접수 확인 메일
    await sendReservationConfirmation({
      to: email,
      guestName: '홍길동',
      checkIn: '2026-06-15',
      checkOut: '2026-06-17',
      source: 'DIRECT',
      paymentMethod: 'BANK_TRANSFER',
      benefitLabel: null,
      finalAmount: 730000,
      depositAmount: 365000,
    })

    // 2. 예약 승인 및 확정 메일
    await sendReservationConfirmed({
      to: email,
      guestName: '홍길동',
      checkIn: '2026-06-15',
      checkOut: '2026-06-17',
      guests: 2,
      finalAmount: 730000,
      paymentMethod: 'BANK_TRANSFER',
    })

    // 3. 결제 및 입금 안내 메일
    await sendPaymentGuide({
      id: 'test-reservation-id',
      to: email,
      guestName: '홍길동',
      checkIn: '2026-06-15',
      checkOut: '2026-06-17',
      finalAmount: 730000,
      depositAmount: 365000,
      paymentMethod: 'BANK_TRANSFER',
    })

    return NextResponse.json({
      success: true,
      message: '3가지 프리미엄 이메일 템플릿(접수완료, 예약확정, 결제안내) 세트 전송이 성공적으로 완료되었습니다.',
    })
  } catch (error) {
    console.error('Test email send API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '이메일 발송 중 알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
