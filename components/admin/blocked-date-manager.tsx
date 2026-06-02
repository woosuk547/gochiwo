'use client'

import { useState } from 'react'
import { formatDateLabel, type BlockedDateSummary } from '@/lib/booking'

interface BlockedDateManagerProps {
  blockedDates: BlockedDateSummary[]
  onCreate: (date: string, label: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function BlockedDateManager({ blockedDates, onCreate, onDelete }: BlockedDateManagerProps) {
  const [date, setDate] = useState('')
  const [label, setLabel] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!date) return
    await onCreate(date, label)
    setDate('')
    setLabel('')
  }

  return (
    <section className="rounded-none border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-4 md:px-6 md:py-5 lg:px-8">
        <p className="text-[11px] tracking-[0.15em] font-medium text-gray-400 uppercase">Block Days</p>
        <h2 className="mt-1 text-lg font-semibold text-[#1a1a1a]">차단일 관리</h2>
        <p className="mt-1.5 text-[13px] text-gray-500">
          촬영, 점검, 운영 준비 등 예약을 막아야 하는 날짜를 등록해요.
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
        <div className="border-b border-gray-100 p-4 md:p-6 lg:border-b-0 lg:border-r lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] tracking-[0.12em] font-medium text-gray-400 uppercase">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-none border border-gray-200 bg-white px-4 h-11 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] tracking-[0.12em] font-medium text-gray-400 uppercase">사유 (선택)</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="예: 촬영 준비, 청소, 운영 휴무"
                className="w-full rounded-none border border-gray-200 bg-white px-4 h-11 text-sm text-[#1a1a1a] placeholder:text-gray-300 outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-none bg-[#1a1a1a] h-11 text-sm font-medium text-white transition-colors hover:bg-[#333]"
            >
              차단일 추가
            </button>
          </form>

          <p className="mt-4 text-[12px] leading-relaxed text-gray-400">
            좌측 캘린더에서 날짜를 클릭해도 바로 차단일로 등록돼요.
          </p>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          {blockedDates.length === 0 && (
            <div className="border border-dashed border-gray-200 px-6 py-10 text-center">
              <p className="text-[13px] font-medium text-gray-400">등록된 차단일이 없어요</p>
              <p className="mt-1 text-[12px] text-gray-300">좌측 폼 또는 캘린더에서 날짜를 선택해 추가하세요.</p>
            </div>
          )}

          <div className="space-y-1.5">
            {blockedDates.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-[13px] font-medium text-[#1a1a1a]">{formatDateLabel(item.date)}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{item.label || '사유 없음'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="rounded-none border border-gray-200 px-3 py-1.5 text-[11px] text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
