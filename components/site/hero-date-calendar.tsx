'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  formatDateKey,
  getTodayKey,
  expandDateKeys,
  buildReservedDateKeys,
} from '@/lib/booking'
import { getDayNameColor, getMonthMatrix, selectDateRange, weekLabels } from '@/lib/calendar'
import { getNightlyRateInfo } from '@/lib/repause-pricing'
import { getHoliday } from '@/lib/holidays'

interface HeroDateCalendarProps {
  checkIn: string
  checkOut: string
  onChange: (checkIn: string, checkOut: string) => void
  blockedDates: string[]
  reservedRanges: Array<{ checkIn: string; checkOut: string }>
}

/** 히어로 위젯용 미니 달력. LargeCalendarPicker의 팝오버판이다. */
export function HeroDateCalendar({
  checkIn,
  checkOut,
  onChange,
  blockedDates,
  reservedRanges,
}: HeroDateCalendarProps) {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [rangeNotice, setRangeNotice] = useState('')

  const blockedKeys = useMemo(() => new Set(blockedDates), [blockedDates])
  const reservedKeys = useMemo(() => buildReservedDateKeys(reservedRanges), [reservedRanges])
  const todayKey = getTodayKey()

  const isPastLimit =
    currentYear < today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth <= today.getMonth())
  const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth()

  function handlePrevMonth() {
    if (isPastLimit) return
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
  }

  function handleNextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
  }

  function resetToCurrentMonth() {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
  }

  const monthLabel = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(currentYear, currentMonth, 1)))

  function handleDateClick(dateKey: string) {
    let notice = ''
    if (checkIn && !checkOut && dateKey > checkIn) {
      const spanned = expandDateKeys(checkIn, dateKey)
      if (spanned.some((d) => blockedKeys.has(d) || reservedKeys.has(d))) {
        notice = '선택 구간에 예약이 마감된 날짜가 있어요. 체크인 날짜를 다시 설정했어요.'
      }
    }
    setRangeNotice(notice)
    const next = selectDateRange(checkIn, checkOut, dateKey, blockedKeys, reservedKeys)
    onChange(next.checkIn, next.checkOut)
  }

  const cells = getMonthMatrix(currentYear, currentMonth)
  const nights = checkIn && checkOut ? expandDateKeys(checkIn, checkOut).length : 0
  const selectingCheckout = Boolean(checkIn && !checkOut)

  return (
    <div className="overflow-hidden rounded-none border border-gray-200 bg-white text-left">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <button type="button" onClick={handlePrevMonth} aria-label="이전 달" disabled={isPastLimit} className="flex h-10 w-10 items-center justify-center rounded-none text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-[15px] font-semibold text-[#1a1a1a]">{monthLabel}</p>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={resetToCurrentMonth}
              className="min-h-[24px] text-[12px] font-medium text-gray-500 underline underline-offset-2 hover:text-[#1a1a1a]"
            >
              이번 달로 돌아가기
            </button>
          )}
        </div>
        <button type="button" onClick={handleNextMonth} aria-label="다음 달" className="flex h-10 w-10 items-center justify-center rounded-none text-gray-500 transition-colors hover:bg-gray-100">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 px-3 py-2 text-center text-[12px] font-medium text-gray-500">
        {weekLabels.map((label, index) => (
          <div key={label} className={index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : undefined}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 px-3 pb-2">
        {cells.map((cell, index) => {
          if (!cell) return <div key={`empty-${index}`} className="aspect-square" />
          const dateKey = formatDateKey(cell)
          const isPast = dateKey < todayKey
          const isBlocked = blockedKeys.has(dateKey)
          const isReserved = reservedKeys.has(dateKey)
          const isUnavailable = isPast || isBlocked || (isReserved && !selectingCheckout)
          const isCheckoutOnly = selectingCheckout && isReserved && !isBlocked && !isPast
          const isSelected = dateKey === checkIn || dateKey === checkOut
          const isInRange = Boolean(checkIn && checkOut && dateKey > checkIn && dateKey < checkOut)
          const rateInfo = getNightlyRateInfo(dateKey)
          const dayNum = cell.getUTCDate()
          const monthName = new Intl.DateTimeFormat('ko-KR', { month: 'long', timeZone: 'UTC' }).format(cell)
          const nameColor = !isUnavailable && !isSelected ? getDayNameColor(dateKey) : ''
          const holidayName = getHoliday(dateKey)?.name ?? ''
          const reason = isPast
            ? ' (선택 불가)'
            : isBlocked || (isReserved && !selectingCheckout)
              ? ' (예약 마감)'
              : isCheckoutOnly
                ? ' (퇴실일로 선택 가능)'
                : ''
          const price = !isUnavailable && rateInfo ? `, 1박 ${rateInfo.shortLabel}만원` : ''

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => !isUnavailable && handleDateClick(dateKey)}
              disabled={isUnavailable}
              aria-label={`${monthName} ${dayNum}일${holidayName ? ` (${holidayName})` : ''}${isSelected ? ' (선택됨)' : ''}${reason}${price}`}
              aria-pressed={isSelected}
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 text-[13px] transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a] focus-visible:ring-offset-1 ${
                isUnavailable
                  ? isPast
                    ? 'cursor-not-allowed rounded-none text-gray-200'
                    : 'cursor-not-allowed rounded-none bg-gray-50/80 text-gray-300 line-through'
                  : isSelected
                    ? 'cursor-pointer rounded-full bg-[#1a1a1a] font-bold text-white'
                    : isCheckoutOnly
                      ? 'cursor-pointer rounded-none font-medium text-[#1a1a1a] ring-1 ring-inset ring-gray-400 hover:bg-gray-50'
                      : isInRange
                        ? 'cursor-pointer rounded-none bg-gray-100 font-medium text-[#1a1a1a]'
                        : dateKey === todayKey
                          ? 'cursor-pointer rounded-none font-bold text-[#1a1a1a] ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                          : 'cursor-pointer rounded-none text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className={`leading-none ${nameColor}`}>{dayNum}</span>
              {!isUnavailable && !isSelected && rateInfo && (
                <span className={`text-[10px] font-normal leading-none ${rateInfo.isPeak ? 'font-semibold text-gray-600' : 'text-gray-400'}`}>
                  {rateInfo.shortLabel}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-100 px-4 py-2 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#1a1a1a]" />
          선택
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="flex h-3.5 w-3.5 items-center justify-center bg-gray-50 text-[10px] text-gray-300 line-through">1</span>
          마감
        </span>
        <span>숫자는 1박 요금(만원)</span>
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="text-red-600">●</span> 일·공휴일
          <span aria-hidden="true" className="ml-1.5 text-blue-600">●</span> 토
        </span>
      </div>

      {rangeNotice && (
        <p role="status" className="border-t border-amber-100 bg-amber-50 px-4 py-2 text-[12px] text-amber-800">
          {rangeNotice}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 text-[12px]">
        <span className="text-gray-500" aria-live="polite">
          {checkIn && checkOut ? (
            <><strong className="text-[#1a1a1a]">{nights}박</strong> 선택됨</>
          ) : checkIn ? (
            '체크아웃 날짜를 선택하세요'
          ) : (
            '체크인 날짜를 선택하세요'
          )}
        </span>
        {(checkIn || checkOut) && (
          <button
            type="button"
            onClick={() => { setRangeNotice(''); onChange('', '') }}
            className="min-h-[36px] rounded-none px-2 text-[12px] font-medium text-gray-500 hover:bg-gray-100"
          >
            초기화
          </button>
        )}
      </div>
    </div>
  )
}
