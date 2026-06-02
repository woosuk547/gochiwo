'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LargeCalendarPicker } from '@/components/site/large-calendar-picker'
import { ReservationForm } from '@/components/site/reservation-form'
import { MyReservationContent } from '@/app/my-reservation/my-reservation-content'
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
  const [activeTab, setActiveTab] = useState<'reserve' | 'lookup'>('reserve')
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
    <div className="space-y-6">
      {/* 탭 버튼 영역 */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('reserve')}
          className={`pb-4 text-[15px] font-medium tracking-tight relative cursor-pointer pr-8 ${
            activeTab === 'reserve' ? 'text-[#1a1a1a] font-semibold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          여정 예약 신청
          {activeTab === 'reserve' && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-8 h-0.5 bg-[#1a1a1a]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('lookup')}
          className={`pb-4 text-[15px] font-medium tracking-tight relative cursor-pointer pr-8 ${
            activeTab === 'lookup' ? 'text-[#1a1a1a] font-semibold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          예약 정보 조회
          {activeTab === 'lookup' && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-8 h-0.5 bg-[#1a1a1a]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'reserve' ? (
          <motion.div
            key="reserve-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="grid gap-6 xl:gap-8 xl:grid-cols-[1.05fr_0.95fr]"
          >
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
                    제휴사 임직원 예약 및 대관 문의는{' '}
                    <Link href="/partnership" className="font-medium text-gray-600 underline">제휴 / 대관 안내</Link>
                    에서 확인해 주시기 바랍니다.
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
          </motion.div>
        ) : (
          <motion.div
            key="lookup-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="max-w-xl mx-auto"
          >
            <MyReservationContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
