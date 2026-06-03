'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LargeCalendarPicker } from '@/components/site/large-calendar-picker'
import { ReservationForm } from '@/components/site/reservation-form'
import { partnershipBenefits } from '@/lib/repause-content'
import { getMinBookableDateKey, PARTNERSHIP_MIN_ADVANCE_DAYS } from '@/lib/booking'
import { Button } from '@/components/ui/button'

interface PartnershipContentProps {
  blockedDates: string[]
  reservedRanges: Array<{ checkIn: string; checkOut: string }>
}

const purposeOptions = [
  '쇼핑몰 룩북',
  '광고 · 미디어 촬영',
  '매거진 화보',
  '드라마 · 영화',
  '개인 유튜브 · 콘텐츠',
  '기타 대관 문의',
]

const spaceOptions = [
  '실내 전체 (거실, 침실 2개, 욕실)',
  '야외 전체 (프라이빗 정원, 야외 풀, 데크 포치)',
  '실내 및 야외 전체 대관',
]

export function PartnershipContent({ blockedDates, reservedRanges }: PartnershipContentProps) {
  const [activeTab, setActiveTab] = useState<'partnership' | 'rental'>('partnership')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  // 대관 폼 상태
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [rentalForm, setRentalForm] = useState({
    companyName: '',
    brandWebsite: '',
    purpose: purposeOptions[0],
    rentalDate: '',
    duration: '',
    totalGuests: '5',
    useSpace: spaceOptions[0],
    note: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  })

  function handleCalendarChange(newCheckIn: string, newCheckOut: string) {
    setCheckIn(newCheckIn)
    setCheckOut(newCheckOut)
  }

  function handleFormDateChange(newCheckIn: string, newCheckOut: string) {
    setCheckIn(newCheckIn)
    setCheckOut(newCheckOut)
  }

  function updateRentalField<K extends keyof typeof rentalForm>(key: K, value: (typeof rentalForm)[K]) {
    setRentalForm((prev) => ({ ...prev, [key]: value }))
  }

  function formatPhone(value: string) {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  function handleRentalSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!rentalForm.companyName.trim()) return setError('업체명/브랜드명을 입력해 주세요.')
    if (!rentalForm.contactName.trim()) return setError('담당자 성함을 입력해 주세요.')
    if (!rentalForm.contactEmail.trim()) return setError('담당자 이메일을 입력해 주세요.')
    if (!rentalForm.contactPhone.trim()) return setError('담당자 연락처를 입력해 주세요.')
    if (!rentalForm.rentalDate.trim()) return setError('희망 일시를 입력해 주세요.')

    startTransition(async () => {
      try {
        const response = await fetch('/api/rental', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...rentalForm,
            totalGuests: parseInt(rentalForm.totalGuests, 10),
          }),
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || '대관 신청 처리 중 서버에서 오류가 발생했습니다.')
        }

        setSuccess(true)
        setRentalForm({
          companyName: '',
          brandWebsite: '',
          purpose: purposeOptions[0],
          rentalDate: '',
          duration: '',
          totalGuests: '5',
          useSpace: spaceOptions[0],
          note: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : '대관 문의 접수 중 일시적인 오류가 발생했습니다.')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* 탭 버튼 영역 */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('partnership')}
          className={`pb-4 text-[15px] font-medium tracking-tight relative cursor-pointer pr-8 ${
            activeTab === 'partnership' ? 'text-[#1a1a1a] font-semibold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          임직원 제휴 예약
          {activeTab === 'partnership' && (
            <motion.div
              layoutId="activePartTabUnderline"
              className="absolute bottom-0 left-0 right-8 h-0.5 bg-[#1a1a1a]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('rental')}
          className={`pb-4 text-[15px] font-medium tracking-tight relative cursor-pointer pr-8 ${
            activeTab === 'rental' ? 'text-[#1a1a1a] font-semibold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          미디어 대관 문의
          {activeTab === 'rental' && (
            <motion.div
              layoutId="activePartTabUnderline"
              className="absolute bottom-0 left-0 right-8 h-0.5 bg-[#1a1a1a]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'partnership' ? (
          <motion.div
            key="partnership-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]"
          >
            <div className="space-y-6">
              {/* 혜택 카드 */}
              <div className="grid gap-3 md:grid-cols-3">
                {partnershipBenefits.map((benefit) => (
                  <div key={benefit.title} className="rounded-none border border-gray-200 bg-white p-5">
                    <h2 className="text-[15px] font-semibold text-[#1a1a1a]">{benefit.title}</h2>
                    <p className="mt-2 text-[13px] leading-relaxed text-gray-500">{benefit.copy}</p>
                  </div>
                ))}
              </div>

              {/* 캘린더 */}
              <LargeCalendarPicker
                checkIn={checkIn}
                checkOut={checkOut}
                onChange={handleCalendarChange}
                blockedDates={blockedDates}
                reservedRanges={reservedRanges}
                minBookableDateKey={getMinBookableDateKey(PARTNERSHIP_MIN_ADVANCE_DAYS)}
              />

              {/* 파트너사 */}
              <div className="rounded-none border border-gray-100 p-5 bg-white">
                <p className="text-[11px] tracking-[0.12em] text-gray-400">제휴 파트너사</p>
                <p className="mt-2 text-[14px] text-gray-500 leading-relaxed">
                  네오위즈, 이스트소프트 소속 임직원 고객님에게는 평일 30%, 주말/공휴일 20% (성수기 20% 고정)의 전용 우대 요금이 정교하게 자동 적용됩니다.
                  리포즈는 일상에서 잠시 벗어나 고요한 회복을 열어갈 파트너사 임직원 분들을 따뜻하게 맞이합니다.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="rounded-none border border-gray-200 px-4 py-2 text-[13px] font-bold tracking-wider text-[#1a1a1a]">NEOWIZ</span>
                  <span className="rounded-none border border-gray-200 px-4 py-2 text-[13px] font-bold tracking-wider text-[#1a1a1a]">ESTSOFT</span>
                  <span className="text-[12px] text-gray-300 font-light">+ 파트너십 확장 중</span>
                </div>
              </div>

              {/* 임직원 예약 주의사항 */}
              <div className="rounded-none border border-gray-100 bg-gray-50/50 p-5 text-[12px] leading-relaxed text-gray-500 space-y-1.5">
                <p className="font-semibold text-[13px] text-[#1a1a1a]">이용 조건 및 주의사항</p>
                <p>· 이용일 기준 <span className="font-semibold text-[#1a1a1a]">3주 전(21일 전)</span>부터 예약이 가능합니다.</p>
                <p>· 임직원 <span className="font-semibold text-[#1a1a1a]">본인이 반드시 투숙</span>하는 것을 원칙으로 합니다.</p>
                <p>· 임직원 본인이 동반하지 않거나 타인에게 양도한 것이 적발될 경우, 즉시 예약이 취소되며 환불이 불가합니다.</p>
                <p>· 예약 시 기업 전용 이메일로 신청해 주시면 할인 코드를 전송해 드립니다.</p>
              </div>
            </div>

            {/* 폼 */}
            <div className="xl:sticky xl:top-24 xl:self-start">
              <ReservationForm
                source="PARTNERSHIP"
                blockedDates={blockedDates}
                reservedRanges={reservedRanges}
                externalCheckIn={checkIn}
                externalCheckOut={checkOut}
                onDateChange={handleFormDateChange}
                showDatePicker={false}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="rental-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="grid gap-8 lg:grid-cols-[1fr_0.95fr]"
          >
            {/* 좌측: 대관 가이드라인 */}
            <div className="space-y-6 bg-white border border-gray-200 p-6 md:p-8">
              <div className="space-y-4">
                <p className="text-[11px] tracking-[0.15em] text-gray-400 uppercase">MEDIA RENTAL GUIDE</p>
                <h3 className="text-xl font-light tracking-tight text-[#1a1a1a] font-serif">상업적 미디어 대관 규정</h3>
                <div className="w-12 h-px bg-gray-300 my-4" />
              </div>

              <div className="space-y-6 text-[13px] leading-relaxed text-gray-600">
                {/* 1. 요율 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[#1a1a1a] text-[14px]">1. 대관 요율 및 시간 기준 (부가세 별도)</h4>
                  <ul className="space-y-1.5 list-disc list-inside pl-1 text-gray-500">
                    <li><span className="font-semibold text-[#1a1a1a]">시간제 대관 (최소 3시간 기준)</span>
                      <ul className="pl-4 list-none text-gray-500 mt-0.5 space-y-0.5">
                        <li>· 비수기 평일: 시간당 200,000원 | 비수기 주말: 시간당 250,000원</li>
                        <li>· 성수기 평일: 시간당 300,000원 | 성수기 주말: 시간당 380,000원</li>
                      </ul>
                    </li>
                    <li className="mt-1"><span className="font-semibold text-[#1a1a1a]">전일 대관 (투숙객 전용 서비스 제외)</span>
                      <ul className="pl-4 list-none text-gray-500 mt-0.5 space-y-0.5">
                        <li>· 봄/가을 비수기 평일: 1,200,000원</li>
                        <li>· 여름 성수기 평일: 1,425,000원</li>
                        <li>· 겨울 성수기 주말 (금·토): 2,055,000원</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                {/* 2. 인원 */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <h4 className="font-bold text-[#1a1a1a] text-[14px]">2. 인원 및 장비 제한 규정</h4>
                  <p className="text-gray-500 pl-1">
                    기본 대관 요금은 스태프 및 모델을 포함하여 <span className="font-semibold text-[#1a1a1a]">총 5인 기본</span>입니다. 초과 시 1인당 30,000원(시간제) 또는 50,000원(전일)의 추가 인원 비용이 정교하게 합산됩니다. 
                    시설 보호와 원활한 전력 공급을 위해 대형 조명 크레인, 스모그 머신(포그 머신), 탑차 등의 대형 장비 진입 시에는 반드시 사전에 상세히 협의하셔야 합니다.
                  </p>
                </div>

                {/* 3. 원상복구 */}
                <div className="space-y-2 border-t border-gray-100 pt-4 bg-gray-50/50 p-4 rounded-none">
                  <h4 className="font-bold text-red-700 text-[14px]">3. 원상복구 및 손해배상 의무 (필수 서약)</h4>
                  <p className="font-semibold text-[#1a1a1a]">원상복구 보증금: 300,000원</p>
                  <p className="text-gray-500 mt-1 italic text-[12px] leading-relaxed">
                    &ldquo;촬영을 위한 가구 및 소품의 이동은 사전 협의된 범위 내에서만 가능하며, 촬영 종료 직후 입실 전 상태로 완벽히 원상복구해야 합니다. 촬영 중 발생한 시설물, 가구, 식생(잔디 및 조경)의 파손, 오염, 스크래치에 대해서는 촬영 주체(브랜드 및 대행사)가 전액 실비로 손해배상할 책임이 있습니다.&rdquo;
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2">
                    * 보증금은 대관 퇴실 직후 시설물 안전 상태 점검에 이상이 없을 시 24시간 이내에 전액 신속히 환불됩니다.
                  </p>
                </div>

                {/* 4. 저작권 */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <h4 className="font-bold text-[#1a1a1a] text-[14px]">4. 브랜드 이미지 및 콘텐츠 사전 심의</h4>
                  <p className="text-gray-500 pl-1">
                    리포즈의 정갈한 명예를 수호하고 선정적이거나 유흥 목적의 콘텐츠에 노출되는 것을 사전에 방지하고자, 대관 확정 전 촬영 콘셉트 및 스토리보드를 정중히 심의·요청드리고 있습니다.
                  </p>
                </div>

                {/* 5. 취소환불 */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <h4 className="font-bold text-[#1a1a1a] text-[14px]">5. 대관 취소 및 환불 규정</h4>
                  <p className="text-gray-500 pl-1">
                    촬영 10일 전: 100% 전액 환불 | 촬영 7일 전: 50% 반환 | 촬영 3일 전 ~ 촬영 당일: 환불 및 취소 불가
                  </p>
                </div>
              </div>
            </div>

            {/* 우측: 대관 문의 접수 폼 */}
            <div className="bg-white border border-gray-200 p-6 md:p-8">
              {success ? (
                <div className="text-center py-12 space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1a1a]">
                    <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#1a1a1a]">대관 문의 접수 완료</h3>
                  <p className="text-[13px] text-gray-500 max-w-sm mx-auto leading-relaxed">
                    보내주신 미디어 대관 계획안이 정상적으로 접수되었습니다. 크리오스 미디어 전담 담당자가 제안 내용을 면밀히 검토한 후 24시간 이내에 기재해주신 연락처와 이메일로 긴밀히 소통드리겠습니다.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRentalSubmit} className="space-y-5">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-bold text-[#1a1a1a]">미디어 대관 신청서</h3>
                    <p className="text-[12px] text-gray-400 mt-1">상업적 촬영 목적의 일정을 접수하시면 담당자가 맞춤 소통을 진행합니다.</p>
                  </div>

                  <div className="space-y-4">
                    {/* 업체명 */}
                    <label className="block space-y-1">
                      <span className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">업체명 / 브랜드명 <span className="text-red-500">*</span></span>
                      <input
                        type="text"
                        value={rentalForm.companyName}
                        onChange={(e) => updateRentalField('companyName', e.target.value)}
                        placeholder="예: 크리오스 미디어 디자인"
                        required
                        className="h-10 w-full rounded-none border-b border-gray-200 bg-transparent px-0 pb-1 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                      />
                    </label>

                    {/* 웹사이트 */}
                    <label className="block space-y-1">
                      <span className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">사이트 / SNS URL</span>
                      <input
                        type="text"
                        value={rentalForm.brandWebsite}
                        onChange={(e) => updateRentalField('brandWebsite', e.target.value)}
                        placeholder="예: https://repause.co.kr"
                        className="h-10 w-full rounded-none border-b border-gray-200 bg-transparent px-0 pb-1 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                      />
                    </label>

                    {/* 촬영 목적 */}
                    <label className="block space-y-1">
                      <span className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">촬영 카테고리 <span className="text-red-500">*</span></span>
                      <select
                        value={rentalForm.purpose}
                        onChange={(e) => updateRentalField('purpose', e.target.value)}
                        className="h-10 w-full rounded-none border-b border-gray-200 bg-transparent px-0 pb-1 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                      >
                        {purposeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      {/* 희망 날짜 */}
                      <label className="block space-y-1">
                        <span className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">희망 날짜 <span className="text-red-500">*</span></span>
                        <input
                          type="date"
                          value={rentalForm.rentalDate}
                          onChange={(e) => updateRentalField('rentalDate', e.target.value)}
                          required
                          className="h-10 w-full rounded-none border-b border-gray-200 bg-transparent px-0 pb-1 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                        />
                      </label>

                      {/* 소요 시간 */}
                      <label className="block space-y-1">
                        <span className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">소요 시간</span>
                        <input
                          type="text"
                          value={rentalForm.duration}
                          onChange={(e) => updateRentalField('duration', e.target.value)}
                          placeholder="예: 5시간 / 전일 대관"
                          className="h-10 w-full rounded-none border-b border-gray-200 bg-transparent px-0 pb-1 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* 총 출입 인원 */}
                      <label className="block space-y-1">
                        <span className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">총 인원 (스태프 포함) <span className="text-red-500">*</span></span>
                        <input
                          type="number"
                          value={rentalForm.totalGuests}
                          onChange={(e) => updateRentalField('totalGuests', e.target.value)}
                          min="1"
                          max="50"
                          required
                          className="h-10 w-full rounded-none border-b border-gray-200 bg-transparent px-0 pb-1 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                        />
                        <p className="text-[10px] text-gray-400 leading-tight">기본 5인 포함, 초과 시 인당 추가 요금</p>
                      </label>

                      {/* 사용 희망 공간 */}
                      <label className="block space-y-1">
                        <span className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">사용 공간 선택 <span className="text-red-500">*</span></span>
                        <select
                          value={rentalForm.useSpace}
                          onChange={(e) => updateRentalField('useSpace', e.target.value)}
                          className="h-10 w-full rounded-none border-b border-gray-200 bg-transparent px-0 pb-1 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                        >
                          {spaceOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </label>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
                      <p className="text-[12px] font-semibold text-[#1a1a1a]">담당자 연락 정보</p>

                      <div className="grid grid-cols-3 gap-3">
                        {/* 성함 */}
                        <label className="block space-y-1">
                          <span className="text-[10px] font-bold text-gray-400">담당자 성함 <span className="text-red-500">*</span></span>
                          <input
                            type="text"
                            value={rentalForm.contactName}
                            onChange={(e) => updateRentalField('contactName', e.target.value)}
                            required
                            className="h-9 w-full rounded-none border-b border-gray-200 bg-transparent px-0 pb-1 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                          />
                        </label>

                        {/* 이메일 */}
                        <label className="block space-y-1 col-span-2">
                          <span className="text-[10px] font-bold text-gray-400">연락 이메일 <span className="text-red-500">*</span></span>
                          <input
                            type="email"
                            value={rentalForm.contactEmail}
                            onChange={(e) => updateRentalField('contactEmail', e.target.value)}
                            required
                            className="h-9 w-full rounded-none border-b border-gray-200 bg-transparent px-0 pb-1 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                          />
                        </label>
                      </div>

                      {/* 연락처 */}
                      <label className="block space-y-1">
                        <span className="text-[10px] font-bold text-gray-400">연락처 <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          value={rentalForm.contactPhone}
                          onChange={(e) => updateRentalField('contactPhone', formatPhone(e.target.value))}
                          placeholder="010-0000-0000"
                          required
                          className="h-9 w-full rounded-none border-b border-gray-200 bg-transparent px-0 pb-1 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                        />
                      </label>
                    </div>

                    {/* 요청 사항 */}
                    <label className="block space-y-1 mt-2">
                      <span className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">상세 촬영 콘셉트 및 요청사항</span>
                      <textarea
                        value={rentalForm.note}
                        onChange={(e) => updateRentalField('note', e.target.value)}
                        placeholder="촬영 주체, 세부 콘셉트, 탑차/조명 기기 반입 여부, 가구 이동 계획 등을 구체적으로 남겨 주세요."
                        className="min-h-16 w-full rounded-none border-b border-gray-200 bg-transparent px-0 py-1 text-[13px] focus:border-[#1a1a1a] focus:outline-none resize-none"
                      />
                    </label>
                  </div>

                  <div className="text-[11px] text-gray-400 bg-gray-50 p-3 leading-relaxed">
                    * 대관 문의가 최종 전송되면 상업적 대관 규정(원상복구 의무 및 보증금 30만원 사전 완납 등)에 상호 성실히 서약하고 동의한 것으로 간주됩니다.
                  </div>

                  {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}

                  <Button
                    type="submit"
                    size="lg"
                    className="h-11 w-full rounded-none bg-[#1a1a1a] text-[13px] font-semibold text-white hover:bg-[#333]"
                    disabled={isPending}
                  >
                    {isPending ? '대관 신청서 전송 중...' : '대관 문의 신청서 제출'}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
