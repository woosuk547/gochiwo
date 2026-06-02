'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  expandDateKeys,
  formatCurrency,
  formatDateKey,
  reservationStatusLabel,
  type PaymentStatus,
  type ReservationStatus,
  type ReservationSummary,
} from '@/lib/booking'
import type { BlockedDateSummary } from '@/lib/booking'
import { getHoliday } from '@/lib/holidays'

interface CalendarViewProps {
  reservations: ReservationSummary[]
  blockedDates: BlockedDateSummary[]
  selectedDate: string | null
  onDateClick: (dateKey: string) => void
  onUpdateReservation?: (id: string, updates: { status?: ReservationStatus; paymentStatus?: PaymentStatus }) => Promise<void>
  onBlockDate?: (date: string) => void
  onUnblockDate?: (id: string) => void
  year: number
  month: number
  onPrevMonth: () => void
  onNextMonth: () => void
}

interface WeekRow {
  days: (string | null)[]
}

interface BarSegment {
  reservation: ReservationSummary
  startCol: number
  span: number
  isStart: boolean
  isEnd: boolean
}

const STATUS_BAR_COLORS: Record<ReservationStatus, string> = {
  PENDING: 'bg-amber-400',
  CONFIRMED: 'bg-[#1a1a1a]',
  DECLINED: 'bg-red-300',
  CANCELLED: 'bg-gray-300',
}

const STATUS_TEXT_COLORS: Record<ReservationStatus, string> = {
  PENDING: 'text-amber-950',
  CONFIRMED: 'text-white',
  DECLINED: 'text-red-900',
  CANCELLED: 'text-gray-600',
}

const statusColors: Record<ReservationStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DECLINED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
}

function getMonthWeeks(year: number, month: number): WeekRow[] {
  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const weeks: WeekRow[] = []
  let currentWeek: (string | null)[] = []

  for (let i = 0; i < firstDay; i++) currentWeek.push(null)

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    currentWeek.push(key)
    if (currentWeek.length === 7) {
      weeks.push({ days: currentWeek })
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null)
    weeks.push({ days: currentWeek })
  }

  return weeks
}

function getBarSegmentsForWeek(week: WeekRow, reservations: ReservationSummary[]): BarSegment[] {
  const validDays = week.days.filter(Boolean) as string[]
  if (validDays.length === 0) return []

  const weekStart = validDays[0]
  const weekEnd = validDays[validDays.length - 1]
  const segments: BarSegment[] = []

  for (const r of reservations) {
    if (r.status === 'CANCELLED' || r.status === 'DECLINED') continue
    const rCheckIn = formatDateKey(r.checkIn)
    const rCheckOut = formatDateKey(r.checkOut)

    // 체크아웃일도 바에 포함 (투숙 마지막 날)
    if (rCheckOut < weekStart || rCheckIn > weekEnd) continue

    const barStart = rCheckIn < weekStart ? weekStart : rCheckIn
    const barEnd = rCheckOut > weekEnd ? weekEnd : rCheckOut

    const startCol = week.days.indexOf(barStart)
    const endCol = week.days.indexOf(barEnd)

    if (startCol < 0 || endCol < 0) continue

    const span = endCol - startCol + 1

    segments.push({
      reservation: r,
      startCol,
      span: Math.max(1, span),
      isStart: rCheckIn >= weekStart,
      isEnd: rCheckOut <= weekEnd,
    })
  }

  return segments
}

