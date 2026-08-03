'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  formatDateLabel,
  paymentMethodLabel,
  getMinBookableDateKey,
  isCheckInAllowedForSource,
  PARTNERSHIP_MIN_ADVANCE_DAYS,
  type PaymentMethod,
  type ReservationSource,
} from '@/lib/booking'
import { cancellationPolicy, contactInfo } from '@/lib/repause-content'
import {
  calculateReservationQuote,
  partnerBenefitOptions,
} from '@/lib/repause-pricing'
import { ReservationPriceSummary } from '@/components/site/reservation-price-summary'
import { DateRangePicker } from '@/components/site/date-range-picker'

interface ReservationFormProps {
  source: ReservationSource
  blockedDates?: string[]
  reservedRanges?: Array<{ checkIn: string; checkOut: string }>
  externalCheckIn?: string
  externalCheckOut?: string
  onDateChange?: (checkIn: string, checkOut: string) => void
  showDatePicker?: boolean
}

interface SubmittedSummary {
  paymentMethod: PaymentMethod
  benefitLabel: string
  finalAmount: number
  depositAmount: number
}

const arrivalOptions = ['18:00 이전', '18:00 - 20:00', '20:00 이후', '별도 조율']
const guestOptions = ['2', '4']
const directPaymentMethods: PaymentMethod[] = ['CARD', 'BANK_TRANSFER']
const partnershipPaymentMethods: PaymentMethod[] = ['CARD', 'BANK_TRANSFER', 'CORPORATE_BILLING']

interface AgreementItem {
  id: string
  title: string
  content: string
  hasTable?: boolean
  href?: string
  hrefLabel?: string
}

const agreements: AgreementItem[] = [
  {
    id: 'terms',
    title: '이용약관 동의',
    content: '예약·결제·취소·환불에 관한 이용약관에 동의합니다. 상세 내용은 이용약관 페이지에서 확인할 수 있습니다.',
    href: '/terms',
    hrefLabel: '이용약관 보기',
  },
  {
    id: 'privacy',
    title: '개인정보 수집·이용 동의',
    content: `예약 처리, 결제·환불, 고객 응대를 위해 예약자명·이메일·연락처·일정·인원 등 개인정보를 수집·이용합니다. 보유 기간·처리위탁(토스페이먼츠 등)은 개인정보처리방침을 따릅니다. 문의: ${contactInfo.email}`,
    href: '/privacy',
    hrefLabel: '개인정보처리방침 보기',
  },
  {
    id: 'refund',
    title: '취소 및 환불 규정에 대한 동의',
    content: '리포즈(RE:PAUSE)는 하루에 단 한 팀만을 위한 프라이빗 스테이로, 예약 확정 후 취소 시점에 따라 위약금이 발생합니다. 올바른 예약 문화와 완벽한 객실 준비를 위한 규정이오니 신중한 예약을 부탁드립니다.',
    hasTable: true,
  },
  {
    id: 'rules',
    title: '공간 이용 및 안전 수칙 동의',
    content: `온전한 휴식과 안전을 위해 아래 핵심 공간 이용 수칙을 반드시 준수해 주셔야 합니다.

1. 예약 정원 준수 및 외부인 출입 제한
예약된 인원 외의 추가 인원 입실 및 외부인 초대를 엄격히 금지합니다. 당일 무단 추가 발견 시 즉시 퇴실 조치(환불 불가)됩니다.

2. 무단 양도 및 전매 금지
중고 거래 플랫폼 등을 통한 무단 양도 및 전매는 불가합니다. 가족/지인 양도의 경우 투숙 3일 전까지 고객센터 사전 승인을 받아야 합니다.

3. 공간 케어 및 기물 파손 배상
프리미엄 가구, 가전 및 큐레이션 오브제의 파손, 오염, 분실 발생 시 공식 소비자 가액 기준으로 원상복구(배상) 비용이 청구됩니다.

4. 실내 절대 금연 및 화기 사용 금지
실내 전 구역 절대 금연(전자담배 포함)이며, 적발 시 특수 청소비 30만 원과 즉시 퇴실 조치가 적용됩니다. 개인 화기(버너, 불멍, 폭죽 등) 반입 및 연기 나는 조리는 엄격히 제한됩니다.

5. 미성년자 단독 투숙 불가
보호자 동반 없는 미성년자(만 19세 미만)의 단독 투숙 또는 미성년자 간의 혼숙이 적발될 경우 예약 취소 및 즉시 퇴실 조치됩니다.

6. 건물 외부 CCTV 설치 및 녹화
투숙객의 안전, 차량 보안, 화재 및 범죄 예방을 위해 건물 외부(대문, 현관, 마당 등)에 24시간 CCTV를 운영합니다. 객실 내부에는 절대 설치되어 있지 않습니다.

7. 수영장 및 자쿠지 이용 수칙
개인용 입욕제(가루, 거품, 꽃잎, 오일 등) 사용을 엄격히 금지하며, 위반 시 여과기 수리 및 영업 손실 비용이 청구됩니다. 음주 후 입수 금지 및 미끄러짐 등 개인 부주의 안전사고는 면책됩니다.

8. 상업 촬영 금지
사전 협의 없는 쇼핑몰, 마켓, 유튜브, 광고 등 상업적 목적의 촬영 및 대관은 절대 불가하며 적발 시 즉시 퇴실 또는 위약금이 청구됩니다.`,
  },
]

