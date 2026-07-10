'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contactInfo } from '@/lib/repause-content'

interface ReservationResult {
  id: string
  status: string
  paymentStatus: string
  guestName: string
  email: string
  checkIn: string
  checkOut: string
  guests: number
  finalAmount: number
  depositAmount: number
  paymentMethod: string
  createdAt: string
}

const statusLabel: Record<string, string> = {
  PENDING: '결제 대기',
  CONFIRMED: '예약 확정',
  DECLINED: '승인 거절',
  CANCELLED: '취소됨',
}

const paymentStatusLabel: Record<string, string> = {
  REVIEW_PENDING: '결제 대기',
  PAYMENT_GUIDE_SENT: '결제 안내 완료',
  DEPOSIT_PAID: '예약금 결제 완료',
  PAID: '결제 완료',
  REFUNDED: '환불 완료',
}

const fieldClassName =
  'h-12 rounded-none border-gray-200 bg-white px-4 text-sm text-[#1a1a1a] placeholder:text-gray-300 focus-visible:border-[#1a1a1a] focus-visible:ring-[#1a1a1a]/10'

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export function MyReservationContent() {
  const [isPending, startTransition] = useTransition()
  const [reservationId, setReservationId] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<ReservationResult | null>(null)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!reservationId.trim() || !email.trim()) {
      setError('예약 번호와 이메일을 모두 입력해 주세요.')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/reservations/lookup?id=${encodeURIComponent(reservationId.trim())}&email=${encodeURIComponent(email.trim())}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '예약 정보를 찾을 수 없어요.')
        }

        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '조회 중 오류가 발생했어요.')
      }
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="rounded-none border border-gray-200 bg-white p-6 md:p-10">
        <p className="text-[13px] leading-relaxed text-gray-500">
          결제 완료 이메일에 포함된 예약 번호를 입력하세요.
        </p>

        <div className="mt-6 space-y-4">
          <label className="flex flex-col space-y-1.5">
            <span className="text-[11px] tracking-[0.1em] text-gray-400">예약 번호</span>
            <Input
              value={reservationId}
              onChange={(e) => setReservationId(e.target.value)}
              placeholder="cm..."
              className={fieldClassName}
              required
            />
          </label>
          <label className="flex flex-col space-y-1.5">
            <span className="text-[11px] tracking-[0.1em] text-gray-400">이메일</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="예약 시 입력한 이메일"
              className={fieldClassName}
              required
            />
          </label>
        </div>

        {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}

        <Button
          type="submit"
          size="lg"
          className="mt-6 h-12 w-full rounded-none bg-[#1a1a1a] px-6 text-[14px] font-medium text-white hover:bg-[#333]"
          disabled={isPending}
        >
          {isPending ? '조회 중...' : '조회하기'}
        </Button>
      </form>

      {result && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-none border border-gray-200 bg-white p-5 md:mt-8 md:p-7 lg:p-10">
          <p className="text-[13px] font-medium text-gray-400">예약 상세</p>
          <h3 className="mt-2 text-xl font-bold text-[#1a1a1a] md:mt-3 md:text-2xl">{result.guestName}님의 예약</h3>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 md:mt-6 md:gap-3">
            <div className="rounded-none bg-gray-50 p-5">
              <span className="block text-[13px] font-medium text-gray-400">예약 상태</span>
              <span className="mt-2 block text-sm font-semibold text-[#1a1a1a]">{statusLabel[result.status] || result.status}</span>
            </div>
            <div className="rounded-none bg-gray-50 p-5">
              <span className="block text-[13px] font-medium text-gray-400">결제 상태</span>
              <span className="mt-2 block text-sm font-semibold text-[#1a1a1a]">{paymentStatusLabel[result.paymentStatus] || result.paymentStatus}</span>
            </div>
            <div className="rounded-none bg-gray-50 p-5">
              <span className="block text-[13px] font-medium text-gray-400">이용 일정</span>
              <span className="mt-2 block text-sm font-medium text-[#1a1a1a]">
                {formatDate(result.checkIn)} ~ {formatDate(result.checkOut)}
              </span>
            </div>
            <div className="rounded-none bg-gray-50 p-5">
              <span className="block text-[13px] font-medium text-gray-400">인원</span>
              <span className="mt-2 block text-sm font-medium text-[#1a1a1a]">{result.guests}명</span>
            </div>
            <div className="rounded-none bg-gray-50 p-5">
              <span className="block text-[13px] font-medium text-gray-400">최종 금액</span>
              <span className="mt-2 block text-sm font-medium text-[#1a1a1a]">{result.finalAmount.toLocaleString('ko-KR')}원</span>
            </div>
            <div className="rounded-none bg-gray-50 p-5">
              <span className="block text-[13px] font-medium text-gray-400">예약금</span>
              <span className="mt-2 block text-sm font-medium text-[#1a1a1a]">{result.depositAmount.toLocaleString('ko-KR')}원</span>
            </div>
          </div>

          {(['PENDING', 'CONFIRMED'].includes(result.status) &&
            result.paymentStatus !== 'PAID' &&
            result.paymentStatus !== 'DEPOSIT_PAID' &&
            result.paymentMethod !== 'CORPORATE_BILLING' &&
            result.depositAmount > 0) && (
            <Button asChild size="lg" className="mt-6 h-12 w-full rounded-none bg-[#1a1a1a] px-6 text-[15px] font-semibold text-white hover:bg-[#333]">
              <Link href={`/payment/${result.id}?email=${encodeURIComponent(result.email)}`}>결제 진행하기</Link>
            </Button>
          )}

          <p className="mt-4 text-[13px] text-gray-400">
            예약 취소 및 변경은 {contactInfo.email}으로 문의해 주세요.
          </p>
        </div>
      )}
    </>
  )
}
