import { parseDateInput, type PaymentMethod, type ReservationSource } from '@/lib/booking'

const WEEKDAY_RATE = 680000
const WEEKEND_RATE = 780000
const PEAK_RATE = 950000
const EXTRA_GUEST_FEE = 40000
const BASE_GUESTS = 2
const PARTNER_MEMBER_DISCOUNT_RATE = 0.12

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
  '브랜드 촬영 · 답사',
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
  
  // Winter peak: 12.20 ~ 1.15
  if (month === 12 && day >= 20) return true
  if (month === 1 && day <= 15) return true
  
  return false
}

function getNightlyRate(date: Date) {
  if (isPeakSeason(date)) {
    return PEAK_RATE
  }
  const day = date.getUTCDay()
  return day === 5 || day === 6 ? WEEKEND_RATE : WEEKDAY_RATE
}

function getNights(checkIn: Date, checkOut: Date) {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)
}

function getDiscountRate(source: ReservationSource, benefitLabel?: string) {
  if (source !== 'PARTNERSHIP') return 0
  return benefitLabel === partnerBenefitOptions[0] ? PARTNER_MEMBER_DISCOUNT_RATE : 0
}

export function calculateReservationQuote(input: ReservationQuoteInput): ReservationQuote | null {
  const checkIn = parseDateInput(input.checkIn)
  const checkOut = parseDateInput(input.checkOut)

  if (!checkIn || !checkOut || checkOut <= checkIn || input.guests < 1) {
    return null
  }

  const nights = getNights(checkIn, checkOut)
  let roomAmount = 0
  const cursor = new Date(checkIn)

  while (cursor < checkOut) {
    roomAmount += getNightlyRate(cursor)
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  const extraGuestAmount = Math.max(0, input.guests - BASE_GUESTS) * EXTRA_GUEST_FEE * nights
  const subtotal = roomAmount + extraGuestAmount
  
  // 연박 할인: 2박 이상일 때 박당 50,000원 특별 할인
  const consecutiveDiscount = nights >= 2 ? nights * 50000 : 0
  const partnerDiscount = Math.round(subtotal * getDiscountRate(input.source, input.benefitLabel))
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
