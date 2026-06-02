'use client'

import { useState } from 'react'
import { LargeCalendarPicker } from '@/components/site/large-calendar-picker'
import { ReservationForm } from '@/components/site/reservation-form'
import { partnershipBenefits } from '@/lib/repause-content'

interface PartnershipContentProps {
  blockedDates: string[]
  reservedRanges: Array<{ checkIn: string; checkOut: string }>
}

export function PartnershipContent({ blockedDates, reservedRanges }: PartnershipContentProps) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  function handleCalendarChange(newCheckIn: string, newCheckOut: string) {
    setCheckIn(newCheckIn)
    setCheckOut(newCheckOut)
  }

  function handleFormDateChange(newCheckIn: string, newCheckOut: string) {
    setCheckIn(newCheckIn)
    setCheckOut(newCheckOut)
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
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
        />

        {/* 파트너사 */}
        <div className="rounded-none border border-gray-100 p-5">
          <p className="text-[11px] tracking-[0.12em] text-gray-400">제휴 파트너사</p>
          <p className="mt-2 text-[14px] text-gray-500 leading-relaxed">
            제휴 파트너사 등록 임직원 고객님에게는 12%의 프라이빗 우대 요금이 적용됩니다.
            리포즈는 철학과 결이 맞는 기업과의 파트너십 제휴를 차분하게 이어가고 있습니다.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="rounded-none border border-gray-200 px-4 py-2 text-[15px] font-semibold tracking-wider text-[#1a1a1a]">DYSON</span>
            <span className="rounded-none border border-gray-200 px-4 py-2 text-[14px] font-semibold tracking-wider text-[#1a1a1a]">O-LENS</span>
            <span className="text-[12px] text-gray-300 font-light">+ 파트너십 확장 중</span>
          </div>
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
    </div>
  )
}
