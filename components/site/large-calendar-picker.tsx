'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  formatDateKey,
  getTodayKey,
  parseDateInput,
  expandDateKeys,
  buildReservedDateKeys,
} from '@/lib/booking'
import { addDays, getMonthMatrix, selectDateRange, weekLabels } from '@/lib/calendar'

interface LargeCalendarPickerProps {
  checkIn: string
  checkOut: string
  onChange: (checkIn: string, checkOut: string) => void
  blockedDates: string[]
  reservedRanges: Array<{ checkIn: string; checkOut: string }>
}

export function LargeCalendarPicker({
  checkIn,
  checkOut,
  onChange,
  blockedDates,
  reservedRanges,
}: LargeCalendarPickerProps) {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [focusedDateKey, setFocusedDateKey] = useState<string>('')

  const blockedKeys = useMemo(() => new Set(blockedDates), [blockedDates])
  const reservedKeys = useMemo(() => buildReservedDateKeys(reservedRanges), [reservedRanges])
  const todayKey = getTodayKey()

  const isPastLimit =
    currentYear < today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth <= today.getMonth())

  const handlePrevMonth = () => {
    if (isPastLimit) return
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
  }

  const navigateFocus = (current: string, delta: number) => {
    if (!current) {
      setFocusedDateKey(todayKey)
      return
    }
    const next = addDays(current, delta)
    const parsed = parseDateInput(next)
    if (!parsed) return
    setFocusedDateKey(next)
    setCurrentYear(parsed.getUTCFullYear())
    setCurrentMonth(parsed.getUTCMonth())
  }

  const handleKeyDown = (e: React.KeyboardEvent, dateKey: string) => {
    const isPast = dateKey < todayKey
    const isBlocked = blockedKeys.has(dateKey)
    const isReserved = reservedKeys.has(dateKey)
    const isUnavailable = isPast || isBlocked || isReserved

    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); navigateFocus(dateKey, 1); break
      case 'ArrowLeft':  e.preventDefault(); navigateFocus(dateKey, -1); break
      case 'ArrowDown':  e.preventDefault(); navigateFocus(dateKey, 7); break
      case 'ArrowUp':    e.preventDefault(); navigateFocus(dateKey, -7); break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!isUnavailable) handleDateClick(dateKey)
        break
      case 'Escape':
        e.preventDefault()
        onChange('', '')
        break
    }
  }

  const isDateSelected = (dateKey: string) => dateKey === checkIn || dateKey === checkOut
  const isDateInRange = (dateKey: string) => {
    if (!checkIn || !checkOut) return false
    return dateKey > checkIn && dateKey < checkOut
  }

  const cells = getMonthMatrix(currentYear, currentMonth)
  const nights = checkIn && checkOut ? expandDateKeys(checkIn, checkOut).length : 0

  return (
    <div className="rounded-none border border-gray-200 bg-white overflow-hidden">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <button type="button" onClick={handlePrevMonth} aria-label="이전 달" disabled={isPastLimit} className="flex h-10 w-10 items-center justify-center rounded-none text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-[16px] font-semibold text-[#1a1a1a]">{getMonthLabel()}</h3>
        <button type="button" onClick={handleNextMonth} aria-label="다음 달" className="flex h-10 w-10 items-center justify-center rounded-none text-gray-500 hover:bg-gray-100 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-50 py-2.5 px-4 text-center text-[13px] font-medium text-gray-400">
        {weekLabels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="overflow-hidden relative select-none">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${currentYear}-${currentMonth}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(e, info) => {
              if (info.offset.x > 60) {
                handlePrevMonth()
              } else if (info.offset.x < -60) {
                handleNextMonth()
              }
            }}
            className="grid grid-cols-7 gap-0.5 p-2 md:gap-1 md:p-3 cursor-grab active:cursor-grabbing touch-pan-y"
          >
              {cells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const dateKey = formatDateKey(cell)
              const isPast = dateKey < todayKey
              const isBlocked = blockedKeys.has(dateKey)
              const isReserved = reservedKeys.has(dateKey)
              const isUnavailable = isPast || isBlocked || isReserved

              const isSelected = isDateSelected(dateKey)
              const isStart = dateKey === checkIn
              const isEnd = dateKey === checkOut
              const isInRange = isDateInRange(dateKey)
              const isFocused = focusedDateKey === dateKey

              const dayNum = cell.getUTCDate()
              const monthName = new Intl.DateTimeFormat('ko-KR', { month: 'long', timeZone: 'UTC' }).format(cell)
              const ariaLabel = `${monthName} ${dayNum}일${isSelected ? ' (선택됨)' : ''}${isUnavailable ? ' (예약 불가)' : ''}`

              return (
                <motion.button
                  key={dateKey}
                  type="button"
                  onClick={() => !isUnavailable && handleDateClick(dateKey)}
                  onKeyDown={(e) => handleKeyDown(e, dateKey)}
                  onFocus={() => setFocusedDateKey(dateKey)}
                  disabled={isUnavailable}
                  aria-label={ariaLabel}
                  aria-pressed={isSelected}
                  tabIndex={isFocused || (!focusedDateKey && dateKey === todayKey) ? 0 : -1}
                  whileTap={{ scale: isUnavailable ? 1 : 0.95 }}
                  whileHover={{ scale: isUnavailable ? 1 : 1.05 }}
                  className={`flex aspect-square items-center justify-center text-[13px] relative transition-all select-none md:text-[14px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a] focus-visible:ring-offset-1 ${
                    isUnavailable
                      ? 'text-gray-300 cursor-not-allowed line-through rounded-none'
                      : isSelected
                        ? 'bg-[#1a1a1a] text-white font-bold rounded-full cursor-pointer'
                        : isInRange
                          ? 'bg-gray-100 text-[#1a1a1a] font-medium rounded-none cursor-pointer'
                          : dateKey === todayKey
                            ? 'text-[#1a1a1a] font-bold ring-1 ring-inset ring-gray-300 rounded-none cursor-pointer hover:bg-gray-50'
                            : 'text-gray-700 rounded-none cursor-pointer hover:bg-gray-50'
                  }`}
                >
                  <span>{dayNum}</span>
                </motion.button>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 하단 정보 */}
      <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between text-[13px] md:px-5">
        <div className="text-gray-500">
          {checkIn && checkOut ? (
            <span><strong className="text-[#1a1a1a]">{nights}박</strong> 선택됨</span>
          ) : checkIn ? (
            <span>체크아웃 날짜를 선택하세요</span>
          ) : (
            <span>체크인 날짜를 선택하세요</span>
          )}
        </div>
        {(checkIn || checkOut) && (
          <button
            type="button"
            onClick={() => onChange('', '')}
            className="min-h-[36px] rounded-none px-3 py-1.5 text-[13px] font-medium text-gray-500 hover:bg-gray-100 transition-colors"
          >
            초기화
          </button>
        )}
      </div>
    </div>
  )
}
