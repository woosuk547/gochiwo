'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTodayKey } from '@/lib/booking'
import { editorialBtnPrimary } from '@/lib/editorial'

const dateInputClassName =
  'h-11 w-full rounded-none border border-white/25 bg-white/10 px-3 text-[14px] text-white [color-scheme:dark] focus:border-white focus:outline-none'

/** 홈 히어로 날짜 바로잡기. 선택 후 예약 페이지로 날짜를 넘긴다. */
export function HeroDateWidget() {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [error, setError] = useState('')
  const today = getTodayKey()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!checkIn || !checkOut) {
      setError('체크인·체크아웃 날짜를 모두 골라주세요.')
      return
    }
    if (checkOut <= checkIn) {
      setError('체크아웃은 체크인 다음 날부터 고를 수 있어요.')
      return
    }
    if (checkIn < today) {
      setError('오늘 이후 날짜를 골라주세요.')
      return
    }
    setError('')
    router.push(`/reservation?checkIn=${checkIn}&checkOut=${checkOut}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 w-full max-w-xl" aria-label="날짜로 예약 바로가기">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1.5 text-left">
          <span className="text-[11px] font-medium tracking-[0.1em] text-white/60">체크인</span>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            className={dateInputClassName}
            aria-label="체크인 날짜"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-left">
          <span className="text-[11px] font-medium tracking-[0.1em] text-white/60">체크아웃</span>
          <input
            type="date"
            value={checkOut}
            min={checkIn && checkIn >= today ? checkIn : today}
            onChange={(e) => setCheckOut(e.target.value)}
            className={dateInputClassName}
            aria-label="체크아웃 날짜"
          />
        </label>
        <button type="submit" className={`${editorialBtnPrimary} sm:self-end sm:px-6`}>
          날짜로 예약하기
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-red-200">
          {error}
        </p>
      )}
    </form>
  )
}
