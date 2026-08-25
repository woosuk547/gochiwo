'use client'

import { useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { paymentMethodLabel, reservationStatusLabel, type ReservationSummary } from '@/lib/booking'
import { contactInfo } from '@/lib/repause-content'
import { calculateReservationQuote, BASE_GUESTS } from '@/lib/repause-pricing'
import { getAppUrl } from '@/lib/app-url'
import { FunnelSteps } from '@/components/site/funnel-steps'
import { isUnpaidHoldExpired } from '@/lib/reservation-hold'

interface PaymentCheckoutProps {
  reservation: ReservationSummary
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      payment: (options: { customerKey: string }) => {
        requestPayment: (params: Record<string, unknown>) => Promise<void>
      }
    }
  }
}

export function PaymentCheckout({ reservation }: PaymentCheckoutProps) {
  const [paymentType, setPaymentType] = useState<'DEPOSIT' | 'FULL'>('DEPOSIT')
  const [tossLoaded, setTossLoaded] = useState(false)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
  const appUrl = getAppUrl()

  const amount = paymentType === 'DEPOSIT' ? reservation.depositAmount : reservation.finalAmount

  // 할인 내역은 요금 정책 단일 진실 공급원(repause-pricing)으로 재계산하되,
  // DB 저장 총 할인액과 일치할 때만 항목을 분리 표시한다.
  const quote = calculateReservationQuote({
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guests: reservation.guests,
    source: reservation.source,
    paymentMethod: reservation.paymentMethod,
    benefitLabel: reservation.benefitLabel ?? undefined,
  })
  const breakdownMatches = quote !== null && quote.discountAmount === reservation.discountAmount
  const consecutiveDiscount = breakdownMatches ? quote.consecutiveDiscount : 0
  const partnerDiscount = breakdownMatches ? quote.partnerDiscount : 0

  const holdExpired = isUnpaidHoldExpired(reservation)

  const handlePayment = async () => {
    if (holdExpired) {
      setError('결제 기한이 지나 일정이 해제되었어요. 다시 예약해 주세요.')
      return
    }
    if (!clientKey) {
      setError('결제 설정이 완료되지 않았어요. 잠시 후 다시 시도하거나 문의해 주세요.')
      return
    }
    if (!window.TossPayments) {
      setError('결제 모듈이 아직 로드되지 않았어요. 잠시 후 다시 시도해 주세요.')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const tossPayments = window.TossPayments(clientKey)
      const orderId = `rep_${reservation.id}_${Date.now().toString().slice(-6)}`
      const orderName = `리포즈 프라이빗 독채 예약 - ${reservation.guestName}`
      const method = reservation.paymentMethod === 'CARD' ? 'CARD' : 'TRANSFER'

      const successUrl = `${appUrl}/payment/success?reservationId=${reservation.id}&paymentType=${paymentType}`
      const failUrl = `${appUrl}/payment/fail?reservationId=${reservation.id}`

      const customerKey = `guest_${reservation.id}`

      await tossPayments.payment({ customerKey }).requestPayment({
        method,
        amount: {
          value: amount,
          currency: 'KRW',
        },
        orderId,
        orderName,
        customerName: reservation.guestName,
        customerEmail: reservation.email,
        successUrl,
        failUrl,
      })
    } catch (err) {
      console.error('Toss Payments error:', err)
      setError(err instanceof Error ? err.message : '결제 진행 중 오류가 발생했어요.')
      setIsProcessing(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }).format(date)
    } catch {
      return dateStr
    }
  }

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@')
    if (!local || !domain) return email
    if (local.length <= 3) return `***@${domain}`
    return `${local.slice(0, 3)}${'*'.repeat(local.length - 3)}@${domain}`
  }

  const maskPhone = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '')
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-****-${cleaned.slice(7)}`
    }
    return phone
  }

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v2/standard"
        onLoad={() => setTossLoaded(true)}
        onError={() => setError('결제 스크립트 로드에 실패했어요. 인터넷 연결을 확인해 주세요.')}
      />

      <div className="mx-auto max-w-3xl rounded-none border border-gray-200 bg-white p-4 md:p-6 lg:p-10">
        <div className="border-b border-gray-100 pb-5 md:pb-6">
          <FunnelSteps current={2} className="mb-4" />
          <h1 className="mt-2 text-2xl font-bold leading-tight text-[#1a1a1a] md:mt-3 md:text-[clamp(2rem,3vw,2.5rem)] md:leading-[1.1]">
            예약 결제
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-500 md:mt-3 md:text-sm">
            {reservation.status === 'CONFIRMED'
              ? '예약 승인이 완료되었어요. 내용을 확인하고 결제를 진행해 주세요.'
              : reservation.status === 'PENDING'
                ? '예약 신청이 접수되었어요. 결제가 완료되면 예약이 확정돼요.'
                : '예약 내용을 확인해 주세요.'}
          </p>
        </div>

        <div className="mt-6 space-y-5 md:mt-8 md:space-y-6">
          <div>
            <h2 className="text-[13px] font-medium text-gray-500">예약 정보</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 md:mt-4 md:gap-3">
              <div className="rounded-none bg-gray-50 p-4 md:p-5">
                <span className="text-[12px] font-medium text-gray-500 block md:text-[13px]">예약 번호</span>
                <span className="mt-1.5 text-[13px] font-medium text-[#1a1a1a] block break-all md:mt-2 md:text-sm">{reservation.id}</span>
              </div>
              <div className="rounded-none bg-gray-50 p-4 md:p-5">
                <span className="text-[12px] font-medium text-gray-500 block md:text-[13px]">예약 상태</span>
                <span className="mt-1.5 text-[13px] font-semibold text-[#1a1a1a] block md:mt-2 md:text-sm">
                  {reservation.status === 'PENDING' ? '결제 대기' : reservationStatusLabel[reservation.status]}
                </span>
              </div>
              <div className="rounded-none bg-gray-50 p-4 md:p-5">
                <span className="text-[13px] font-medium text-gray-500 block">예약자명</span>
                <span className="mt-2 text-sm font-medium text-[#1a1a1a] block">{reservation.guestName}</span>
              </div>
              <div className="rounded-none bg-gray-50 p-4 md:p-5">
                <span className="text-[13px] font-medium text-gray-500 block">연락처 및 이메일</span>
                <span className="mt-2 text-sm font-medium text-[#1a1a1a] block">
                  {maskPhone(reservation.phone)} · {maskEmail(reservation.email)}
                </span>
              </div>
              <div className="rounded-none bg-gray-50 p-4 md:p-5">
                <span className="text-[13px] font-medium text-gray-500 block">이용 일정</span>
                <span className="mt-2 text-sm font-medium text-[#1a1a1a] block">
                  {formatDate(reservation.checkIn)} ~ {formatDate(reservation.checkOut)}
                </span>
              </div>
              <div className="rounded-none bg-gray-50 p-4 md:p-5">
                <span className="text-[13px] font-medium text-gray-500 block">인원 수</span>
                <span className="mt-2 text-sm font-medium text-[#1a1a1a] block">{reservation.guests}명</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <h2 className="text-[13px] font-medium text-gray-500">결제 금액 및 수단</h2>

            {reservation.paymentMethod === 'CORPORATE_BILLING' ? (
              <div className="mt-5 rounded-none border border-gray-200 bg-gray-50 px-5 py-5 text-sm leading-8 text-gray-500">
                <p className="font-semibold text-[#1a1a1a]">법인 정산 안내</p>
                <p className="mt-2">
                  선택하신 결제 수단은 <strong className="text-[#1a1a1a]">{paymentMethodLabel[reservation.paymentMethod]}</strong>이에요.
                  법인 정산은 온라인 결제 대신, 세금계산서 발행 또는 협의된 정산 프로세스를 통해 처리해 드려요.
                </p>
                <p className="mt-3 text-[13px] text-gray-500">
                  문의: {contactInfo.email}
                </p>
              </div>
            ) : holdExpired || reservation.status === 'DECLINED' || reservation.status === 'CANCELLED' ? (
              <div className="mt-5 rounded-none border border-gray-200 bg-gray-50 px-5 py-5 text-sm leading-8 text-gray-500 text-center">
                <p className="font-semibold text-[#1a1a1a] text-lg">
                  {holdExpired || reservation.status === 'CANCELLED' ? '결제 기한이 지났거나 취소된 예약이에요' : '진행할 수 없는 예약이에요'}
                </p>
                <p className="mt-2">
                  해당 예약은 결제를 진행할 수 없어요. 새 일정으로 다시 신청해 주세요.
                </p>
                <p className="mt-3 text-[13px] text-gray-500">
                  문의: {contactInfo.email}
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button asChild size="lg" className="h-11 rounded-none bg-[#1a1a1a] px-6 text-[14px] font-semibold text-white hover:bg-[#333]">
                    <Link href="/reservation">새로 예약하기</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-11 rounded-none border-gray-200 px-6 text-[14px] font-medium text-gray-600 hover:bg-gray-50">
                    <Link href="/">홈으로 가기</Link>
                  </Button>
                </div>
              </div>
            ) : reservation.paymentStatus === 'PAID' ? (
              <div className="mt-5 rounded-none border border-gray-200 bg-gray-50 px-5 py-5 text-sm leading-8 text-gray-500 text-center">
                <p className="font-semibold text-[#1a1a1a] text-lg">이미 결제가 완료된 예약이에요</p>
                <p className="mt-1">결제가 정상 처리되었어요. 안내 이메일을 확인해 주세요.</p>
              </div>
            ) : reservation.paymentStatus === 'DEPOSIT_PAID' ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-none border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                  <p className="font-semibold">예약금이 결제되었어요</p>
                  <p className="mt-1 text-amber-700">잔금 <strong>{(reservation.finalAmount - reservation.depositAmount).toLocaleString('ko-KR')}원</strong>은 체크인 당일 현장에서 정산해요.</p>
                </div>
              </div>
            ) : (
              <>
              <div className="mt-5 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <label
                    className={`relative flex cursor-pointer flex-col rounded-none border p-5 transition-all ${
                      paymentType === 'DEPOSIT'
                        ? 'border-[#1a1a1a] bg-gray-50 ring-1 ring-[#1a1a1a]'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      value="DEPOSIT"
                      checked={paymentType === 'DEPOSIT'}
                      onChange={() => setPaymentType('DEPOSIT')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-gray-500">예약금 결제</span>
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        paymentType === 'DEPOSIT' ? 'border-[#1a1a1a]' : 'border-gray-300'
                      }`}>
                        {paymentType === 'DEPOSIT' && <span className="h-2 w-2 rounded-full bg-[#1a1a1a]" />}
                      </span>
                    </div>
                    <span className="mt-3 text-2xl font-bold text-[#1a1a1a]">
                      {reservation.depositAmount.toLocaleString('ko-KR')}원
                    </span>
                    <span className="mt-2 text-[13px] leading-5 text-gray-500">
                      총 결제액의 50%를 먼저 결제해요. 체크인 당일 잔금을 정산해요.
                    </span>
                  </label>

                  <label
                    className={`relative flex cursor-pointer flex-col rounded-none border p-5 transition-all ${
                      paymentType === 'FULL'
                        ? 'border-[#1a1a1a] bg-gray-50 ring-1 ring-[#1a1a1a]'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      value="FULL"
                      checked={paymentType === 'FULL'}
                      onChange={() => setPaymentType('FULL')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-gray-500">전액 결제</span>
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        paymentType === 'FULL' ? 'border-[#1a1a1a]' : 'border-gray-300'
                      }`}>
                        {paymentType === 'FULL' && <span className="h-2 w-2 rounded-full bg-[#1a1a1a]" />}
                      </span>
                    </div>
                    <span className="mt-3 text-2xl font-bold text-[#1a1a1a]">
                      {reservation.finalAmount.toLocaleString('ko-KR')}원
                    </span>
                    <span className="mt-2 text-[13px] leading-5 text-gray-500">
                      전체 금액을 일괄 결제해요. 현장 추가 결제 없이 바로 입실할 수 있어요.
                    </span>
                  </label>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-6">
                  <div className="flex justify-between text-sm py-1.5 text-gray-500">
                    <span>기본 객실 요금</span>
                    <span>{reservation.baseAmount.toLocaleString('ko-KR')}원</span>
                  </div>
                  {reservation.extraGuestAmount > 0 && (
                    <div className="flex justify-between text-sm py-1.5 text-gray-500">
                      <span>추가 인원 요금 ({reservation.guests - BASE_GUESTS}인)</span>
                      <span>+{reservation.extraGuestAmount.toLocaleString('ko-KR')}원</span>
                    </div>
                  )}
                  {consecutiveDiscount > 0 && (
                    <div className="flex justify-between text-sm py-1.5 text-emerald-700">
                      <span>연박 할인</span>
                      <span>-{consecutiveDiscount.toLocaleString('ko-KR')}원</span>
                    </div>
                  )}
                  {partnerDiscount > 0 && (
                    <div className="flex justify-between text-sm py-1.5 text-emerald-700">
                      <span>제휴 할인 ({reservation.benefitLabel || '임직원'})</span>
                      <span>-{partnerDiscount.toLocaleString('ko-KR')}원</span>
                    </div>
                  )}
                  {reservation.discountAmount > 0 && consecutiveDiscount === 0 && partnerDiscount === 0 && (
                    <div className="flex justify-between text-sm py-1.5 text-emerald-700">
                      <span>할인 적용</span>
                      <span>-{reservation.discountAmount.toLocaleString('ko-KR')}원</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold py-4 border-t border-dashed border-gray-200 mt-2 text-[#1a1a1a]">
                    <span>최종 결제 금액</span>
                    <span className="text-xl font-bold">{amount.toLocaleString('ko-KR')}원</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-gray-500 py-1">
                    <span>결제 방법</span>
                    <span>{paymentMethodLabel[reservation.paymentMethod]}</span>
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

                <Button
                  onClick={handlePayment}
                  disabled={!tossLoaded || isProcessing}
                  size="lg"
                  className="mt-6 hidden h-13 w-full rounded-none bg-[#1a1a1a] px-6 text-[15px] font-semibold text-white transition-all hover:bg-[#333] md:flex md:items-center md:justify-center"
                >
                  {isProcessing ? '결제 창을 불러오는 중...' : `${amount.toLocaleString('ko-KR')}원 결제하기`}
                </Button>

                <p className="hidden text-center text-[13px] text-gray-500 mt-4 md:block">
                  토스페이먼츠 보안 모듈을 통해 안전하게 처리돼요. 환불 규정은 이용 안내를 따라요.
                </p>
              </div>

              {/* 모바일 sticky 결제 바 */}
              <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] text-gray-500">{paymentType === 'DEPOSIT' ? '예약금' : '전액'}</p>
                    <p className="text-[16px] font-bold text-[#1a1a1a]">{amount.toLocaleString('ko-KR')}원</p>
                  </div>
                  <Button
                    onClick={handlePayment}
                    disabled={!tossLoaded || isProcessing}
                    size="lg"
                    className="h-12 flex-1 rounded-none bg-[#1a1a1a] text-[15px] font-semibold text-white transition-all hover:bg-[#333]"
                  >
                    {isProcessing ? '처리 중...' : '결제하기'}
                  </Button>
                </div>
                {error && <p className="mt-2 text-[13px] text-red-600">{error}</p>}
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
