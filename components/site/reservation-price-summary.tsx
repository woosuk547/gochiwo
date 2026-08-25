import {
  formatCurrency,
  paymentMethodLabel,
  type PaymentMethod,
  type ReservationSource,
} from '@/lib/booking'
import type { ReservationQuote } from '@/lib/repause-pricing'

interface ReservationPriceSummaryProps {
  source: ReservationSource
  paymentMethod: PaymentMethod
  benefitLabel: string
  quote: ReservationQuote | null
}

export function ReservationPriceSummary(props: ReservationPriceSummaryProps) {
  const corporateBilling = props.paymentMethod === 'CORPORATE_BILLING'

  return (
    <div className="mt-6 rounded-none border border-gray-200 bg-gray-50 p-5">
      <div className="border-b border-gray-200 pb-4">
        <p className="text-[12px] font-medium text-gray-500">예상 금액</p>
        <p className="mt-1 text-2xl font-bold text-[#1a1a1a]">
          {props.quote ? formatCurrency(props.quote.finalAmount) : '일정을 선택하면 계산돼요'}
        </p>
        <p className="mt-1 text-[13px] text-gray-500">
          {props.quote
            ? `${props.quote.nightsLabel} 기준. 최종 금액은 승인 후 확정돼요.`
            : '체크인/아웃, 인원을 선택하면 자동 계산돼요.'}
        </p>
      </div>

      <div className="mt-4 space-y-2.5 text-[14px]">
        {props.quote && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">객실 요금</span>
              <span className="text-[#1a1a1a]">{formatCurrency(props.quote.roomAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">추가 인원</span>
              <span className="text-[#1a1a1a]">{formatCurrency(props.quote.extraGuestAmount)}</span>
            </div>
            {props.quote.consecutiveDiscount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-normal">연박 할인</span>
                <span className="text-emerald-700">- {formatCurrency(props.quote.consecutiveDiscount)}</span>
              </div>
            )}
            {props.quote.partnerDiscount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-normal">제휴 할인</span>
                <span className="text-emerald-700">- {formatCurrency(props.quote.partnerDiscount)}</span>
              </div>
            )}
            {props.quote.discountAmount > 0 && props.quote.consecutiveDiscount === 0 && props.quote.partnerDiscount === 0 && (
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-normal">할인 적용</span>
                <span className="text-emerald-700">- {formatCurrency(props.quote.discountAmount)}</span>
              </div>
            )}
          </>
        )}
        <div className="flex items-center justify-between border-t border-gray-200 pt-2.5">
          <span className="text-gray-500">결제 방식</span>
          <span className="font-medium text-[#1a1a1a]">{paymentMethodLabel[props.paymentMethod]}</span>
        </div>
        {props.source === 'PARTNERSHIP' && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">제휴 구분</span>
            <span className="text-[#1a1a1a]">{props.benefitLabel || '선택 전'}</span>
          </div>
        )}
        {props.quote && (
          <div className="flex items-center justify-between font-medium">
            <span className="text-[#1a1a1a]">{corporateBilling ? '법인 정산' : '예약금 50%'}</span>
            <span className="text-[#1a1a1a]">{corporateBilling ? '승인 후 협의' : formatCurrency(props.quote.depositAmount)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
