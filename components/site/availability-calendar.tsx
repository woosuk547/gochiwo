import { buildReservedDateKeys, formatDateKey, getTodayKey } from '@/lib/booking'
import { getMonthMatrix, weekLabels } from '@/lib/calendar'

interface AvailabilityCalendarProps {
  blockedDates: string[]
  reservedRanges: Array<{ checkIn: string; checkOut: string }>
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', timeZone: 'UTC' }).format(date)
}

const todayKey = getTodayKey()

export function AvailabilityCalendar({ blockedDates, reservedRanges }: AvailabilityCalendarProps) {
  const blockedKeys = new Set(blockedDates)
  const reservedKeys = buildReservedDateKeys(reservedRanges)
  const today = new Date()
  const months = [0, 1, 2].map((offset) => new Date(Date.UTC(today.getFullYear(), today.getMonth() + offset, 1)))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4 text-[13px] text-gray-500">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-gray-100 line-through" />
          예약 불가
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-gray-200 bg-white" />
          예약 가능
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {months.map((monthDate) => {
          const cells = getMonthMatrix(monthDate.getUTCFullYear(), monthDate.getUTCMonth())

          return (
            <section key={monthDate.toISOString()} className="overflow-hidden rounded-none border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-5 py-4">
                <h3 className="text-[16px] font-semibold text-[#1a1a1a]">{getMonthLabel(monthDate)}</h3>
              </div>

              <div className="grid grid-cols-7 border-b border-gray-50 py-2 text-center text-[12px] font-medium text-gray-400">
                {weekLabels.map((label) => (
                  <div key={label}>{label}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 p-3">
                {cells.map((cell, index) => {
                  if (!cell) return <div key={`empty-${index}`} className="aspect-square" />

                  const dateKey = formatDateKey(cell)
                  const unavailable = blockedKeys.has(dateKey) || reservedKeys.has(dateKey)
                  const isToday = dateKey === todayKey

                  return (
                    <div
                      key={dateKey}
                      className={`flex aspect-square items-center justify-center rounded-none text-[13px] ${
                        unavailable
                          ? 'text-gray-300 line-through'
                          : isToday
                            ? 'font-bold text-[#1a1a1a] ring-1 ring-inset ring-gray-300'
                            : 'text-gray-700'
                      }`}
                    >
                      {cell.getUTCDate()}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
