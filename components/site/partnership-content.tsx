'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LargeCalendarPicker } from '@/components/site/large-calendar-picker'
import { ReservationForm } from '@/components/site/reservation-form'
import { partnershipBenefits, contactInfo } from '@/lib/repause-content'
import { getMinBookableDateKey, PARTNERSHIP_MIN_ADVANCE_DAYS } from '@/lib/booking'

interface PartnershipContentProps {
  blockedDates: string[]
  reservedRanges: Array<{ checkIn: string; checkOut: string }>
}

const kakaoChannelUrl = 'https://pf.kakao.com/_repause'

export function PartnershipContent({ blockedDates, reservedRanges }: PartnershipContentProps) {
  const [activeTab, setActiveTab] = useState<'partnership' | 'rental'>('partnership')
  const [rentalMode, setRentalMode] = useState<'media' | 'workation'>('media')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  const formRef = useRef<HTMLDivElement>(null)

  function handleCalendarChange(newCheckIn: string, newCheckOut: string) {
    setCheckIn(newCheckIn)
    setCheckOut(newCheckOut)

    // 모바일(1열 레이아웃)에서 날짜 선택이 완료되면 폼으로 시선을 이어준다
    if (newCheckIn && newCheckOut && typeof window !== 'undefined' && window.innerWidth < 1280) {
      requestAnimationFrame(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  function handleFormDateChange(newCheckIn: string, newCheckOut: string) {
    setCheckIn(newCheckIn)
    setCheckOut(newCheckOut)
  }

  return (
    <div className="space-y-6">
      {/* 탭 버튼 영역 */}
      <div className="flex border-b border-gray-100" role="tablist" aria-label="제휴 메뉴">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'partnership'}
          onClick={() => setActiveTab('partnership')}
          className={`min-h-[44px] pb-3 pt-1 text-[15px] font-medium tracking-tight relative cursor-pointer pr-8 ${
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
          type="button"
          role="tab"
          aria-selected={activeTab === 'rental'}
          onClick={() => setActiveTab('rental')}
          className={`min-h-[44px] pb-3 pt-1 text-[15px] font-medium tracking-tight relative cursor-pointer pr-8 ${
            activeTab === 'rental' ? 'text-[#1a1a1a] font-semibold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          미디어 대관 · 워케이션 문의
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
                <p className="text-[11px] tracking-[0.12em] text-gray-400">제휴 협력사</p>
                <p className="mt-2 text-[14px] text-gray-500 leading-relaxed">
                  협력사 소속 임직원 고객님에게는 평일 30%, 주말/공휴일 20% (성수기 20% 고정)의 전용 우대 요금이 자동 적용됩니다.
                  리포즈는 일상에서 잠시 벗어나 고요한 회복을 열어갈 협력사 임직원 분들을 따뜻하게 맞이합니다.
                </p>
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
            <div ref={formRef} className="scroll-mt-20 xl:sticky xl:top-24 xl:self-start">
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
            className="mx-auto max-w-3xl"
          >
            {/* 서브 토글 */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setRentalMode('media')}
                className={`min-h-[40px] rounded-none border px-5 text-[14px] font-medium transition-colors ${
                  rentalMode === 'media'
                    ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                미디어 대관
              </button>
              <button
                type="button"
                onClick={() => setRentalMode('workation')}
                className={`min-h-[40px] rounded-none border px-5 text-[14px] font-medium transition-colors ${
                  rentalMode === 'workation'
                    ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                워케이션
              </button>
            </div>

            <div className="space-y-6 bg-white border border-gray-200 p-6 md:p-8">
              {rentalMode === 'media' ? (
                <>
                  <div className="space-y-4">
                    <p className="text-[11px] tracking-[0.15em] text-gray-400 uppercase">MEDIA RENTAL GUIDE</p>
                    <h3 className="text-xl font-light tracking-tight text-[#1a1a1a] font-serif">상업적 미디어 대관 규정</h3>
                    <div className="w-12 h-px bg-gray-300 my-4" />
                  </div>

                  <div className="space-y-6 text-[13px] leading-relaxed text-gray-600">
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#1a1a1a] text-[14px]">1. 대관 문의 안내</h4>
                      <p className="text-gray-500 pl-1">
                        정확한 견적과 가능 일정은 고객센터 상담을 통해 확인하실 수 있습니다. 쇼핑몰 룩북, 광고·미디어 촬영, 매거진 화보, 드라마·영화, 개인 유튜브 등 목적에 맞게 상담해 드립니다.
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-gray-100 pt-4">
                      <h4 className="font-bold text-[#1a1a1a] text-[14px]">2. 인원 및 장비 제한 규정</h4>
                      <p className="text-gray-500 pl-1">
                        스태프 및 모델을 포함한 출입 인원은 사전에 협의해 주세요. 시설 보호와 원활한 전력 공급을 위해 대형 조명 크레인, 스모그 머신(포그 머신), 탑차 등의 대형 장비 반입 시에는 반드시 사전에 상세히 협의하셔야 합니다.
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-gray-100 pt-4 bg-gray-50/50 p-4 rounded-none">
                      <h4 className="font-bold text-red-700 text-[14px]">3. 원상복구 및 손해배상 의무 (필수 서약)</h4>
                      <p className="text-gray-500 italic text-[12px] leading-relaxed">
                        &ldquo;촬영을 위한 가구 및 소품의 이동은 사전 협의된 범위 내에서만 가능하며, 촬영 종료 직후 입실 전 상태로 완벽히 원상복구해야 합니다. 촬영 중 발생한 시설물, 가구, 식생(잔디 및 조경)의 파손, 오염, 스크래치에 대해서는 촬영 주체(브랜드 및 대행사)가 전액 실비로 손해배상할 책임이 있습니다.&rdquo;
                      </p>
                      <p className="text-[11px] text-gray-400 mt-2">
                        * 원상복구 보증금은 고객센터 상담 시 안내해 드립니다.
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-gray-100 pt-4">
                      <h4 className="font-bold text-[#1a1a1a] text-[14px]">4. 브랜드 이미지 및 콘텐츠 사전 심의</h4>
                      <p className="text-gray-500 pl-1">
                        리포즈의 정갈한 명예를 수호하고 선정적이거나 유흥 목적의 콘텐츠에 노출되는 것을 사전에 방지하고자, 대관 확정 전 촬영 콘셉트 및 스토리보드를 정중히 심의·요청드리고 있습니다.
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-gray-100 pt-4">
                      <h4 className="font-bold text-[#1a1a1a] text-[14px]">5. 대관 취소 및 환불 규정</h4>
                      <p className="text-gray-500 pl-1">
                        촬영 10일 전: 100% 전액 환불 | 촬영 7일 전: 50% 반환 | 촬영 3일 전 ~ 촬영 당일: 환불 및 취소 불가. 상세 일정은 상담 시 안내해 드립니다.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <p className="text-[11px] tracking-[0.15em] text-gray-400 uppercase">WORKATION GUIDE</p>
                    <h3 className="text-xl font-light tracking-tight text-[#1a1a1a] font-serif">워케이션 이용 안내</h3>
                    <div className="w-12 h-px bg-gray-300 my-4" />
                  </div>

                  <div className="space-y-6 text-[13px] leading-relaxed text-gray-600">
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#1a1a1a] text-[14px]">1. 워케이션 문의 안내</h4>
                      <p className="text-gray-500 pl-1">
                        팀 단위 업무·워크숍·오프사이트 등 워케이션 목적의 이용을 상담해 드립니다. 인원, 일정, 이용 조건은 고객센터 상담을 통해 조율해 드립니다.
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-gray-100 pt-4">
                      <h4 className="font-bold text-[#1a1a1a] text-[14px]">2. 이용 수칙</h4>
                      <ul className="space-y-1.5 list-disc list-inside pl-1 text-gray-500">
                        <li>반려동물 동반 불가</li>
                        <li>실내 전 구역 금연</li>
                        <li>가구 및 시설 이동 시 사전 협의, 이용 종료 후 원상복구 협조</li>
                        <li>공용 공간과 인접한 이웃을 위해 소음은 자제해 주세요</li>
                      </ul>
                    </div>

                    <div className="space-y-2 border-t border-gray-100 pt-4">
                      <h4 className="font-bold text-[#1a1a1a] text-[14px]">3. 상세 조건 안내</h4>
                      <p className="text-gray-500 pl-1">
                        구체적인 이용 조건과 취소·환불 규정은 고객센터 상담 시 자세히 안내해 드립니다.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* 고객센터 CTA */}
              <div className="border-t border-gray-100 pt-6 space-y-3">
                <p className="text-[13px] font-semibold text-[#1a1a1a]">정확한 견적과 예약 확정은 고객센터 상담을 통해 진행돼요.</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`tel:${contactInfo.phone.replace(/-/g, '')}`}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-none bg-[#1a1a1a] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#333]"
                  >
                    전화 문의 · {contactInfo.phone}
                  </a>
                  <a
                    href={kakaoChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-none border border-gray-200 px-6 text-[14px] font-semibold text-[#1a1a1a] transition-colors hover:border-gray-300"
                  >
                    카카오톡 문의하기
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
