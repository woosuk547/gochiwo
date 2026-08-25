'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  formatDateKey,
  getTodayKey,
  parseDateInput,
  expandDateKeys,
  buildReservedDateKeys,
} from '@/lib/booking'
import { getMonthMatrix, selectDateRange, weekLabels } from '@/lib/calendar'

interface DateRangePickerProps {
  checkIn: string
  checkOut: string
  onChange: (checkIn: string, checkOut: string) => void
  blockedDates: string[]
  reservedRanges: Array<{ checkIn: string; checkOut: string }>
  minBookableDateKey?: string
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onChange,
  blockedDates,
  reservedRanges,
  minBookableDateKey,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())

  const blockedKeys = useMemo(() => new Set(blockedDates), [blockedDates])
  const reservedKeys = useMemo(() => buildReservedDateKeys(reservedRanges), [reservedRanges])
  const todayKey = getTodayKey()
  const earliestKey = minBookableDateKey ?? todayKey

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openPicker = () => {
    if (checkIn) {
      const parsed = parseDateInput(checkIn)
      if (parsed) {
        setCurrentYear(parsed.getUTCFullYear())
        setCurrentMonth(parsed.getUTCMonth())
      }
    }
    setIsOpen(true)
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
  }

  const getMonthLabel = () =>
    new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', timeZone: 'UTC' })
      .format(new Date(Date.UTC(currentYear, currentMonth, 1)))

  const handleDateClick = (dateKey: string) => {
    const next = selectDateRange(checkIn, checkOut, dateKey, blockedKeys, reservedKeys)
    onChange(next.checkIn, next.checkOut)
    if (next.checkIn && next.checkOut) {
      setIsOpen(false)
    }
  }

  const isDateSelected = (dateKey: string) => dateKey === checkIn || dateKey === checkOut
  const isDateInRange = (dateKey: string) => {
    if (!checkIn || !checkOut) return false
    return dateKey > checkIn && dateKey < checkOut
  }

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return ''
    const parsed = parseDateInput(dateStr)
    if (!parsed) return ''
    return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', weekday: 'short', timeZone: 'UTC' }).format(parsed)
  }

  const cells = getMonthMatrix(currentYear, currentMonth)
  const nights = checkIn && checkOut ? expandDateKeys(checkIn, checkOut).length : 0

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 트리거 */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={openPicker}
          className={`cursor-pointer rounded-none border px-4 py-3 text-left transition-colors ${
            isOpen ? 'border-[#1a1a1a] bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <span className="block text-[12px] font-medium text-gray-500">체크인</span>
          <span className={`mt-0.5 block text-[14px] font-medium ${checkIn ? 'text-[#1a1a1a]' : 'text-gray-500'}`}>
            {checkIn ? formatDisplayDate(checkIn) : '날짜 선택'}
          </span>
        </button>
        <button
          type="button"
          onClick={openPicker}
          className={`cursor-pointer rounded-none border px-4 py-3 text-left transition-colors ${
            isOpen ? 'border-[#1a1a1a] bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <span className="block text-[12px] font-medium text-gray-500">체크아웃</span>
          <span className={`mt-0.5 block text-[14px] font-medium ${checkOut ? 'text-[#1a1a1a]' : 'text-gray-500'}`}>
            {checkOut ? formatDisplayDate(checkOut) : '날짜 선택'}
          </span>
        </button>
      </div>

      {/* 달력 팝오버 */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-none border border-gray-200 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* 월 헤더 */}
          <div className="flex items-center justify-between pb-3">
            <button type="button" onClick={handlePrevMonth} aria-label="이전 달" className="flex h-9 w-9 items-center justify-center rounded-none text-gray-500 hover:bg-gray-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h4 className="text-[15px] font-semibold text-[#1a1a1a]">{getMonthLabel()}</h4>
            <button type="button" onClick={handleNextMonth} aria-label="다음 달" className="flex h-9 w-9 items-center justify-center rounded-none text-gray-500 hover:bg-gray-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* 요일 */}
          <div className="grid grid-cols-7 py-2 text-center text-[12px] font-medium text-gray-500">
            {weekLabels.map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>

          {/* 날짜 */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, index) => {
              if (!cell) return <div key={`empty-${index}`} className="aspect-square" />

              const dateKey = formatDateKey(cell)
              const isPast = dateKey < earliestKey
              const selectingCheckout = Boolean(checkIn && !checkOut)
              const isBlocked = blockedKeys.has(dateKey)
              const isReserved = reservedKeys.has(dateKey)
              const isUnavailable = isPast || isBlocked || (isReserved && !selectingCheckout)
              const isSelected = isDateSelected(dateKey)
              const isInRange = isDateInRange(dateKey)

              return (
                <button
                  type="button"
                  key={dateKey}
                  disabled={isUnavailable}
                  aria-pressed={isSelected}
                  aria-label={`${cell.getUTCFullYear()}년 ${cell.getUTCMonth() + 1}월 ${cell.getUTCDate()}일${isUnavailable ? ' (선택 불가)' : ''}`}
                  onClick={() => !isUnavailable && handleDateClick(dateKey)}
                  className={`flex aspect-square items-center justify-center rounded-none text-[13px] transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a] focus-visible:ring-offset-1 ${
                    isUnavailable
                      ? 'text-gray-300 cursor-not-allowed line-through'
                      : isSelected
                        ? 'bg-[#1a1a1a] text-white font-semibold rounded-full cursor-pointer'
                        : isInRange
                          ? 'bg-gray-100 text-[#1a1a1a] cursor-pointer'
                          : dateKey === todayKey
                            ? 'font-bold text-[#1a1a1a] ring-1 ring-inset ring-gray-300 cursor-pointer hover:bg-gray-50'
                            : 'text-gray-700 cursor-pointer hover:bg-gray-50'
                  }`}
                >
                  {cell.getUTCDate()}
                </button>
              )
            })}
          </div>

          {/* 하단 */}
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-[13px]">
            <span className="text-gray-500">
              {checkIn && checkOut ? <><strong className="text-[#1a1a1a]">{nights}박</strong> 선택됨</> : checkIn ? '체크아웃을 선택하세요' : '체크인을 선택하세요'}
            </span>
            <div className="flex gap-2">
              {(checkIn || checkOut) && (
                <button type="button" onClick={() => onChange('', '')} className="flex items-center gap-1 rounded-none px-2.5 py-1.5 text-gray-500 hover:bg-gray-100">
                  <X className="h-3.5 w-3.5" /> 초기화
                </button>
              )}
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-none bg-[#1a1a1a] px-3 py-1.5 text-white hover:bg-[#333]">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
