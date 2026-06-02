'use client'

import { useMemo, useState } from 'react'
import {
  formatCurrency,
  formatDateKey,
  formatDateTime,
  paymentMethodLabel,
  paymentStatusLabel,
  reservationStatusLabel,
  type PaymentStatus,
  type ReservationSource,
  type ReservationStatus,
  type ReservationSummary,
} from '@/lib/booking'

interface ReservationManagerProps {
  reservations: ReservationSummary[]
  onUpdate: (id: string, updates: { status?: ReservationStatus; paymentStatus?: PaymentStatus; note?: string }) => Promise<void>
  externalFilter?: 'ALL' | 'PENDING' | 'GUIDE_SENT' | 'PAID' | 'PARTNERSHIP'
}

const statusColors: Record<ReservationStatus, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DECLINED:  'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
}

const paymentColors: Record<PaymentStatus, string> = {
  REVIEW_PENDING:      'bg-gray-100 text-gray-500 border-gray-200',
  PAYMENT_GUIDE_SENT:  'bg-sky-50 text-sky-700 border-sky-200',
  DEPOSIT_PAID:        'bg-amber-50 text-amber-700 border-amber-200',
  PAID:                'bg-emerald-50 text-emerald-700 border-emerald-200',
  REFUNDED:            'bg-purple-50 text-purple-700 border-purple-200',
}