function SelectArrow() {
  return (
    <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-400">
      <svg width="10" height="6" viewBox="0 0 12 7" fill="none" aria-hidden="true">
        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function FormInput({ value, onChange, type = "text", placeholder, required = false, id, error }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; required?: boolean; id?: string; error?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="w-full">
      <div className="relative w-full">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
          className={`h-11 w-full rounded-none border-t-0 border-x-0 border-b bg-transparent px-0 pb-1.5 text-[14px] text-[#1a1a1a] placeholder:text-gray-300 focus:border-[#1a1a1a] focus:outline-none transition-all duration-300 ${error ? 'border-red-400' : 'border-gray-200'}`}
        />
        <motion.div
          className="absolute bottom-0 left-0 h-[1.5px] bg-[#1a1a1a]"
          initial={{ width: '0%' }}
          animate={{ width: focused ? '100%' : '0%' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      {error && (
        <p id={id ? `${id}-error` : undefined} className="mt-1.5 text-[12px] text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

function FormSelect({ value, onChange, children, required = false }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; required?: boolean }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="h-11 w-full rounded-none border-t-0 border-x-0 border-b border-gray-200 bg-transparent px-0 pb-1.5 text-[14px] text-[#1a1a1a] appearance-none focus:outline-none focus:border-[#1a1a1a] transition-all duration-300 cursor-pointer"
      >
        {children}
      </select>
      <SelectArrow />
      <motion.div
        className="absolute bottom-0 left-0 h-[1.5px] bg-[#1a1a1a]"
        initial={{ width: '0%' }}
        animate={{ width: focused ? '100%' : '0%' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

function FormTextarea({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="relative w-full">
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="min-h-24 w-full rounded-none border-t-0 border-x-0 border-b border-gray-200 bg-transparent px-0 py-2.5 text-[14px] text-[#1a1a1a] placeholder:text-gray-300 focus:border-[#1a1a1a] focus:outline-none transition-all duration-300 resize-none"
      />
      <motion.div
        className="absolute bottom-0 left-0 h-[1.5px] bg-[#1a1a1a]"
        initial={{ width: '0%' }}
        animate={{ width: focused ? '100%' : '0%' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

export function ReservationForm({ source, blockedDates = [], reservedRanges = [], externalCheckIn, externalCheckOut, onDateChange, showDatePicker = true }: ReservationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submittedSummary, setSubmittedSummary] = useState<SubmittedSummary | null>(null)

  const [agreedItems, setAgreedItems] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(agreements.map((item) => [item.id, false])),
  )

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(agreements.map((item) => [item.id, false])),
  )

  const allAgreed = agreements.every((item) => agreedItems[item.id])

  const handleAllAgreeChange = (checked: boolean) => {
    setAgreedItems(Object.fromEntries(agreements.map((item) => [item.id, checked])))
  }

  const handleItemAgreeChange = (id: string, checked: boolean) => {
    setAgreedItems((prev) => ({ ...prev, [id]: checked }))
  }

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const [form, setForm] = useState({
    guestName: '',
    companyName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: '4',
    arrivalTime: '18:00 이전',
    benefitLabel: source === 'PARTNERSHIP' ? partnerBenefitOptions[0] : '',
    paymentMethod: 'CARD' as PaymentMethod,
    note: '',
  })

  const minBookableDateKey =
    source === 'PARTNERSHIP' ? getMinBookableDateKey(PARTNERSHIP_MIN_ADVANCE_DAYS) : undefined

  useEffect(() => {
    if (externalCheckIn !== undefined && externalCheckIn !== form.checkIn) {
      setForm((prev) => ({ ...prev, checkIn: externalCheckIn }))
    }
    if (externalCheckOut !== undefined && externalCheckOut !== form.checkOut) {
      setForm((prev) => ({ ...prev, checkOut: externalCheckOut }))
    }
  }, [externalCheckIn, externalCheckOut])

  const paymentMethods = source === 'PARTNERSHIP' ? partnershipPaymentMethods : directPaymentMethods
  const quote = calculateReservationQuote({
    checkIn: form.checkIn,
    checkOut: form.checkOut,
    guests: Number(form.guests),
    source,
    paymentMethod: form.paymentMethod,
    benefitLabel: form.benefitLabel,
  })

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function formatPhone(value: string) {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  function handlePhoneChange(value: string) {
    updateField('phone', formatPhone(value))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccess(false)
    setError('')

    // 필드별 유효성 검증
    const errors: Record<string, string> = {}

    if (!form.guestName.trim()) {
      errors.guestName = '예약자 성함을 입력해 주세요.'
    }

    if (!form.checkIn || !form.checkOut) {
      errors.dates = '체크인/아웃 날짜를 선택해 주세요.'
    } else if (!isCheckInAllowedForSource(form.checkIn, source)) {
      errors.dates = '제휴 예약은 이용일 기준 3주 전(21일 전)부터 가능합니다.'
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(form.email.trim())) {
      errors.email = '올바른 이메일 주소를 입력해 주세요.'
    } else if (source === 'PARTNERSHIP' && form.benefitLabel === partnerBenefitOptions[0]) {
      // 제휴기업 임직원 이메일 도메인 검증
      const emailDomain = form.email.trim().toLowerCase().split('@')[1]
      if (emailDomain !== 'neowiz.com' && emailDomain !== 'estsoft.com') {
        errors.email = '제휴 임직원 전용 요금은 회사 전용 이메일(@neowiz.com 또는 @estsoft.com)로만 신청하실 수 있습니다.'
      }
    }

    const phoneDigits = form.phone.replace(/[^0-9]/g, '')
    if (!/^01[016789]\d{7,8}$/.test(phoneDigits)) {
      errors.phone = '올바른 전화번호를 입력해 주세요.'
    }

    if (source === 'PARTNERSHIP' && !form.companyName.trim()) {
      errors.companyName = '회사명 또는 제휴사명을 입력해 주세요.'
    }

    if (!allAgreed) {
      errors.agreements = '모든 필수 예약 약관에 동의해 주세요.'
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setError('입력 내용을 다시 확인해 주세요.')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, source }),
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || '일정 확인 및 접수 처리 과정에 예기치 못한 오류가 발생했습니다.')
        }

        if (form.paymentMethod === 'CARD' || form.paymentMethod === 'BANK_TRANSFER') {
          router.push(`/payment/${result.id}?email=${encodeURIComponent(form.email.trim().toLowerCase())}`)
          return
        }

        setSubmittedSummary(
          quote ? { paymentMethod: form.paymentMethod, benefitLabel: form.benefitLabel, finalAmount: quote.finalAmount, depositAmount: quote.depositAmount } : null,
        )
        setForm({ guestName: '', companyName: '', email: '', phone: '', checkIn: '', checkOut: '', guests: '4', arrivalTime: '18:00 이전', benefitLabel: source === 'PARTNERSHIP' ? partnerBenefitOptions[0] : '', paymentMethod: 'CARD', note: '' })
        setSuccess(true)
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : '예약 접수 과정에 일시적인 정체가 발생했습니다.')
      }
    })
  }

  if (success) {
    return (
      <div className="rounded-none border border-gray-200 bg-white p-6 md:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1a1a]">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-[#1a1a1a]">여정 신청 완료</h2>
          <p className="mt-2 text-[14px] text-gray-500">
            고객님의 독립된 여정이 안전하게 승인되도록 세심히 검토한 뒤, 24시간 이내에 최종 결제 가이드를 메일로 차분히 전달해 드리겠습니다.
          </p>
        </div>
        {submittedSummary && (
          <div className="mt-6 rounded-none bg-gray-50 p-4 text-[14px] text-gray-600 space-y-1">
            <p>결제 방식: {paymentMethodLabel[submittedSummary.paymentMethod]}</p>
            {source === 'PARTNERSHIP' && <p>제휴 구분: {submittedSummary.benefitLabel}</p>}
            <p>예상 금액: {submittedSummary.finalAmount.toLocaleString('ko-KR')}원</p>
            <p>{submittedSummary.paymentMethod === 'CORPORATE_BILLING' ? '법인 정산 계약건은 전담 크루가 개별적으로 정교하게 소통해 드립니다.' : `예약금: ${submittedSummary.depositAmount.toLocaleString('ko-KR')}원`}</p>
          </div>
        )}
        <div className="mt-6 rounded-none bg-gray-50 p-4 text-[13px] text-gray-500 space-y-1">
          <p>만약 승인 가이드 메일이 확인되지 않을 경우, 개인 우편함의 유입 정화 필터를 조심히 살펴보시기 바랍니다.</p>
          <p>문의: {contactInfo.email}</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-none border border-gray-200 bg-white p-5 md:p-7">
      {/* 헤더 */}
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-[17px] font-semibold tracking-[-0.03em] text-[#1a1a1a]">
          {source === 'PARTNERSHIP' ? '제휴 파트너십 여정 신청' : '온전한 안식을 위한 여정 신청'}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed tracking-tight text-gray-500">
          {source === 'PARTNERSHIP'
            ? '제휴사 임직원 우대 혜택, 촬영 대관, 기업 일정을 정교하게 맞춰 드립니다.'
            : '머무실 일정과 결제 수단을 가만히 남겨 주시면, 안락한 여정의 여백을 정성스레 준비해 드립니다.'}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-none border border-gray-100 bg-gray-50/50 px-3 py-2">
            <p className="text-[12px] font-semibold tracking-wide text-gray-400">기본 요금</p>
            <p className="mt-0.5 text-[12px] font-semibold tracking-tight text-[#1a1a1a]">680,000원~/박</p>
          </div>
          <div className="rounded-none border border-gray-100 bg-gray-50/50 px-3 py-2">
            <p className="text-[12px] font-semibold tracking-wide text-gray-400">예약 확정</p>
            <p className="mt-0.5 text-[12px] font-semibold tracking-tight text-[#1a1a1a]">결제 즉시 확정</p>
          </div>
          <div className="rounded-none border border-gray-100 bg-gray-50/50 px-3 py-2">
            <p className="text-[12px] font-semibold tracking-wide text-gray-400">신청 방식</p>
            <p className="mt-0.5 text-[12px] font-semibold tracking-tight text-[#1a1a1a]">개별 일정 조율</p>
          </div>
        </div>
      </div>

      {/* 폼 필드 */}
      <div className="mt-8 flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-gray-400">예약자 성함 <span className="text-gray-300 font-light text-[12px] ml-0.5">*</span></span>
          <FormInput id="rsv-guest-name" value={form.guestName} onChange={(e) => updateField('guestName', e.target.value)} required error={fieldErrors.guestName} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-gray-400">이메일 주소 <span className="text-gray-300 font-light text-[12px] ml-0.5">*</span></span>
          <FormInput id="rsv-email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required error={fieldErrors.email} />
          {source === 'PARTNERSHIP' && form.benefitLabel === partnerBenefitOptions[0] && (
            <p className="text-[11px] text-gray-400 leading-relaxed">
              * 평일 30%, 주말/공휴일 20%의 전용 우대 요금이 자동 적용됩니다. 회사 이메일(@neowiz.com 또는 @estsoft.com)로만 신청할 수 있어요.
            </p>
          )}
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-gray-400">연락처 <span className="text-gray-300 font-light text-[12px] ml-0.5">*</span></span>
          <FormInput id="rsv-phone" value={form.phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="010-0000-0000" required error={fieldErrors.phone} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-gray-400">머무실 인원 <span className="text-gray-300 font-light text-[12px] ml-0.5">*</span></span>
          <FormSelect value={form.guests} onChange={(e) => updateField('guests', e.target.value)} required>
            {guestOptions.map((opt) => <option key={opt} value={opt}>{opt}명</option>)}
          </FormSelect>
        </label>

        {source === 'PARTNERSHIP' && (
          <>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold tracking-wider text-gray-400">회사명 · 제휴사명 <span className="text-gray-300 font-light text-[12px] ml-0.5">*</span></span>
              <FormInput id="rsv-company" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} placeholder="예: 네오위즈 복지지원팀" required error={fieldErrors.companyName} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold tracking-wider text-gray-400">제휴 우대 구분 <span className="text-gray-300 font-light text-[12px] ml-0.5">*</span></span>
              <FormSelect value={form.benefitLabel} onChange={(e) => updateField('benefitLabel', e.target.value)} required>
                {partnerBenefitOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </FormSelect>
            </label>
          </>
        )}

        <div>
          <span className="text-[11px] font-semibold tracking-wider text-gray-400">체크인 · 체크아웃 <span className="text-gray-300 font-light text-[12px] ml-0.5">*</span></span>
          <div className="mt-2">
            {showDatePicker ? (
              <DateRangePicker
                checkIn={form.checkIn}
                checkOut={form.checkOut}
                onChange={(start, end) => { updateField('checkIn', start); updateField('checkOut', end); onDateChange?.(start, end) }}
                blockedDates={blockedDates}
                reservedRanges={reservedRanges}
                minBookableDateKey={minBookableDateKey}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-none border-b border-gray-200 bg-transparent px-0 pb-1.5 pt-1 text-left">
                  <span className="block text-[11px] font-semibold tracking-wider text-gray-400">입실 일정</span>
                  <span className={`mt-1.5 block text-[14px] font-medium ${form.checkIn ? 'text-[#1a1a1a]' : 'text-gray-400'}`}>
                    {form.checkIn ? formatDateLabel(form.checkIn) : '캘린더 날짜 선택 대기'}
                  </span>
                </div>
                <div className="rounded-none border-b border-gray-200 bg-transparent px-0 pb-1.5 pt-1 text-left">
                  <span className="block text-[11px] font-semibold tracking-wider text-gray-400">퇴실 일정</span>
                  <span className={`mt-1.5 block text-[14px] font-medium ${form.checkOut ? 'text-[#1a1a1a]' : 'text-gray-400'}`}>
                    {form.checkOut ? formatDateLabel(form.checkOut) : '캘린더 날짜 선택 대기'}
                  </span>
                </div>
              </div>
            )}
          </div>
          {fieldErrors.dates && <p className="mt-1.5 text-[12px] text-red-500">{fieldErrors.dates}</p>}
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-gray-400">도착 예정 시간</span>
          <FormSelect value={form.arrivalTime} onChange={(e) => updateField('arrivalTime', e.target.value)}>
            {arrivalOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </FormSelect>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-gray-400">결제 수단 <span className="text-gray-300 font-light text-[12px] ml-0.5">*</span></span>
          <FormSelect value={form.paymentMethod} onChange={(e) => updateField('paymentMethod', e.target.value as PaymentMethod)} required>
            {paymentMethods.map((m) => <option key={m} value={m}>{paymentMethodLabel[m]}</option>)}
          </FormSelect>
        </label>
      </div>

      <ReservationPriceSummary source={source} paymentMethod={form.paymentMethod} benefitLabel={form.benefitLabel} quote={quote} />

      {/* 제출 전 금액 요약 strip */}
      {quote && form.paymentMethod !== 'CORPORATE_BILLING' && (
        <div className="mt-4 flex items-center justify-between rounded-none border border-[#1a1a1a]/10 bg-[#1a1a1a]/5 px-4 py-3">
          <div className="text-[13px] text-gray-600">
            <span className="font-medium text-[#1a1a1a]">{quote.nights}박</span>
            {quote.extraGuestAmount > 0 && <span> · 추가 인원</span>}
            {quote.discountAmount > 0 && <span className="text-emerald-700"> · 할인 적용</span>}
          </div>
          <div className="text-right">
            <p className="text-[15px] font-bold text-[#1a1a1a]">{quote.finalAmount.toLocaleString('ko-KR')}원</p>
            <p className="text-[12px] text-gray-500">예약금 {quote.depositAmount.toLocaleString('ko-KR')}원</p>
          </div>
        </div>
      )}

      <label className="mt-5 flex flex-col gap-2">
        <span className="text-[11px] font-semibold tracking-wider text-gray-400">요청 사항 <span className="text-gray-300 font-light text-[12px] ml-0.5">(선택)</span></span>
        <FormTextarea value={form.note} onChange={(e) => updateField('note', e.target.value)} placeholder="기념일, 인원 구성, 촬영 목적 등" />
      </label>

      {/* 약관 동의 영역 */}
      <div className="mt-6 border-t border-gray-100 pt-6">
        <h3 className="text-[14px] font-bold text-[#1a1a1a] tracking-tight">예약 약관 동의</h3>
        
        {/* 전체 동의 */}
        <div className="mt-4 flex items-center justify-between rounded-none border border-gray-100 bg-gray-50/50 px-4 py-3.5">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={allAgreed}
              onChange={(e) => handleAllAgreeChange(e.target.checked)}
              className="h-4 w-4 rounded-none border-gray-300 text-[#1a1a1a] focus:ring-[#1a1a1a]"
            />
            <span className="text-[14px] font-bold text-[#1a1a1a] tracking-tight">모든 필수 약관에 동의합니다</span>
          </label>
        </div>

        {/* 개별 약관 목록 */}
        <div className="mt-3 divide-y divide-gray-50 border-y border-gray-100">
          {agreements.map((item) => (
            <div key={item.id} className="py-3">
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={agreedItems[item.id] || false}
                    onChange={(e) => handleItemAgreeChange(item.id, e.target.checked)}
                    className="h-4 w-4 rounded-none border-gray-300 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                  />
                  <span className="text-[13px] font-medium text-gray-700 tracking-tight">
                    <span className="text-red-500 font-semibold mr-1">[필수]</span>
                    {item.title}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="text-[12px] text-gray-400 hover:text-gray-600 font-medium transition-colors cursor-pointer"
                >
                  {expandedItems[item.id] ? '접기' : '자세히 보기'}
                </button>
              </div>

              {/* 아코디언 상세 내용 */}
              <AnimatePresence initial={false}>
                {expandedItems[item.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-none bg-gray-50/75 p-4 text-[13px] leading-relaxed text-gray-500 whitespace-pre-line tracking-tight">
                      {item.content}
                      {item.href && (
                        <p className="mt-3">
                          <Link href={item.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#1a1a1a]">
                            {item.hrefLabel ?? '자세히 보기'}
                          </Link>
                        </p>
                      )}

                      {item.hasTable && (
                        <>
                          <div className="mt-4 overflow-x-auto rounded-none border border-gray-200">
                            <table className="w-full border-collapse bg-white text-left text-[12px]">
                              <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 font-medium text-gray-500">
                                  <th className="px-3 py-2.5">취소 및 변경 요청일</th>
                                  <th className="px-3 py-2.5">비수기</th>
                                  <th className="px-3 py-2.5">성수기</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-gray-600">
                                {cancellationPolicy.tableRows.map((row) => (
                                  <tr key={row.daysLabel}>
                                    <td className="px-3 py-2 font-medium">{row.daysLabel}</td>
                                    <td className={`px-3 py-2 ${row.offpeak.includes('100%') ? 'font-semibold text-emerald-700' : ''} ${row.offpeak.includes('불가') ? 'bg-red-50/10 font-semibold text-red-600' : ''}`}>
                                      {row.offpeak}
                                    </td>
                                    <td className={`px-3 py-2 ${row.peak.includes('100%') ? 'font-semibold text-emerald-700' : ''} ${row.peak.includes('불가') ? 'bg-red-50/10 font-semibold text-red-600' : ''}`}>
                                      {row.peak}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-3 space-y-0.5 text-[11px] leading-relaxed text-gray-400">
                            {cancellationPolicy.peakSeasons.map((season) => (
                              <p key={season}>* {season}</p>
                            ))}
                            <p className="mt-1 font-medium text-gray-500">참고: 당일 예약 후 당일 취소하더라도 이용일이 당일이거나 &lsquo;환불 불가 기간&rsquo;에 해당될 경우 환불이 불가합니다.</p>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        {fieldErrors.agreements && <p className="mt-2 text-[12px] text-red-500">{fieldErrors.agreements}</p>}
      </div>

      <div className="mt-4 rounded-none bg-gray-50 px-4 py-3 text-[13px] text-gray-500">
        {form.paymentMethod === 'CORPORATE_BILLING'
          ? '법인 일괄 정산은 여정 최종 승인 후 기합의된 법인 수납 프로세스 또는 세금계산서 발행에 따라 정교하게 조율됩니다.'
          : '여정 신청이 완료되면 바로 결제 페이지로 유연하게 인계되며, 대금 수납 처리가 마감되는 즉시 안식이 확정됩니다.'}
      </div>

      {error && <p role="alert" className="mt-3 text-[14px] text-red-500">{error}</p>}

      <Button
        type="submit"
        size="lg"
        className="mt-5 h-12 w-full rounded-none bg-[#1a1a1a] text-[15px] font-semibold text-white hover:bg-[#333]"
        disabled={isPending}
      >
        {isPending ? '처리 중...' : form.paymentMethod === 'CORPORATE_BILLING' ? '제휴 예약 신청' : '여정 예약 신청 및 결제'}
      </Button>
    </form>
  )
}
