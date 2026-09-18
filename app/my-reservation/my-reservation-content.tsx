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
  'h-12 rounded-none border-gray-200 bg-white px-4 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus-visible:border-[#1a1a1a] focus-visible:ring-[#1a1a1a]/10'

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
  const [mode, setMode] = useState<'id' | 'phone'>('id')
  const [reservationId, setReservationId] = useState('')
  const [email, setEmail] = useState('')
  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<ReservationResult | null>(null)
  const [results, setResults] = useState<ReservationResult[] | null>(null)
  const [error, setError] = useState('')

  function formatPhone(value: string) {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  function switchMode(next: 'id' | 'phone') {
    setMode(next)
    setError('')
    setResult(null)
    setResults(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setResults(null)

    const query: Record<string, string> =
      mode === 'id'
        ? { id: reservationId.trim(), email: email.trim() }
        : { name: guestName.trim(), phone: phone.trim() }

    if (mode === 'id' && (!query.id || !query.email)) {
      setError('예약 번호와 이메일을 모두 입력해 주세요.')
      return
    }
    if (mode === 'phone' && (!query.name || !query.phone)) {
      setError('예약자 성함과 전화번호를 모두 입력해 주세요.')
      return
    }

    startTransition(async () => {
      try {
        const params = new URLSearchParams(query)
        const response = await fetch(`/api/reservations/lookup?${params.toString()}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '예약 정보를 찾을 수 없어요.')
        }

        if (Array.isArray(data.reservations)) {
          if (data.reservations.length === 1) {
            setResult(data.reservations[0])
          } else {
            setResults(data.reservations)
          }
          return
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
        <div className="flex gap-2" role="tablist" aria-label="조회 방식">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'id'}
            onClick={() => switchMode('id')}
            className={`min-h-[40px] rounded-none border px-5 text-[14px] font-medium transition-colors ${
              mode === 'id'
                ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            예약번호로 찾기
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'phone'}
            onClick={() => switchMode('phone')}
            className={`min-h-[40px] rounded-none border px-5 text-[14px] font-medium transition-colors ${
              mode === 'phone'
                ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            전화번호로 찾기
          </button>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-gray-500">
          {mode === 'id'
            ? '접수 메일 또는 결제 완료 메일에 있는 예약 번호를 입력하세요.'
            : '예약 번호를 잃어버렸어도 괜찮아요. 예약자 성함과 전화번호로 찾을 수 있어요.'}
        </p>

        {mode === 'id' ? (
          <div className="mt-6 space-y-4">
            <label className="flex flex-col space-y-1.5">
              <span className="text-[11px] tracking-[0.1em] text-gray-500">예약 번호</span>
              <Input
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
                placeholder="완료 메일의 예약 번호 (복사해서 붙여넣기)"
                className={fieldClassName}
                required
              />
            </label>
            <label className="flex flex-col space-y-1.5">
              <span className="text-[11px] tracking-[0.1em] text-gray-500">이메일</span>
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
        ) : (
          <div className="mt-6 space-y-4">
            <label className="flex flex-col space-y-1.5">
              <span className="text-[11px] tracking-[0.1em] text-gray-500">예약자 성함</span>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="예약 시 입력한 성함"
                className={fieldClassName}
                required
              />
            </label>
            <label className="flex flex-col space-y-1.5">
              <span className="text-[11px] tracking-[0.1em] text-gray-500">전화번호</span>
              <Input
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="010-0000-0000"
                inputMode="tel"
                className={fieldClassName}
                required
              />
            </label>
          </div>
        )}

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

      {results && results.length > 1 && (
        <div className="mt-6 rounded-none border border-gray-200 bg-white p-5 md:mt-8 md:p-7">
          <p className="text-[13px] text-gray-500">
            {results.length}건의 예약이 있어요. 확인할 예약을 고르세요.
          </p>
          <div className="mt-4 divide-y divide-gray-100 border-y border-gray-100">
            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setResult(item); setResults(null) }}
                className="flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-3 py-3 text-left"
              >
                <span className="text-[14px] text-[#1a1a1a]">
                  {formatDate(item.checkIn)} ~ {formatDate(item.checkOut)}
                </span>
                <span className="shrink-0 text-[13px] text-gray-500">
                  {statusLabel[item.status] || item.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-none border border-gray-200 bg-white p-5 md:mt-8 md:p-7 lg:p-10">
          <p className="text-[13px] font-medium text-gray-500">예약 상세</p>
          <h3 className="mt-2 text-xl font-bold text-[#1a1a1a] md:mt-3 md:text-2xl">{result.guestName}님의 예약</h3>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 md:mt-6 md:gap-3">
            <div className="rounded-none bg-gray-50 p-5">
              <span className="block text-[13px] font-medium text-gray-500">예약 상태</span>
              <span className="mt-2 block text-sm font-semibold text-[#1a1a1a]">{statusLabel[result.status] || result.status}</span>
            </div>
            <div className="rounded-none bg-gray-50 p-5">
              <span className="block text-[13px] font-medium text-gray-500">결제 상태</span>
              <span className="mt-2 block text-sm font-semibold text-[#1a1a1a]">{paymentStatusLabel[result.paymentStatus] || result.paymentStatus}</span>
            </div>
            <div className="rounded-none bg-gray-50 p-5">
              <span className="block text-[13px] font-medium text-gray-500">이용 일정</span>
              <span className="mt-2 block text-sm font-medium text-[#1a1a1a]">
                {formatDate(result.checkIn)} ~ {formatDate(result.checkOut)}
              </span>
            </div>
            <div className="rounded-none bg-gray-50 p-5">
              <span className="block text-[13px] font-medium text-gray-500">인원</span>
              <span className="mt-2 block text-sm font-medium text-[#1a1a1a]">{result.guests}명</span>
            </div>
            <div className="rounded-none bg-gray-50 p-5">
              <span className="block text-[13px] font-medium text-gray-500">최종 금액</span>
              <span className="mt-2 block text-sm font-medium text-[#1a1a1a]">{result.finalAmount.toLocaleString('ko-KR')}원</span>
            </div>
            <div className="rounded-none bg-gray-50 p-5">
              <span className="block text-[13px] font-medium text-gray-500">예약금</span>
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

          <p className="mt-4 text-[13px] text-gray-500">
            예약 취소 및 변경은 {contactInfo.email}으로 문의해 주세요.
          </p>
        </div>
      )}
    </>
  )
}
