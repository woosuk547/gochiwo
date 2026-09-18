'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { formatDateLabel, getTodayKey } from '@/lib/booking'
import { editorialBtnPrimary } from '@/lib/editorial'
import { HeroDateCalendar } from '@/components/site/hero-date-calendar'

interface Availability {
  blockedDates: string[]
  reservedRanges: Array<{ checkIn: string; checkOut: string }>
}

const fieldButtonClassName =
  'flex h-11 min-h-[44px] w-full cursor-pointer flex-col items-start justify-center gap-0.5 rounded-none border border-white/25 bg-white/10 px-3 text-left transition-colors hover:border-white/60'

/** 홈 히어로 날짜 바로잡기. 달력 팝오버에서 고른 날짜를 예약 페이지로 넘긴다. */
export function HeroDateWidget() {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const today = getTodayKey()

  // 첫 열기 때만 가용일을 가져온다 (loading을 deps에 넣으면
  // setLoading 리렌더가 진행 중 fetch를 취소해 영원히 로딩에 갇힌다)
  useEffect(() => {
    if (!open || availability) return
    let cancelled = false
    setLoading(true)
    setLoadError('')
    void (async () => {
      try {
        const response = await fetch('/api/availability')
        const data = await response.json()
        if (cancelled) return
        if (!response.ok) throw new Error(data.error || '달력을 불러오지 못했어요.')
        setAvailability({ blockedDates: data.blockedDates ?? [], reservedRanges: data.reservedRanges ?? [] })
      } catch (fetchError) {
        if (!cancelled) setLoadError(fetchError instanceof Error ? fetchError.message : '달력을 불러오지 못했어요.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, availability])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  function handleCalendarChange(nextCheckIn: string, nextCheckOut: string) {
    setCheckIn(nextCheckIn)
    setCheckOut(nextCheckOut)
    setError('')
    if (nextCheckIn && nextCheckOut) setOpen(false)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!checkIn || !checkOut) {
      setError('달력에서 체크인·체크아웃 날짜를 모두 골라주세요.')
      setOpen(true)
      return
    }
    if (checkOut <= checkIn || checkIn < today) {
      setError('날짜를 다시 골라주세요.')
      setOpen(true)
      return
    }
    setError('')
    router.push(`/reservation?checkIn=${checkIn}&checkOut=${checkOut}`)
  }

  return (
    <div className="relative mt-8 w-full max-w-xl">
      <form onSubmit={handleSubmit} aria-label="날짜로 예약 바로가기">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-left text-[11px] font-medium tracking-[0.1em] text-white/60">체크인</span>
            <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} className={fieldButtonClassName}>
              <span className={`text-[14px] ${checkIn ? 'text-white' : 'text-white/50'}`}>
                {checkIn ? formatDateLabel(checkIn) : '날짜 선택'}
              </span>
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-left text-[11px] font-medium tracking-[0.1em] text-white/60">체크아웃</span>
            <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} className={fieldButtonClassName}>
              <span className={`text-[14px] ${checkOut ? 'text-white' : 'text-white/50'}`}>
                {checkOut ? formatDateLabel(checkOut) : '날짜 선택'}
              </span>
            </button>
          </div>
          <button type="submit" className={`${editorialBtnPrimary} sm:self-end sm:px-6`}>
            날짜로 예약하기
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-left text-[13px] text-red-200">
            {error}
          </p>
        )}
      </form>

      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              aria-label="달력 닫기"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-black/40"
            />
            <div
              role="dialog"
              aria-modal="false"
              aria-label="날짜 선택 달력"
              className="fixed inset-x-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-50 sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-full sm:mt-2 sm:w-[380px] sm:max-w-[calc(100vw-2rem)] sm:-translate-x-1/2"
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                className="max-h-[75svh] overflow-y-auto sm:max-h-none sm:overflow-visible"
              >
              {loading || !availability ? (
                <div className="border border-gray-200 bg-white px-4 py-10 text-center">
                  {loadError ? (
                    <>
                      <p className="text-[13px] text-red-600">{loadError}</p>
                      <button
                        type="button"
                        onClick={() => { setAvailability(null); setLoading(false) }}
                        className="mt-3 min-h-[44px] px-4 text-[13px] font-medium text-gray-600 underline underline-offset-2 hover:text-[#1a1a1a]"
                      >
                        다시 불러오기
                      </button>
                    </>
                  ) : (
                    <p className="text-[13px] text-gray-500">달력 불러오는 중...</p>
                  )}
                </div>
              ) : (
                <HeroDateCalendar
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={handleCalendarChange}
                  blockedDates={availability.blockedDates}
                  reservedRanges={availability.reservedRanges}
                />
              )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
