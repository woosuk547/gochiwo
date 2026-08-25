'use client'

import { useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FunnelSteps } from '@/components/site/funnel-steps'

export function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING')
  const [errorMessage, setErrorMessage] = useState('')
  const [, startTransition] = useTransition()

  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const reservationId = searchParams.get('reservationId')
  const paymentType = searchParams.get('paymentType')

  useEffect(() => {
    if (!paymentKey || !orderId || !amount || !reservationId) {
      setStatus('ERROR')
      setErrorMessage('필수 결제 정보가 누락되었습니다. 결제를 다시 시도해 주세요.')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
            reservationId,
            paymentType,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '결제 승인에 실패했습니다.')
        }

        setStatus('SUCCESS')
      } catch (err) {
        setStatus('ERROR')
        setErrorMessage(err instanceof Error ? err.message : '결제 승인 처리 중 일시적인 오류가 발생했습니다.')
      }
    })
  }, [paymentKey, orderId, amount, reservationId, paymentType])

  return (
    <div className="rounded-none border border-gray-200 bg-white p-5 text-center md:p-8 lg:p-12">
      {status === 'LOADING' && (
        <div className="space-y-6 py-10">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-[#1a1a1a]" />
          <p className="text-[13px] font-medium text-gray-500">결제 승인 처리 중</p>
          <h2 className="text-2xl font-bold text-[#1a1a1a]">결제를 안전하게 처리하고 있어요</h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-500">
            토스페이먼츠 보안 망을 통해 승인을 진행하고 있어요. 잠시만 기다려 주세요. 페이지를 새로고침하거나 닫지 마세요.
          </p>
        </div>
      )}

      {status === 'SUCCESS' && (
        <div className="space-y-6 py-8">
          <div className="flex justify-center">
            <FunnelSteps current={3} />
          </div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[13px] font-medium text-gray-500">결제 완료</p>
          <h2 className="text-2xl font-bold text-[#1a1a1a] md:text-3xl">결제가 완료되었어요</h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-500">
            리포즈 프라이빗 독채 예약이 확정되었어요. 상세 내역은 이메일로 보내드렸어요.
          </p>

          <div className="mx-auto mt-8 max-w-sm grid gap-4 border-t border-gray-100 pt-8 text-left text-sm">
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-3 text-gray-500">
              <span>예약 구분</span>
              <span className="font-medium text-[#1a1a1a]">
                {paymentType === 'DEPOSIT' ? '예약금 50% 결제' : '전액 일괄 결제'}
              </span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-3 text-gray-500">
              <span>결제 승인 금액</span>
              <span className="text-lg font-bold text-[#1a1a1a]">
                {amount ? Number(amount).toLocaleString('ko-KR') : '0'}원
              </span>
            </div>
            <div className="flex justify-between pb-3 text-gray-500">
              <span>예약 ID</span>
              <span className="font-mono text-xs text-[#1a1a1a]">{reservationId}</span>
            </div>
          </div>

          <div className="mx-auto max-w-sm space-y-3 pt-8">
            <Button asChild size="lg" className="h-12 w-full rounded-none bg-[#1a1a1a] px-6 text-[15px] font-semibold text-white transition-all hover:bg-[#333]">
              <Link href="/my-reservation">예약 내역 확인하기</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-none border border-gray-200 bg-white px-6 text-[15px] font-medium text-gray-600 transition-all hover:bg-gray-50">
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </div>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="space-y-6 py-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-[13px] font-medium text-gray-500">결제 승인 실패</p>
          <h2 className="text-2xl font-bold text-[#1a1a1a] md:text-3xl">결제 승인에 실패했어요</h2>
          <p className="mx-auto max-w-md rounded-none border border-red-100 bg-red-50/50 p-4 text-sm font-medium leading-relaxed text-red-600">
            {errorMessage}
          </p>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-500">
            안정적인 네트워크 환경에서 다시 시도해 주세요. 문제가 지속되면 예약 ID와 함께 문의해 주세요.
          </p>

          <div className="mx-auto max-w-sm space-y-4 pt-8">
            <Button asChild size="lg" className="h-12 w-full rounded-none bg-[#1a1a1a] px-6 text-[15px] font-semibold text-white transition-all hover:bg-[#333]">
              <Link href={reservationId ? `/payment/${reservationId}` : '/reservation'}>결제 다시 시도하기</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-none border border-gray-200 bg-white px-6 text-[15px] font-semibold text-gray-500 transition-all hover:bg-gray-50">
              <Link href="/">홈으로 가기</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