export function CalendarView({
  reservations,
  blockedDates,
  selectedDate,
  onDateClick,
  onUpdateReservation,
  onBlockDate,
  onUnblockDate,
  year,
  month,
  onPrevMonth,
  onNextMonth,
}: CalendarViewProps) {
  const weeks = useMemo(() => getMonthWeeks(year, month), [year, month])

  const blockedDayMap = useMemo(() => {
    const map = new Map<string, BlockedDateSummary>()
    for (const b of blockedDates) map.set(formatDateKey(b.date), b)
    return map
  }, [blockedDates])

  const reservedDays = useMemo(() => {
    const map = new Map<string, ReservationSummary[]>()
    for (const r of reservations) {
      if (r.status === 'CANCELLED' || r.status === 'DECLINED') continue
      for (const d of expandDateKeys(r.checkIn, r.checkOut)) {
        const arr = map.get(d) || []
        if (!arr.find(x => x.id === r.id)) arr.push(r)
        map.set(d, arr)
      }
    }
    return map
  }, [reservations])

  const todayKey = formatDateKey(new Date())
  const monthLabel = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(new Date(year, month, 1))
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']

  const selectedReservations = selectedDate ? (reservedDays.get(selectedDate) || []) : []
  const selectedBlocked = selectedDate ? blockedDayMap.get(selectedDate) : undefined
  const selectedHoliday = selectedDate ? getHoliday(selectedDate) : null

  const formatSelectedDate = (key: string) => {
    const d = new Date(key + 'T00:00:00Z')
    return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long', timeZone: 'UTC' }).format(d)
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="border-b border-gray-100 px-4 py-3 md:px-5 md:py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#1a1a1a] md:text-[16px]">예약 캘린더</h2>
          <div className="flex items-center gap-1 md:gap-2">
            <button onClick={onPrevMonth} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[100px] text-center text-[13px] font-medium text-[#1a1a1a] md:min-w-[110px] md:text-[14px]">{monthLabel}</span>
            <button onClick={onNextMonth} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 캘린더 본문 */}
      <div className="p-3">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 text-center border-b border-gray-200">
          {weekdays.map((d, i) => (
            <div key={d} className={`py-2 text-[11px] font-medium border-r border-gray-100 last:border-r-0 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-sky-500' : 'text-gray-400'}`}>{d}</div>
          ))}
        </div>

        {/* 주별 행 - 날짜와 바가 같은 셀 안에 */}
        {weeks.map((week, weekIdx) => {
          const bars = getBarSegmentsForWeek(week, reservations)

          // 바 레인 배정 - 겹치는 바를 다른 행에 배치
          const lanes: BarSegment[][] = []
          for (const bar of bars) {
            let placed = false
            for (const lane of lanes) {
              const overlaps = lane.some(existing =>
                !(bar.startCol >= existing.startCol + existing.span || bar.startCol + bar.span <= existing.startCol)
              )
              if (!overlaps) { lane.push(bar); placed = true; break }
            }
            if (!placed) lanes.push([bar])
          }

          const barAreaHeight = lanes.length * 20
          const cellHeight = 28 + barAreaHeight + 4

          return (
            <div key={weekIdx} className="relative grid grid-cols-7 border-b border-gray-100" style={{ minHeight: `${Math.max(cellHeight, 48)}px` }}>
              {week.days.map((dateKey, colIdx) => {
                if (!dateKey) return <div key={`empty-${weekIdx}-${colIdx}`} className="border-r border-gray-100" />

                const dayNum = parseInt(dateKey.split('-')[2])
                const isToday = dateKey === todayKey
                const isSelected = dateKey === selectedDate
                const isBlocked = blockedDayMap.has(dateKey)
                const holiday = getHoliday(dateKey)
                const isSunday = colIdx === 0
                const isSaturday = colIdx === 6
                const isCheckIn = reservations.some(r => r.status !== 'CANCELLED' && r.status !== 'DECLINED' && formatDateKey(r.checkIn) === dateKey)
                const isCheckOut = reservations.some(r => r.status !== 'CANCELLED' && r.status !== 'DECLINED' && formatDateKey(r.checkOut) === dateKey)

                let textColor = (isSunday || holiday) ? 'text-red-500' : isSaturday ? 'text-sky-600' : 'text-[#1a1a1a]'
                if (isBlocked) textColor = 'text-red-400'

                return (
                  <div
                    key={dateKey}
                    onClick={() => onDateClick(dateKey)}
                    className={`cursor-pointer border-r border-gray-100 p-1 transition-colors ${
                      isSelected ? 'bg-blue-50' : isBlocked ? 'bg-red-50/40' : 'hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-0.5">
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                        isToday ? 'bg-[#1a1a1a] text-white font-bold' : isSelected ? 'bg-blue-600 text-white font-medium' : textColor
                      }`}>
                        {dayNum}
                      </span>
                      {isCheckIn && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="체크인" />}
                      {isCheckOut && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" title="체크아웃" />}
                    </div>
                  </div>
                )
              })}

              {/* 바 오버레이 - 레인별로 겹치지 않게 */}
              {lanes.map((lane, laneIdx) =>
                lane.map((bar, barIdx) => {
                  const cellWidth = 100 / 7
                  let leftPct = bar.startCol * cellWidth
                  let widthPct = bar.span * cellWidth

                  // 체크인일: 셀 중간부터 시작 (오후 입실)
                  if (bar.isStart) { leftPct += cellWidth * 0.4; widthPct -= cellWidth * 0.4 }
                  // 체크아웃일: 셀 중간에서 끝 (오전 퇴실)
                  if (bar.isEnd) { widthPct -= cellWidth * 0.4 }

                  return (
                    <div
                      key={`bar-${bar.reservation.id}-${weekIdx}-${laneIdx}-${barIdx}`}
                      className={`absolute h-[17px] flex items-center justify-between overflow-hidden text-[10px] font-medium leading-none cursor-pointer ${STATUS_BAR_COLORS[bar.reservation.status]} ${STATUS_TEXT_COLORS[bar.reservation.status]} ${
                        bar.isStart ? 'rounded-l-full pl-1.5' : 'pl-0.5'
                      } ${bar.isEnd ? 'rounded-r-full pr-1' : 'pr-0.5'}`}
                      style={{
                        left: `calc(${leftPct}% + 1px)`,
                        width: `calc(${widthPct}% - 2px)`,
                        top: `${26 + laneIdx * 20}px`,
                      }}
                      onClick={(e) => { e.stopPropagation(); onDateClick(formatDateKey(bar.reservation.checkIn)) }}
                    >
                      <span className="flex items-center gap-0.5 truncate">
                        {bar.isStart && <span className="opacity-60 text-[9px]">IN</span>}
                        <span className="truncate">{bar.isStart ? bar.reservation.guestName : ''}</span>
                      </span>
                      {bar.isEnd && <span className="opacity-60 text-[9px] shrink-0">OUT</span>}
                    </div>
                  )
                })
              )}
            </div>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="border-t border-gray-100 px-4 py-2.5 flex flex-wrap gap-3 md:gap-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full bg-[#1a1a1a]" />확정</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full bg-amber-400" />검토중</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />체크인</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" />체크아웃</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-3 rounded-sm bg-red-50 border border-red-200" />차단</span>
      </div>

      {/* 선택된 날짜 정보 패널 */}
      {selectedDate && (
        <div className="border-t border-gray-100 bg-gray-50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#1a1a1a]">{formatSelectedDate(selectedDate)}</h3>
            {selectedDate >= todayKey && !selectedBlocked && selectedReservations.length === 0 && onBlockDate && (
              <button
                onClick={() => onBlockDate(selectedDate)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-gray-500 hover:bg-gray-100"
              >
                차단일 설정
              </button>
            )}
            {selectedBlocked && onUnblockDate && (
              <button
                onClick={() => onUnblockDate(selectedBlocked.id)}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-100"
              >
                차단 해제
              </button>
            )}
          </div>

          {selectedHoliday && (
            <p className="mt-2 text-[13px] text-rose-500">{selectedHoliday.name}</p>
          )}

          {selectedBlocked && (
            <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-[13px] font-medium text-red-700">차단일</p>
              {selectedBlocked.label && <p className="mt-1 text-[12px] text-red-500">{selectedBlocked.label}</p>}
            </div>
          )}

          {selectedReservations.length === 0 && !selectedBlocked && (
            <p className="mt-3 text-[13px] text-gray-400">이 날짜에 예약이 없어요.</p>
          )}

          {selectedReservations.map((r) => (
            <div key={r.id} className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[#1a1a1a]">{r.guestName}</span>
                    <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${statusColors[r.status]}`}>
                      {reservationStatusLabel[r.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-gray-500">
                    {formatDateKey(r.checkIn)} ~ {formatDateKey(r.checkOut)} / {r.guests}명
                  </p>
                  <p className="mt-0.5 text-[12px] text-gray-400">{r.email}</p>
                </div>
                <p className="text-[14px] font-bold text-[#1a1a1a]">{formatCurrency(r.finalAmount)}</p>
              </div>

              {onUpdateReservation && r.status === 'PENDING' && (
                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                  <button
                    onClick={() => onUpdateReservation(r.id, { status: 'CONFIRMED' })}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-600"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => onUpdateReservation(r.id, { status: 'DECLINED' })}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] text-gray-500 hover:bg-gray-50"
                  >
                    거절
                  </button>
                </div>
              )}
              {onUpdateReservation && r.status === 'CONFIRMED' && r.paymentStatus !== 'PAID' && (
                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                  <button
                    onClick={() => onUpdateReservation(r.id, { paymentStatus: 'PAYMENT_GUIDE_SENT' })}
                    className="rounded-lg bg-sky-500 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-sky-600"
                  >
                    결제 안내
                  </button>
                  <button
                    onClick={() => onUpdateReservation(r.id, { paymentStatus: 'PAID' })}
                    className="rounded-lg bg-[#1a1a1a] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#333]"
                  >
                    결제 완료
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
