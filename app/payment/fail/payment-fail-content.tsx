'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PaymentFailContentProps {
  contactEmail: string
}

export default function PaymentFailContent({ contactEmail }: PaymentFailContentProps) {
  const searchParams = useSearchParams()

  const code = searchParams.get('code') || 'UNKNOWN_ERROR'
  const message = searchParams.get('message') || '결제 진행 중 오류가 발생했거나 사용자가 결제를 취소했습니다.'
  const reservationId = searchParams.get('reservationId')

  return (
    <div className="rounded-none border border-gray-200 bg-white p-5 text-center md:p-8 lg:p-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-600">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <p className="mt-6 text-[13px] font-medium text-gray-400">결제 실패</p>
      <h2 className="mt-3 text-2xl font-bold text-[#1a1a1a] md:text-3xl">결제가 완료되지 않았어요</h2>

      <div className="mt-6 border border-red-100 bg-red-50/50 p-5 rounded-none text-left max-w-md mx-auto">
        <p className="text-[13px] font-medium text-gray-400">오류 내용</p>
        <p className="mt-2 text-sm font-semibold text-red-700">{message}</p>
        <p className="mt-1 text-xs text-gray-400 font-mono">코드: {code}</p>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-gray-500 max-w-md mx-auto">
        한도 초과, 잔액 부족, 카드 비밀번호 불일치 등 일시적 오류일 수 있어요. 정보 확인 후 다시 시도해 주세요.
      </p>

      <div className="mt-8 pt-6 border-t border-gray-100 space-y-4 max-w-sm mx-auto">
        <Button asChild size="lg" className="h-12 w-full rounded-none bg-[#1a1a1a] px-6 text-[15px] font-semibold text-white hover:bg-[#333] transition-all">
          <Link href={reservationId ? `/payment/${reservationId}` : '/reservation'}>결제 다시 시도하기</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-none border border-gray-200 bg-white px-6 text-[15px] font-semibold text-gray-500 hover:bg-gray-50 transition-all">
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </div>

      <p className="mt-6 text-[13px] text-gray-400">
        결제 실패가 반복되면 {contactEmail}로 예약 ID와 함께 문의해 주세요.
      </p>
    </div>
  )
}
