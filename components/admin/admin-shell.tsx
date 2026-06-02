'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminLoginCard } from '@/components/admin/login-card'
import { BlockedDateManager } from '@/components/admin/blocked-date-manager'
import { CalendarView } from '@/components/admin/calendar-view'
import { ReservationManager } from '@/components/admin/reservation-manager'
import { RevenueSummary } from '@/components/admin/revenue-summary'
import { TestMailSender } from '@/components/admin/test-mail-sender'
import type {
  BlockedDateSummary,
  PaymentStatus,
  ReservationStatus,
  ReservationSummary,
} from '@/lib/booking'

type AdminTab = 'reservations' | 'blocked' | 'revenue' | 'mail'
type StatFilter = 'ALL' | 'PENDING' | 'GUIDE_SENT' | 'PAID' | 'PARTNERSHIP'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

export function AdminShell() {
  const [authChecked, setAuthChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [loginForm, setLoginForm] = useState({ adminId: '', password: '' })
  const [reservations, setReservations] = useState<ReservationSummary[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDateSummary[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [calendarOpen, setCalendarOpen] = useState(true)

  const [activeTab, setActiveTab] = useState<AdminTab>('reservations')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [statFilter, setStatFilter] = useState<StatFilter>('ALL')

  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  useEffect(() => { void checkSession() }, [])
  useEffect(() => { if (authenticated) void loadDashboard() }, [authenticated])

  async function checkSession() {
    try {
      const response = await fetch('/api/admin/session', { cache: 'no-store' })
      const result = await response.json()
      setAuthenticated(Boolean(result.authenticated))
    } catch { setAuthError('로그인 상태를 확인하지 못했어요.') }
    finally { setAuthChecked(true) }
  }

  async function loadDashboard() {
    const [rRes, bRes] = await Promise.all([
      fetch('/api/reservations', { cache: 'no-store' }),
      fetch('/api/block-dates', { cache: 'no-store' }),
    ])
    if (rRes.status === 401 || bRes.status === 401) {
      setAuthenticated(false); setAuthChecked(true); setAuthError('세션이 만료됐어요.'); return
    }
    const [rData, bData] = await Promise.all([rRes.json(), bRes.json()])
    setReservations(rData)
    setBlockedDates(bData)
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true); setAuthError('')
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '로그인 실패')
      setAuthenticated(true); setLoginForm({ adminId: '', password: '' })
    } catch (error) { setAuthError(error instanceof Error ? error.message : '로그인 실패') }
    finally { setLoading(false) }
  }

  async function updateReservation(id: string, updates: { status?: ReservationStatus; paymentStatus?: PaymentStatus; note?: string }) {
    const response = await fetch(`/api/reservations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    if (response.ok) {
      await loadDashboard()
      if (updates.status) showToast(`예약 상태 변경: ${updates.status === 'CONFIRMED' ? '예약 확정' : updates.status === 'DECLINED' ? '승인 거절' : updates.status === 'CANCELLED' ? '예약 취소' : '검토 중'}`)
      else if (updates.paymentStatus) showToast(`결제 상태 변경 완료`)
      else if (updates.note !== undefined) showToast('메모 저장 완료')
    } else {
      showToast('변경에 실패했어요.', 'error')
    }
  }

  async function createBlockedDate(date: string, label: string) {
    const response = await fetch('/api/block-dates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date, label }) })
    if (response.ok) {
      await loadDashboard()
      showToast('차단일이 등록됐어요.')
    }
  }

  async function deleteBlockedDate(id: string) {
    const response = await fetch(`/api/block-dates/${id}`, { method: 'DELETE' })
    if (response.ok) {
      await loadDashboard()
      showToast('차단일이 삭제됐어요.')
    }
  }

  function handleBlockFromCalendar(date: string) {
    createBlockedDate(date, '')
  }

  function handleUnblockFromCalendar(id: string) {
    deleteBlockedDate(id)
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthenticated(false); setReservations([]); setBlockedDates([])
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  function handleStatClick(filter: StatFilter) {
    setStatFilter(filter)
    setActiveTab('reservations')
  }

  const stats = useMemo(() => {
    const pending = reservations.filter((r) => r.status === 'PENDING').length
    const guideSent = reservations.filter((r) => r.paymentStatus === 'PAYMENT_GUIDE_SENT').length
    const paid = reservations.filter((r) => r.paymentStatus === 'PAID' || r.paymentStatus === 'DEPOSIT_PAID').length
    const partnership = reservations.filter((r) => r.source === 'PARTNERSHIP').length
    return [
      { label: '전체', value: reservations.length, filter: 'ALL' as StatFilter },
      { label: '검토 중', value: pending, filter: 'PENDING' as StatFilter },
      { label: '결제 대기', value: guideSent, filter: 'GUIDE_SENT' as StatFilter },
      { label: '결제 완료', value: paid, filter: 'PAID' as StatFilter },
      { label: '제휴', value: partnership, filter: 'PARTNERSHIP' as StatFilter },
    ]
  }, [reservations])

  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'reservations', label: '예약 관리' },
    { key: 'blocked', label: '차단일' },
    { key: 'revenue', label: '매출' },
    { key: 'mail', label: '메일' },
  ]

  if (!authChecked) return <div className="min-h-screen bg-gray-50" />

  if (!authenticated) {
    return (
      <AdminLoginCard
        adminId={loginForm.adminId}
        password={loginForm.password}
        error={authError}
        loading={loading}
        onChange={(field, value) => setLoginForm((prev) => ({ ...prev, [field]: value }))}
        onSubmit={handleLogin}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* 토스트 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className={`rounded-none px-5 py-3 text-[13px] font-medium shadow-lg ${
                toast.type === 'success' ? 'bg-[#1a1a1a] text-white' : 'bg-red-600 text-white'
              }`}
            >
              {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 헤더 */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md px-4 md:px-5">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-[15px] font-semibold text-[#1a1a1a]">Repause</span>
            <span className="rounded-none border border-gray-200 px-2 py-0.5 text-[10px] tracking-[0.12em] font-medium text-gray-400 uppercase">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <a href="/" className="min-h-[44px] flex items-center rounded-none px-3 py-1.5 text-[12px] tracking-wide text-gray-400 hover:text-[#1a1a1a] transition-colors" target="_blank" rel="noopener noreferrer">
              사이트 보기 ↗
            </a>
            <button onClick={logout} className="min-h-[44px] rounded-none px-3 py-1.5 text-[12px] text-gray-400 hover:text-[#1a1a1a] transition-colors">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-5 md:px-5 md:py-6">
        {/* 통계 카드 */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:overflow-visible">
          {stats.map((item) => (
            <button
              key={item.label}
              onClick={() => handleStatClick(item.filter)}
              className={`shrink-0 min-w-[90px] rounded-none border text-left transition-all md:min-w-0 ${
                statFilter === item.filter
                  ? 'border-[#1a1a1a] bg-[#1a1a1a]'
                  : 'border-gray-200 bg-white hover:border-gray-400'
              } p-4`}
            >
              <p className={`text-xl font-semibold md:text-2xl ${statFilter === item.filter ? 'text-white' : 'text-[#1a1a1a]'}`}>
                {item.value}
              </p>
              <p className={`mt-0.5 text-[11px] tracking-wide ${statFilter === item.filter ? 'text-white/60' : 'text-gray-400'}`}>
                {item.label}
              </p>
            </button>
          ))}
        </div>

        {/* 2단 레이아웃 */}
        <div className="mt-4 flex flex-col gap-4 md:mt-5 md:gap-5 lg:grid lg:grid-cols-[360px_1fr]">
          {/* 캘린더 — 모바일 접힘 */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <details
              open={calendarOpen}
              onToggle={(e) => setCalendarOpen((e.target as HTMLDetailsElement).open)}
              className="lg:!block"
            >
              <summary className="flex cursor-pointer items-center justify-between rounded-none border border-gray-200 bg-white px-4 py-3 text-[13px] font-medium text-[#1a1a1a] lg:hidden">
                예약 캘린더
                <span className="text-gray-400">{calendarOpen ? '▲' : '▼'}</span>
              </summary>
              <div>
                <CalendarView
                  reservations={reservations}
                  blockedDates={blockedDates}
                  selectedDate={selectedDate}
                  onDateClick={setSelectedDate}
                  onUpdateReservation={updateReservation}
                  onBlockDate={handleBlockFromCalendar}
                  onUnblockDate={handleUnblockFromCalendar}
                  year={calYear}
                  month={calMonth}
                  onPrevMonth={prevMonth}
                  onNextMonth={nextMonth}
                />
              </div>
            </details>
          </div>

          {/* 탭 콘텐츠 */}
          <div>
            {/* 탭 바 */}
            <div className="flex overflow-x-auto rounded-none border border-gray-200 bg-white">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative min-h-[44px] shrink-0 flex-1 px-5 py-3 text-[13px] font-medium transition-colors ${
                    activeTab === tab.key ? 'text-[#1a1a1a]' : 'text-gray-400 hover:text-[#1a1a1a]'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a1a1a]"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* 탭 콘텐츠 — 페이드 전환 */}
            <div className="mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {activeTab === 'reservations' && (
                    <ReservationManager
                      reservations={reservations}
                      onUpdate={updateReservation}
                      externalFilter={statFilter}
                    />
                  )}
                  {activeTab === 'blocked' && (
                    <BlockedDateManager blockedDates={blockedDates} onCreate={createBlockedDate} onDelete={deleteBlockedDate} />
                  )}
                  {activeTab === 'revenue' && (
                    <RevenueSummary reservations={reservations} />
                  )}
                  {activeTab === 'mail' && <TestMailSender />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