export function ReservationManager({ reservations, onUpdate, externalFilter = 'ALL' }: ReservationManagerProps) {
  const [sourceFilter, setSourceFilter] = useState<'ALL' | ReservationSource>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReservationStatus>('ALL')
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | PaymentStatus>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteValue, setNoteValue] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/payment/${id}`
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      })
      .catch((err) => console.error('Failed to copy link:', err))
  }

  function getDday(checkIn: string): string {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(checkIn + 'T00:00:00')
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return '오늘'
    if (diff === 1) return '내일'
    if (diff < 0) return `D+${Math.abs(diff)}`
    return `D-${diff}`
  }

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // 외부 필터 적용
      if (externalFilter === 'PENDING' && r.status !== 'PENDING') return false
      if (externalFilter === 'GUIDE_SENT' && r.paymentStatus !== 'PAYMENT_GUIDE_SENT') return false
      if (externalFilter === 'PAID' && r.paymentStatus !== 'PAID' && r.paymentStatus !== 'DEPOSIT_PAID') return false
      if (externalFilter === 'PARTNERSHIP' && r.source !== 'PARTNERSHIP') return false

      const sourceMatches = sourceFilter === 'ALL' || r.source === sourceFilter
      const statusMatches = statusFilter === 'ALL' || r.status === statusFilter
      const paymentMatches = paymentFilter === 'ALL' || r.paymentStatus === paymentFilter
      return sourceMatches && statusMatches && paymentMatches
    })
  }, [externalFilter, paymentFilter, reservations, sourceFilter, statusFilter])

  const sourceFilters = [
    { label: '전체', value: 'ALL' },
    { label: '일반', value: 'DIRECT' },
    { label: '제휴', value: 'PARTNERSHIP' },
  ] as const

  return (
    <section className="rounded-none border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-4 md:px-6 md:py-5 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div>
            <p className="text-[11px] tracking-[0.15em] font-medium text-gray-400 uppercase">예약 현황</p>
            <h2 className="mt-1 text-lg font-semibold text-[#1a1a1a]">예약 · 결제 현황</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-none border border-gray-200">
              {sourceFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSourceFilter(filter.value)}
                  className={`min-h-[36px] px-3 py-2 text-xs font-medium transition-colors md:px-4 ${
                    sourceFilter === filter.value
                      ? 'bg-[#1a1a1a] text-white'
                      : 'text-gray-500 hover:text-[#1a1a1a] hover:bg-gray-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ReservationStatus)}
              className="min-h-[36px] rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 outline-none focus:border-gray-400"
            >
              <option value="ALL">모든 예약 상태</option>
              <option value="PENDING">검토 중</option>
              <option value="CONFIRMED">예약 확정</option>
              <option value="DECLINED">승인 거절</option>
              <option value="CANCELLED">예약 취소</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'ALL' | PaymentStatus)}
              className="min-h-[36px] rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 outline-none focus:border-gray-400"
            >
              <option value="ALL">모든 결제 상태</option>
              <option value="REVIEW_PENDING">결제 검토 전</option>
              <option value="PAYMENT_GUIDE_SENT">결제 안내 발송</option>
              <option value="DEPOSIT_PAID">예약금 완료</option>
              <option value="PAID">결제 완료</option>
              <option value="REFUNDED">환불 완료</option>
            </select>

            {/* 활성 필터 배지 */}
            {(sourceFilter !== 'ALL' || statusFilter !== 'ALL' || paymentFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => { setSourceFilter('ALL'); setStatusFilter('ALL'); setPaymentFilter('ALL') }}
                className="flex items-center gap-1 rounded-none border border-gray-300 px-2.5 py-1.5 text-[11px] text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
              >
                필터 초기화 ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8">
        {filteredReservations.length === 0 && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-6 py-8 text-center text-sm text-gray-500">
            조건에 맞는 예약이 없습니다. 새 예약이 들어오면 이곳에서 상태와 결제 단계를 함께 관리할 수 있습니다.
          </div>
        )}

        <div className="space-y-2">
          {filteredReservations.map((r) => {
            const isExpanded = expandedId === r.id
            return (
              <article key={r.id} className="overflow-hidden rounded-none border border-gray-200 bg-white">
                {/* Row 헤더 */}
                <div className="flex items-center min-h-[56px]">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className="flex-1 min-h-[56px] px-4 py-3 text-left hover:bg-gray-50 transition-colors md:px-5"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-none border px-2 py-0.5 text-[11px] font-medium ${statusColors[r.status]}`}>
                          {reservationStatusLabel[r.status]}
                        </span>
                        {r.source === 'PARTNERSHIP' && (
                          <span className="rounded-none border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                            제휴
                          </span>
                        )}
                        <span className="text-[13px] font-semibold text-[#1a1a1a]">{r.guestName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] text-gray-400">
                          {formatDateKey(r.checkIn)} → {formatDateKey(r.checkOut)}
                        </span>
                        {r.status !== 'CANCELLED' && r.status !== 'DECLINED' && (
                          <span className={`rounded-none px-2 py-0.5 text-[11px] font-bold ${
                            getDday(r.checkIn) === '오늘' ? 'bg-red-100 text-red-700' :
                            getDday(r.checkIn) === '내일' ? 'bg-amber-100 text-amber-700' :
                            getDday(r.checkIn).startsWith('D+') ? 'bg-gray-100 text-gray-400' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {getDday(r.checkIn)}
                          </span>
                        )}
                        <span className="text-[13px] font-semibold text-[#1a1a1a]">{formatCurrency(r.finalAmount)}</span>
                        <span className={`text-[11px] font-medium ${paymentColors[r.paymentStatus].split(' ')[1]?.replace('text-', 'text-') ?? 'text-gray-400'}`}>
                          {paymentStatusLabel[r.paymentStatus]}
                        </span>
                        <span className="text-gray-300 text-sm">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                  </button>

                  {/* 결제링크 항상 노출 */}
                  {r.paymentMethod !== 'CORPORATE_BILLING' && r.status !== 'CANCELLED' && (
                    <button
                      type="button"
                      onClick={() => handleCopyLink(r.id)}
                      title="결제 링크 복사"
                      className="shrink-0 flex h-full min-h-[56px] items-center border-l border-gray-100 px-3 text-gray-300 hover:bg-gray-50 hover:text-[#1a1a1a] transition-colors"
                    >
                      {copiedId === r.id ? (
                        <span className="text-[10px] font-medium text-emerald-600">복사됨</span>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                        </svg>
                      )}
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 md:px-5 md:py-5">
                    <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
                      <div className="space-y-5">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between border-b border-dashed border-gray-200 pb-4">
                          <div>
                            <p className="text-[11px] tracking-[0.12em] text-gray-400 uppercase">예약자</p>
                            <p className="mt-2 text-[14px] font-semibold text-[#1a1a1a]">{r.guestName}</p>
                            {r.companyName && <p className="text-[13px] text-gray-500">{r.companyName}</p>}
                            <p className="text-[13px] text-gray-500">{r.email} · {r.phone}</p>
                          </div>
                          
                          {r.paymentMethod !== 'CORPORATE_BILLING' && (
                            <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopyLink(r.id)}
                                className="inline-flex items-center gap-1.5 rounded-none border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                              >
                                {copiedId === r.id ? '✓ 복사 완료' : '결제 링크 복사'}
                              </button>
                              <a
                                href={`/payment/${r.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-none bg-[#1a1a1a] px-3 py-1.5 text-xs text-white hover:bg-[#333] transition-colors"
                              >
                                결제 페이지 ↗
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="grid gap-x-8 gap-y-2 text-sm md:grid-cols-2 xl:grid-cols-3">
                          {[
                            ['체크인', formatDateKey(r.checkIn)],
                            ['체크아웃', formatDateKey(r.checkOut)],
                            ['인원', `${r.guests}명`],
                            ['결제 방식', paymentMethodLabel[r.paymentMethod]],
                            ['예상 총액', formatCurrency(r.finalAmount)],
                            ['예약금', r.depositAmount > 0 ? formatCurrency(r.depositAmount) : '법인 정산'],
                            ['접수', formatDateTime(r.createdAt)],
                            ['결제 안내', r.requestedAt ? formatDateTime(r.requestedAt) : '미발송'],
                            ['결제 완료', r.paidAt ? formatDateTime(r.paidAt) : '미완료'],
                          ].map(([key, val]) => (
                            <div key={key}>
                              <span className="text-gray-400">{key}  </span>
                              <span className="text-[#1a1a1a]">{val}</span>
                            </div>
                          ))}
                        </div>

                        {r.benefitLabel && (
                          <p className="text-sm text-gray-500">제휴 구분: {r.benefitLabel}</p>
                        )}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-gray-400">운영 메모</p>
                            {editingNoteId !== r.id && (
                              <button
                                type="button"
                                onClick={() => { setEditingNoteId(r.id); setNoteValue(r.note ?? '') }}
                                className="text-xs text-gray-400 hover:text-[#1a1a1a] transition-colors"
                              >
                                {r.note ? '수정' : '+ 메모 추가'}
                              </button>
                            )}
                          </div>
                          {editingNoteId === r.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteValue}
                                onChange={(e) => setNoteValue(e.target.value)}
                                rows={3}
                                placeholder="내부 메모를 입력하세요..."
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-gray-300 outline-none focus:border-gray-400 resize-none transition-colors"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={async () => { await onUpdate(r.id, { note: noteValue }); setEditingNoteId(null) }}
                                  className="rounded-xl bg-[#1a1a1a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#333] transition-colors"
                                >
                                  저장
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingNoteId(null)}
                                  className="rounded-xl border border-gray-200 px-4 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : r.note ? (
                            <p className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm leading-7 text-gray-500">
                              {r.note}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-300">메모 없음</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="mb-2 text-[11px] tracking-[0.12em] text-gray-400 uppercase">예약 상태</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {([
                              ['CONFIRMED', '예약 확정', 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'],
                              ['PENDING',   '검토 유지', 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'],
                              ['DECLINED',  '승인 거절', 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'],
                              ['CANCELLED', '예약 취소', 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'],
                            ] as const).map(([val, label, cls]) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => onUpdate(r.id, { status: val })}
                                className={`rounded-none px-3 py-2 text-xs font-medium transition-colors ${cls} ${r.status === val ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-[11px] tracking-[0.12em] text-gray-400 uppercase">결제 상태</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {([
                              ['PAYMENT_GUIDE_SENT', '결제 안내',  'bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100'],
                              ['DEPOSIT_PAID',       '예약금 완료', 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'],
                              ['PAID',               '결제 완료',  'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'],
                              ['REVIEW_PENDING',     '결제 보류',  'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'],
                              ['REFUNDED',           '환불 처리',  'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100'],
                            ] as const).map(([val, label, cls]) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => onUpdate(r.id, { paymentStatus: val })}
                                className={`rounded-none px-3 py-2 text-xs font-medium transition-colors ${cls} ${r.paymentStatus === val ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
