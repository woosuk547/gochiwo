'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LargeCalendarPicker } from '@/components/site/large-calendar-picker'
import { ReservationForm } from '@/components/site/reservation-form'
import {
  primaryStay,
  propertyFacts,
  reservationNotes,
  staySnapshot,
} from '@/lib/repause-content'

interface ReservationContentProps {
  blockedDates: string[]
  reservedRanges: Array<{ checkIn: string; checkOut: string }>
}

export function ReservationContent({ blockedDates, reservedRanges }: ReservationContentProps) {
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
    <div className="grid gap-6 xl:gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-5 md:space-y-6">
        {/* 숙소 요약 */}
        <div className="rounded-none border border-gray-200 bg-white p-4 md:p-5">
          <div className="relative aspect-[16/9] overflow-hidden rounded-none">
            <Image src="/repause/room-outdoor.jpg" alt="리포즈 데크" fill className="object-cover" />
          </div>
          <div className="mt-3 md:mt-4">
            <h2 className="text-lg font-bold text-[#1a1a1a] md:text-xl">포레스트 하우스</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-500 md:text-[14px]">{primaryStay.description}</p>
            <p className="mt-2 text-[12px] text-gray-400 md:text-[13px]">
              제휴 예약은{' '}
              <Link href="/partnership" className="font-medium text-gray-600 underline">여기</Link>
              에서 접수하세요.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 md:mt-4">
              {staySnapshot.map((item) => (
                <div key={item.label} className="rounded-none bg-gray-50 px-3 py-2">
                  <p className="text-[11px] font-medium text-gray-400">{item.label}</p>
                  <p className="mt-0.5 text-[12px] font-semibold text-[#1a1a1a] md:text-[13px]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 캘린더 */}
        <LargeCalendarPicker
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={handleCalendarChange}
          blockedDates={blockedDates}
          reservedRanges={reservedRanges}
        />

        {/* 예약 안내 + 포함사항 — 심플 리스트 */}
        <details className="group rounded-none border border-gray-100">
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-[13px] font-medium text-gray-500 hover:text-[#1a1a1a]">
            예약 안내 · 포함 사항
            <span className="text-gray-300 transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="border-t border-gray-100 px-4 pb-4 pt-3">
            <div className="space-y-2">
              {reservationNotes.map((note) => (
                <div key={note.title} className="flex items-start gap-2 text-[13px]">
                  <span className="mt-1.5 h-px w-3 shrink-0 bg-gray-300" />
                  <span className="text-gray-600"><span className="font-medium text-[#1a1a1a]">{note.title}</span> — {note.description}</span>
                </div>
              ))}
              <div className="my-2 border-t border-gray-100" />
              {propertyFacts.map((fact) => (
                <div key={fact.label} className="flex items-start gap-2 text-[13px]">
                  <span className="mt-1.5 h-px w-3 shrink-0 bg-gray-300" />
                  <span className="text-gray-600"><span className="font-medium text-[#1a1a1a]">{fact.label}</span> — {fact.value}</span>
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>

      {/* 예약 폼 */}
      <div className="xl:sticky xl:top-24 xl:self-start">
        <ReservationForm
          source="DIRECT"
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
