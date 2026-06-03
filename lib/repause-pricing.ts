import { parseDateInput, type PaymentMethod, type ReservationSource } from '@/lib/booking'
import { getHoliday } from '@/lib/holidays'

const WEEKDAY_RATE = 680000
const WEEKEND_RATE = 780000
const PEAK_RATE = 950000
const EXTRA_GUEST_FEE = 40000
const BASE_GUESTS = 2

export interface ReservationQuoteInput {
  checkIn: string
  checkOut: string
  guests: number
  source: ReservationSource
  paymentMethod: PaymentMethod
  benefitLabel?: string
}

export interface ReservationQuote {
  nights: number
  roomAmount: number
  extraGuestAmount: number
  discountAmount: number
  partnerDiscount: number
  consecutiveDiscount: number
  finalAmount: number
  depositAmount: number
  nightsLabel: string
}

export const partnerBenefitOptions = [
  '제휴 임직원 전용 요금',
  'VIP 초청 · 기업 일정',
] as const

export function isPartnerBenefitLabel(value: string) {
  return partnerBenefitOptions.includes(value as (typeof partnerBenefitOptions)[number])
}

function isPeakSeason(date: Date) {
  const month = date.getUTCMonth() + 1 // 1-12
  const day = date.getUTCDate()
  
  // Summer peak: 7.15 ~ 8.24
  if (month === 7 && day >= 15) return true
  if (month === 8 && day <= 24) return true
  
  // Winter peak: 12.01 ~ 1.15 (12월 전체 및 1월 15일까지)
  if (month === 12) return true
  if (month === 1 && day <= 15) return true
  
  return false
}

function formatDateKey(date: Date) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isWeekendOrHoliday(date: Date) {
  const day = date.getUTCDay()
  if (day === 5 || day === 6) return true // 금, 토
  
  const dateKey = formatDateKey(date)
  return getHoliday(dateKey) !== null
}

function getNightlyRate(date: Date) {
  if (isPeakSeason(date)) {
    return PEAK_RATE
  }
  return isWeekendOrHoliday(date) ? WEEKEND_RATE : WEEKDAY_RATE
}

function getNights(checkIn: Date, checkOut: Date) {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)
}

export function calculateReservationQuote(input: ReservationQuoteInput): ReservationQuote | null {
  const checkIn = parseDateInput(input.checkIn)
  const checkOut = parseDateInput(input.checkOut)

  if (!checkIn || !checkOut || checkOut <= checkIn || input.guests < 1) {
    return null
  }

  const nights = getNights(checkIn, checkOut)
  let roomAmount = 0
  let partnerDiscount = 0
  const cursor = new Date(checkIn)

  const isPartnerEmp = input.source === 'PARTNERSHIP' && input.benefitLabel === partnerBenefitOptions[0]

  while (cursor < checkOut) {
    const nightlyRate = getNightlyRate(cursor)
    roomAmount += nightlyRate

    // 제휴 임직원 할인 조건: 평일 30%, 주말/공휴일 20%, 성수기 20%
    if (isPartnerEmp) {
      if (isPeakSeason(cursor)) {
        partnerDiscount += Math.round(nightlyRate * 0.20)
      } else if (isWeekendOrHoliday(cursor)) {
        partnerDiscount += Math.round(nightlyRate * 0.20)
      } else {
        partnerDiscount += Math.round(nightlyRate * 0.30)
      }
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  const extraGuestAmount = Math.max(0, input.guests - BASE_GUESTS) * EXTRA_GUEST_FEE * nights
  const subtotal = roomAmount + extraGuestAmount
  
  // 연박 할인: 2박 이상일 때 박당 20,000원 특별 할인 ("연박 할인 특별가")
  const consecutiveDiscount = nights >= 2 ? nights * 20000 : 0
  const discountAmount = partnerDiscount + consecutiveDiscount
  
  const finalAmount = Math.max(0, subtotal - discountAmount)
  const depositAmount =
    input.paymentMethod === 'CORPORATE_BILLING' ? 0 : Math.round(finalAmount / 2000) * 1000

  return {
    nights,
    roomAmount,
    extraGuestAmount,
    discountAmount,
    partnerDiscount,
    consecutiveDiscount,
    finalAmount,
    depositAmount,
    nightsLabel: `${nights}박 ${nights + 1}일`,
  }
}
