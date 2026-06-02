'use client'

import { useMemo } from 'react'
import { formatCurrency, formatDateKey, type ReservationSummary } from '@/lib/booking'

interface RevenueSummaryProps {
  reservations: ReservationSummary[]
}

export function RevenueSummary({ reservations }: RevenueSummaryProps) {
  const stats = useMemo(() => {
    const paid = reservations.filter(r => r.paymentStatus === 'PAID')
    const confirmed = reservations.filter(r => r.status === 'CONFIRMED' || r.paymentStatus === 'PAID')

    const totalRevenue = paid.reduce((sum, r) => sum + r.finalAmount, 0)
    const expectedRevenue = confirmed.reduce((sum, r) => sum + r.finalAmount, 0)
    const avgAmount = paid.length > 0 ? Math.round(totalRevenue / paid.length) : 0

    const now = new Date()
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const monthlyPaid = paid.filter(r => formatDateKey(r.checkIn).startsWith(thisMonthKey))
    const monthlyRevenue = monthlyPaid.reduce((sum, r) => sum + r.finalAmount, 0)

    const nightCounts = paid.map(r => {
      const ci = new Date(r.checkIn)
      const co = new Date(r.checkOut)
      return Math.round((co.getTime() - ci.getTime()) / 86400000)
    })
    const avgNights = nightCounts.length > 0 ? (nightCounts.reduce((a, b) => a + b, 0) / nightCounts.length).toFixed(1) : '0'

    const monthlyMap = new Map<string, number>()
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlyMap.set(key, 0)
    }
    for (const r of paid) {
      const key = formatDateKey(r.checkIn).slice(0, 7)
      if (monthlyMap.has(key)) monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + r.finalAmount)
    }
    const monthlyData = Array.from(monthlyMap.entries()).map(([key, value]) => ({
      label: key.slice(5) + '월',
      value,
    }))
    const maxMonthly = Math.max(...monthlyData.map(d => d.value), 1)

    return { totalRevenue, expectedRevenue, avgAmount, monthlyRevenue, avgNights, monthlyData, maxMonthly, paidCount: paid.length }
  }, [reservations])

  return (
    <section className="rounded-none border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5 md:px-8">
        <p className="text-[11px] tracking-[0.15em] font-medium text-gray-400 uppercase">Revenue</p>
        <h2 className="mt-1.5 text-lg font-semibold text-[#1a1a1a]">매출 요약</h2>
      </div>

      <div className="p-6 md:p-8">
        {/* 통계 — border-bottom row 방식 */}
        <div className="grid grid-cols-2 gap-0 border border-gray-100 md:grid-cols-4">
          {[
            { label: '누적 매출', value: formatCurrency(stats.totalRevenue), sub: `결제 완료 ${stats.paidCount}건` },
            { label: '이번 달 매출', value: formatCurrency(stats.monthlyRevenue), sub: '체크인 기준' },
            { label: '예상 매출', value: formatCurrency(stats.expectedRevenue), sub: '확정 예약 포함' },
            { label: '평균 객단가', value: formatCurrency(stats.avgAmount), sub: `평균 ${stats.avgNights}박` },
          ].map((item, i) => (
            <div key={item.label} className={`px-5 py-5 ${i > 0 ? 'border-l border-gray-100' : ''}`}>
              <p className="text-[11px] tracking-[0.1em] text-gray-400 uppercase">{item.label}</p>
              <p className="mt-2 text-[1.4rem] font-semibold text-[#1a1a1a]">{item.value}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <p className="mb-5 text-[11px] tracking-[0.12em] text-gray-400 uppercase">월별 매출 추이 (최근 4개월)</p>
          <div className="flex items-end gap-4 h-40 border-b border-gray-100 pb-2">
            {stats.monthlyData.map((item) => {
              const pct = stats.maxMonthly > 0 ? Math.max((item.value / stats.maxMonthly) * 100, item.value > 0 ? 6 : 0) : 0
              return (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] text-gray-400">{item.value > 0 ? formatCurrency(item.value) : '—'}</span>
                  <div
                    className="w-full transition-all"
                    style={{
                      height: `${pct}%`,
                      minHeight: item.value > 0 ? '6px' : '2px',
                      backgroundColor: item.value > 0 ? '#1a1a1a' : '#e5e7eb'
                    }}
                  />
                  <span className="text-[12px] text-gray-500">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
