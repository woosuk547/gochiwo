import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { PageShell } from '@/components/site/page-shell'
import { NaverMap } from '@/components/site/naver-map'
import { FAQAccordion } from '@/components/site/faq-accordion'
import { FadeIn } from '@/components/motion'
import { AnimatedSection } from '@/components/motion/animated-sections'
import { guideFaq, guideGroups, cancellationPolicy } from '@/lib/repause-content'

export const metadata: Metadata = {
  title: '이용 안내 — 리포즈',
  description: '체크인, 결제, 취소 규정, 위치, FAQ를 확인하세요.',
}

export const dynamic = 'force-dynamic'

export default function GuidePage() {
  return (
    <PageShell>

      {/* ── 이미지 히어로 ─────────────────────────────────────────────── */}
      <section className="relative -mt-16 flex min-h-[50vh] items-end overflow-hidden md:min-h-[60vh]">
        <Image src="/repause/editorial-deck.jpg" alt="리포즈 데크" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-12 md:pb-16">
          <FadeIn delay={0.1}>
            <p className="text-[11px] tracking-[0.15em] text-white/50">이용 안내</p>
          </FadeIn>
          <div className="overflow-hidden mt-2">
            <FadeIn delay={0.2} duration={0.8} distance={40}>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] font-extralight leading-tight tracking-[-0.02em] text-white">
                안식을 향하기 전,<br />미리 살펴두어야 할 이야기들
              </h1>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── 이용 규정 — 세로 리스트 ──────────────────────────────────── */}
      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-3">
            {guideGroups.map((group) => (
              <AnimatedSection key={group.title}>
                <p className="text-[11px] tracking-[0.1em] text-gray-400">{group.title}</p>
                <ul className="mt-5 space-y-3 border-t border-gray-100 pt-5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-[#1a1a1a]">
                      <span className="mt-2 h-px w-4 shrink-0 bg-gray-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── 취소 · 환불 규정 ──────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-[#f8f8f8] px-5 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <p className="text-[11px] tracking-[0.12em] text-gray-400">취소 · 환불 규정</p>
            <h2 className="mt-3 text-[1.8rem] font-light tracking-[-0.02em] text-[#1a1a1a] md:text-[2.2rem]">
              취소 · 환불 규정
            </h2>
            <div className="mt-3 space-y-1">
              {cancellationPolicy.intro.map((line) => (
                <p key={line} className="text-[14px] text-gray-500">{line}</p>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mt-8 overflow-x-auto rounded-none border border-gray-200">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="bg-[#1a1a1a] text-white">
                    <th className="min-w-[90px] px-5 py-3.5 text-left font-normal tracking-wide">취소 시점</th>
                    <th className="min-w-[80px] px-5 py-3.5 text-center font-normal">비수기</th>
                    <th className="min-w-[80px] px-5 py-3.5 text-center font-normal">성수기</th>
                  </tr>
                </thead>
                <tbody>
                  {cancellationPolicy.tableRows.map((row, i) => (
                    <tr key={row.daysLabel} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-5 py-3 text-[#1a1a1a]">{row.daysLabel}</td>
                      <td className="px-5 py-3 text-center text-gray-600">{row.offpeak}</td>
                      <td className={`px-5 py-3 text-center ${row.peak === '환불 불가' ? 'font-medium text-red-500' : 'text-gray-600'}`}>{row.peak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-4 flex gap-5 text-[12px] text-gray-400">
              {cancellationPolicy.peakSeasons.map((season) => (
                <span key={season}>* {season}</span>
              ))}
            </div>
            <ul className="mt-6 space-y-2.5 border-t border-gray-200 pt-6">
              {cancellationPolicy.notes.map((note) => (
                <li key={note} className="flex items-start gap-3 text-[13px] leading-relaxed text-gray-500">
                  <span className="mt-1.5 h-px w-3 shrink-0 bg-gray-300" />
                  {note}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* ── 오시는 길 ─────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2">
            <AnimatedSection>
              <div>
                <p className="text-[11px] tracking-[0.12em] text-gray-400">오시는 길</p>
                <h2 className="mt-3 text-[1.8rem] font-light tracking-[-0.02em] text-[#1a1a1a]">오시는 길</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
                  서울에서 차로 약 1시간 20분. 대자연 속 고요한 자리에 자리한 프라이빗 독채입니다.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    { label: '주소', value: '강원 홍천군 서면 숲속길 21' },
                    { label: '체크인', value: '비대면 체크인 서비스. 여정 시작 당일 오전, 개별 가이드를 전송해 드립니다.' },
                    { label: '주차', value: '전용 단독 주차 공간 2대 제공. 전기차 완속 충전 스테이션 무료 이용 가능.' },
                  ].map((item) => (
                    <div key={item.label} className="border-t border-gray-100 pt-4">
                      <p className="text-[11px] tracking-[0.1em] text-gray-400">{item.label}</p>
                      <p className="mt-1.5 text-[15px] text-[#1a1a1a]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="overflow-hidden rounded-none">
                <NaverMap />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-[#f8f8f8] px-5 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <p className="text-[11px] tracking-[0.12em] text-gray-400">자주 묻는 질문</p>
            <h2 className="mt-3 text-[1.8rem] font-light tracking-[-0.02em] text-[#1a1a1a]">자주 묻는 질문</h2>
            <div className="mt-8">
              <FAQAccordion items={guideFaq} />
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-12 flex flex-wrap gap-4 border-t border-gray-200 pt-10">
              <Link
                href="/reservation"
                className="rounded-none border border-[#1a1a1a] bg-[#1a1a1a] px-7 py-3.5 text-[14px] font-medium text-white transition-all duration-300 hover:bg-transparent hover:text-[#1a1a1a]"
              >
                예약하기
              </Link>
              <Link
                href="/partnership"
                className="rounded-none border border-gray-300 px-7 py-3.5 text-[14px] font-medium text-gray-600 transition-all duration-300 hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
              >
                제휴 예약
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </PageShell>
  )
}
