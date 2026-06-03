'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useReducedMotion } from 'framer-motion'
import { PageShell } from '@/components/site/page-shell'
import {
  FadeIn,
  TextReveal,
  StaggerContainer,
  StaggerItem,
  ParallaxImage,
  ParallaxLayers,
} from '@/components/motion'
import { noticeEntries } from '@/lib/repause-brand-content'
import {
  reservationSteps,
  primaryStay,
  homeNarrative,
  homeSignatureFacts,
  homeDayJourney,
  homeSpacePreviews,
  homeParallaxLayers,
} from '@/lib/repause-content'

const editorialBtnPrimary =
  'inline-flex min-h-[44px] items-center justify-center rounded-none border border-white bg-white px-7 py-3 text-[14px] font-medium tracking-wide text-[#1a1a1a] transition-all duration-300 hover:bg-transparent hover:text-white'
const editorialBtnOutline =
  'inline-flex min-h-[44px] items-center justify-center rounded-none border border-white/30 px-7 py-3 text-[14px] font-medium text-white/70 transition-all duration-300 hover:border-white hover:text-white'

export function HomeContent() {
  const prefersReducedMotion = useReducedMotion()

  function formatNoticeDate(dateStr: string) {
    const d = new Date(dateStr)
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${m}.${day}`
  }

  const previewNotices = noticeEntries.slice(0, 2)

  return (
    <PageShell overlayHeader>

      {/* ── 1. Immersive Hero ─────────────────────────────────────────── */}
      <section className="relative -mt-16 flex min-h-[100svh] items-center justify-center overflow-hidden">
        {prefersReducedMotion ? (
          <Image
            src="/repause/hero-exterior.jpg"
            alt="리포즈 포레스트 하우스"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            poster="/repause/hero-exterior.jpg"
          >
            <source src="/repause/hero.mp4" type="video/mp4" />
          </video>
        )}

        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.45)_100%)]" />

        <div className="relative flex flex-col items-center px-5 text-center">
          <FadeIn delay={0.2} duration={0.7} distance={0}>
            <p className="text-eyebrow mb-6 font-medium text-white/55">
              하이엔드 프라이빗 독채
            </p>
          </FadeIn>

          <div className="overflow-hidden">
            <FadeIn delay={0.35} duration={1.1} distance={50}>
              <h1 className="font-serif text-display font-extralight leading-[1.05] tracking-[-0.025em] text-white">
                고요가 흐르는 시간
              </h1>
            </FadeIn>
            <FadeIn delay={0.5} duration={1.1} distance={50}>
              <p className="font-serif text-display font-extralight leading-[1.05] tracking-[-0.025em] text-white/60">
                우리만의 휴식
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.65} duration={0.7} distance={12}>
            <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-white/65">
              연인과 가족이 오롯이 머무는 럭셔리 독채. 그저 머무는 것만으로 충분한 회복을 경험해 보세요.
            </p>
          </FadeIn>

          <FadeIn delay={0.75} duration={0.7} distance={16}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <Link href="/reservation" className={editorialBtnPrimary}>
                예약하기
              </Link>
              <Link
                href="/space"
                className="text-[13px] font-medium tracking-[0.1em] text-white/50 border-b border-transparent pb-0.5 transition-all duration-300 hover:border-white/40 hover:text-white/80"
              >
                공간 둘러보기
              </Link>
            </div>
          </FadeIn>
        </div>

        <FadeIn
          delay={1.2}
          className="absolute bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <p className="text-[11px] tracking-[0.12em] text-white/50">아래로 스크롤</p>
          <div className="relative h-12 w-px bg-white/15">
            <div className="absolute top-0 h-4 w-px animate-[scrollDown_2s_ease-in-out_infinite] bg-white/60" />
          </div>
        </FadeIn>

        <FadeIn delay={0.9} className="absolute bottom-10 left-5 hidden md:block md:left-10">
          <p className="text-[11px] tracking-[0.12em] text-white/50">Repause © 2026</p>
        </FadeIn>
        <FadeIn delay={0.9} className="absolute bottom-10 right-5 hidden md:block md:right-10">
          <p className="text-[11px] tracking-[0.1em] text-white/50">{primaryStay.guests} · 사계절 전용 풀</p>
        </FadeIn>
      </section>

      {/* ── 2. Pull Quote ─────────────────────────────────────────────── */}
      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <TextReveal>
            <p className="font-serif text-pullquote font-light leading-[1.75] tracking-[-0.025em] text-[#1a1a1a] whitespace-pre-line">
              {homeNarrative.pullQuote}
            </p>
          </TextReveal>

          {/* Signature Facts — 모바일: 가로 스크롤 / 데스크톱: 4열 */}
          <FadeIn delay={0.3}>
            <div className="mt-12 border-t border-gray-100 pt-10">
              <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0">
                {homeSignatureFacts.map((item) => (
                  <div
                    key={item.title}
                    className="min-w-[160px] shrink-0 border-b border-gray-100 pb-5 md:min-w-0 md:border-b-0 md:pb-0"
                  >
                    <p className="text-[14px] font-medium tracking-[-0.015em] text-[#1a1a1a]">{item.title}</p>
                    <p className="mt-1 text-[13px] text-gray-500">{item.desc}</p>
                    <p className="mt-0.5 text-[13px] font-light text-gray-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 3. Parallax Forest Journey ────────────────────────────────── */}
      <ParallaxLayers
        layers={homeParallaxLayers}
        subtitle="고요한 여정으로"
        title="프라이빗 독채에 닿기까지"
      />

      {/* ── 4. A Day at Repause ───────────────────────────────────────── */}
      <section className="border-t border-gray-100 px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-label text-gray-400">하루의 여정</p>
            <h2 className="mt-3 font-serif text-section font-extralight tracking-[-0.025em] text-[#1a1a1a]">
              Repause에서의 하루
            </h2>
          </FadeIn>

          <div className="mt-14 space-y-0 md:grid md:grid-cols-4 md:gap-0 md:space-y-0">
            {homeDayJourney.map((step, i) => (
              <FadeIn key={step.time} delay={i * 0.08}>
                <div
                  className={`border-t border-gray-100 py-8 md:border-t-0 md:border-l md:py-0 md:pl-8 md:first:border-l-0 md:first:pl-0 ${
                    i === 0 ? 'md:pt-0' : ''
                  }`}
                >
                  <p className="text-label text-gray-400">{step.time}</p>
                  <p className="mt-1 text-[12px] tracking-[0.12em] text-gray-300">{step.label}</p>
                  <h3 className="mt-3 font-serif text-[1.25rem] font-light tracking-[-0.02em] text-[#1a1a1a]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-[1.8] text-gray-500">{step.copy}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Space Preview (3컷) ────────────────────────────────────── */}
      <section>
        {homeSpacePreviews.map((space, index) => (
          <div
            key={space.label}
            className={`group relative w-full overflow-hidden ${
              index === 0 ? 'aspect-[16/9] md:aspect-[21/9]' : 'aspect-[4/3] md:aspect-[16/9]'
            }`}
          >
            <ParallaxImage
              src={space.image}
              alt={space.title}
              aspectRatioClassName=""
              className="absolute inset-0 transition-transform duration-700 md:group-hover:scale-[1.03]"
              priority={index === 0}
              revealDirection={index % 2 === 0 ? 'left' : 'right'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent transition-opacity duration-500 md:group-hover:from-black/65" />
            <div
              className={`absolute bottom-0 max-w-lg p-8 md:p-14 ${
                index === homeSpacePreviews.length - 1 ? 'right-0 text-right' : 'left-0'
              }`}
            >
              <TextReveal>
                <p className="text-label text-white/50">{space.label}</p>
              </TextReveal>
              <TextReveal delay={0.1}>
                <h2 className="mt-2 font-serif text-section font-extralight leading-tight tracking-[-0.025em] text-white">
                  {space.title}
                </h2>
              </TextReveal>
              <FadeIn delay={0.25}>
                <p className="mt-3 text-[15px] leading-[1.8] text-white/70">{space.copy}</p>
              </FadeIn>
            </div>
          </div>
        ))}

        <FadeIn>
          <div className="flex flex-col items-center gap-2 border-t border-gray-100 py-10 md:flex-row md:justify-center md:gap-6">
            <Link
              href="/space"
              className="group flex items-center gap-3 text-[14px] font-medium tracking-wide text-gray-500 transition-colors hover:text-[#1a1a1a]"
            >
              공간 둘러보기
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
            <span className="hidden h-3 w-px bg-gray-200 md:block" />
            <p className="text-[13px] text-gray-400">
              {primaryStay.fromPrice} / 2인 기준
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ── 6. Trust: Quote · Location · Partnership ─────────────────── */}
      <section className="border-t border-gray-100 bg-[#fafafa] px-5 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <TextReveal>
            <blockquote className="font-serif text-pullquote font-light leading-[1.7] tracking-[-0.02em] text-[#1a1a1a]">
              {homeNarrative.brandQuote}
            </blockquote>
          </TextReveal>
          <FadeIn delay={0.2}>
            <div className="mt-8 flex flex-col items-center gap-3 text-[13px] text-gray-500 md:flex-row md:justify-center md:gap-6">
              <Link href="/guide" className="transition-colors hover:text-[#1a1a1a]">
                {homeNarrative.locationTeaser}
              </Link>
              <span className="hidden h-3 w-px bg-gray-300 md:block" />
              <Link href="/partnership" className="transition-colors hover:text-[#1a1a1a]">
                {homeNarrative.partnershipBadge}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 7. Reservation Timeline ───────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-[#1a1a1a] px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-label text-white/40">예약 과정</p>
            <h2 className="mt-4 font-serif text-section font-extralight leading-tight tracking-[-0.025em] text-white">
              온전한 쉼을 예약하는 과정
            </h2>
          </FadeIn>

          <div className="mt-14 grid gap-0 md:grid-cols-4">
            {reservationSteps.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.1}>
                <div
                  className={`border-t border-white/10 pt-6 md:pr-8 ${
                    i > 0 ? 'mt-8 md:mt-0 md:border-l md:border-t-0 md:pl-8 md:pt-0' : ''
                  }`}
                >
                  <span className="font-serif text-[11px] tracking-[0.12em] text-white/30">0{step.step}</span>
                  <h3 className="mt-3 text-[17px] font-medium text-white">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.8] text-white/50">{step.copy}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-14 flex flex-wrap gap-4">
              <Link href="/reservation" className={editorialBtnPrimary}>
                예약하기
              </Link>
              <Link href="/partnership" className={editorialBtnOutline}>
                제휴 · 대관 문의
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 8. Closing CTA ────────────────────────────────────────────── */}
      <section className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[480px]">
        <ParallaxImage
          src="/repause/editorial-kitchen.jpg"
          alt="리포즈 주방"
          aspectRatioClassName=""
          className="absolute inset-0"
          revealDirection="center"
        />
        <div className="absolute inset-0 bg-[#1a1a1a]/75" />
        <div className="relative px-5 py-24 text-center md:py-32">
          <TextReveal>
            <h2 className="font-serif text-section font-extralight tracking-[-0.02em] text-white">
              지금, 우리만의 시간을 예약하세요
            </h2>
          </TextReveal>
          <FadeIn delay={0.3}>
            <p className="mt-4 text-[15px] text-white/50">가용 일정을 확인하고 바로 예약해 보세요.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/reservation" className={editorialBtnPrimary}>
                예약하기
              </Link>
              <Link href="/partnership" className={editorialBtnOutline}>
                제휴 · 대관 문의
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 9. 소식 (2건, 푸터 직전) ──────────────────────────────────── */}
      <section className="border-t border-gray-100 px-5 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-label text-gray-400">소식</p>
              <Link href="/notices" className="text-[12px] text-gray-400 transition-colors hover:text-[#1a1a1a]">
                전체 →
              </Link>
            </div>
          </FadeIn>
          <StaggerContainer staggerDelay={0.05} className="divide-y divide-gray-100">
            {previewNotices.map((notice) => (
              <StaggerItem key={notice.title}>
                <Link href="/notices" className="group flex items-center justify-between py-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-300">{formatNoticeDate(notice.date)}</span>
                    <p className="text-[14px] text-[#1a1a1a]">{notice.title}</p>
                  </div>
                  <span className="text-gray-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#1a1a1a]">
                    →
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

    </PageShell>
  )
}
