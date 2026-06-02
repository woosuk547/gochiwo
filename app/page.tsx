'use client'

import Link from 'next/link'
import { PageShell } from '@/components/site/page-shell'
import { FadeIn, TextReveal, StaggerContainer, StaggerItem, ParallaxImage } from '@/components/motion'
import { noticeEntries } from '@/lib/repause-brand-content'
import {
  reservationSteps,
  roomHighlights,
} from '@/lib/repause-content'

export default function HomePage() {
  return (
    <PageShell overlayHeader>

      {/* ── 히어로 ────────────────────────────────────────────────────── */}
      <section className="relative -mt-16 flex min-h-[100svh] items-center justify-center overflow-hidden">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 h-full w-full object-cover"
          poster="/repause/hero-exterior.jpg"
        >
          <source src="/repause/hero.mp4" type="video/mp4" />
        </video>

        {/* 비네트 — 방향 없이 전체 살짝 어둠 */}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.45)_100%)]" />

        {/* 중앙 텍스트 */}
        <div className="relative flex flex-col items-center text-center px-5">
          <FadeIn delay={0.2} duration={0.7} distance={0}>
            <p className="mb-6 text-[12px] font-medium tracking-[0.12em] text-white/55">
              하이엔드 프라이빗 독채 풀빌라
            </p>
          </FadeIn>

          <div className="overflow-hidden">
            <FadeIn delay={0.35} duration={1.1} distance={50}>
              <h1 className="text-[clamp(3rem,8.5vw,7.5rem)] font-extralight leading-[1.05] tracking-[-0.025em] text-white font-serif">
                고요가 흐르는 시간
              </h1>
            </FadeIn>
          </div>
          <div className="overflow-hidden">
            <FadeIn delay={0.5} duration={1.1} distance={50}>
              <h1 className="text-[clamp(3rem,8.5vw,7.5rem)] font-extralight leading-[1.05] tracking-[-0.025em] text-white/60 font-serif">
                우리만의 휴식
              </h1>
            </FadeIn>
          </div>

          <FadeIn delay={0.65} duration={0.7} distance={12}>
            <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-white/65 md:text-[15px]">
              연인과 가족이 오롯이 머무는 럭셔리 독채. 그저 머무는 것만으로 충분한 회복을 경험해 보세요.
            </p>
          </FadeIn>

          <FadeIn delay={0.75} duration={0.7} distance={16}>
            <div className="mt-10 flex items-center gap-6">
              <Link
                href="/reservation"
                className="text-[13px] font-medium tracking-[0.1em] text-white border-b border-white/40 pb-0.5 transition-all duration-300 hover:border-white hover:text-white"
              >
                예약 가능 일정 보기
              </Link>
              <span className="h-3 w-px bg-white/20" />
              <Link
                href="/space"
                className="text-[13px] font-medium tracking-[0.1em] text-white/50 border-b border-transparent pb-0.5 transition-all duration-300 hover:border-white/40 hover:text-white/80"
              >
                공간 둘러보기
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* 스크롤 인디케이터 */}
        <FadeIn delay={1.2} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <p className="text-[11px] tracking-[0.15em] text-white/50">아래로 스크롤</p>
          <div className="relative h-12 w-px bg-white/15">
            <div className="absolute top-0 h-4 w-px animate-[scrollDown_2s_ease-in-out_infinite] bg-white/60" />
          </div>
        </FadeIn>

        {/* 하단 메타 */}
        <FadeIn delay={0.9} className="absolute bottom-10 left-5 md:left-10">
          <p className="text-[11px] tracking-[0.12em] text-white/50">
            Repause © 2026
          </p>
        </FadeIn>
        <FadeIn delay={0.9} className="absolute bottom-10 right-5 md:right-10">
          <p className="text-[11px] tracking-[0.1em] text-white/50">
            2인 기준 · 최대 6인 · 사계절 전용 풀
          </p>
        </FadeIn>
      </section>

      {/* ── 인트로 카피 ────────────────────────────────────────────────── */}
      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <TextReveal>
            <p className="text-[clamp(1.4rem,2.8vw,2.2rem)] font-light leading-[1.75] tracking-[-0.025em] text-[#1a1a1a] font-serif">
              자연을 응시하는 거실, 히노끼 편백 향이 채우는 밤,<br />
              포치 아래 잠시 감은 눈 끝에 가닿는 온전한 고요.
            </p>
          </TextReveal>

          {/* 초정밀 미니멀 팩트 보드 그리드 */}
          <FadeIn delay={0.3}>
            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-gray-100 pt-10 md:grid-cols-4">
              {[
                { title: '프라이빗 독채', desc: '단 한 팀을 위한 독립 공간', detail: '250평 정원 · 48평 정제된 실내' },
                { title: '이용 인원', desc: '기준 2인 · 최대 6인', detail: '6인 예약 시 토퍼와 침구 추가 제공' },
                { title: '느긋한 연박', desc: '2박 이상 머무는 여정', detail: '연박 할인 특별가 제공' },
                { title: '사계절 전용 풀', desc: '추운 계절 미온수 포함', detail: '봄·여름은 자연수 풀로 운영' },
              ].map((item) => (
                <div key={item.title} className="group border-b border-gray-100 pb-5 md:border-b-0 md:pb-0">
                  <p className="text-[14px] font-semibold tracking-[-0.015em] text-[#1a1a1a]">{item.title}</p>
                  <p className="mt-1 text-[12px] text-gray-500">{item.desc}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400 font-light">{item.detail}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 공간 에디토리얼 그리드 ────────────────────────────────────── */}
      <section>
        {/* 첫 번째: 거실 — 화면 꽉 채움 */}
        <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]" data-cursor="view">
          <ParallaxImage
            src="/repause/editorial-living.jpg"
            alt="리포즈 거실과 전면창"
            aspectRatioClassName=""
            className="absolute inset-0"
            priority
            revealDirection="center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 max-w-lg p-8 md:p-14 pointer-events-none">
            <TextReveal>
              <p className="text-[11px] font-medium tracking-[0.2em] text-white/50">거실</p>
            </TextReveal>
            <TextReveal delay={0.1}>
              <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-[-0.025em] text-white">
                {roomHighlights[0].title}
              </h2>
            </TextReveal>
            <FadeIn delay={0.3}>
              <p className="mt-3 text-[14px] leading-[1.75] tracking-tight text-white/70 md:text-[15px]">
                {roomHighlights[0].copy}
              </p>
            </FadeIn>
          </div>
        </div>

        {/* 두 번째: 침실(왼) + 욕실(오) — 50/50 */}
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden" data-cursor="view">
            <ParallaxImage
              src="/repause/editorial-bedroom.jpg"
              alt="리포즈 침실"
              aspectRatioClassName=""
              className="absolute inset-0"
              revealDirection="left"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-7 md:p-10 pointer-events-none">
              <TextReveal>
                <p className="text-[11px] tracking-[0.2em] text-white/50">침실</p>
              </TextReveal>
              <TextReveal delay={0.1}>
                <h3 className="mt-1.5 text-[1.4rem] font-bold tracking-[-0.025em] text-white">{roomHighlights[1].title}</h3>
              </TextReveal>
              <FadeIn delay={0.25}>
                <p className="mt-2 text-[13px] leading-[1.75] tracking-tight text-white/70">{roomHighlights[1].copy}</p>
              </FadeIn>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#0a0a0a]" data-cursor="view">
            <ParallaxImage
              src="/repause/editorial-bath.jpg"
              alt="히노끼 욕조"
              aspectRatioClassName=""
              className="absolute inset-0"
              revealDirection="right"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-7 md:p-10 pointer-events-none">
              <TextReveal>
                <p className="text-[11px] tracking-[0.2em] text-white/50">욕실</p>
              </TextReveal>
              <TextReveal delay={0.1}>
                <h3 className="mt-1.5 text-[1.4rem] font-bold tracking-[-0.025em] text-white">{roomHighlights[2].title}</h3>
              </TextReveal>
              <FadeIn delay={0.25}>
                <p className="mt-2 text-[13px] leading-[1.75] tracking-tight text-white/70">{roomHighlights[2].copy}</p>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* 세 번째: 데크 — 전폭 + 우측 정렬 텍스트 */}
        <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]" data-cursor="view">
          <ParallaxImage
            src="/repause/editorial-deck.jpg"
            alt="프라이빗 데크"
            aspectRatioClassName=""
            className="absolute inset-0"
            revealDirection="center"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/55 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 right-0 max-w-lg p-8 text-right md:p-14 pointer-events-none">
            <TextReveal>
              <p className="text-[11px] tracking-[0.2em] text-white/50">데크</p>
            </TextReveal>
            <TextReveal delay={0.1}>
              <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight tracking-[-0.025em] text-white">
                {roomHighlights[3].title}
              </h2>
            </TextReveal>
            <FadeIn delay={0.3}>
              <p className="mt-3 text-[14px] leading-[1.75] tracking-tight text-white/70 md:text-[15px]">
                {roomHighlights[3].copy}
              </p>
            </FadeIn>
          </div>
        </div>

        {/* 공간 전체 보기 CTA */}
        <FadeIn>
          <div className="flex justify-center border-t border-gray-100 py-10">
            <Link
              href="/space"
              className="group flex items-center gap-3 text-[14px] font-medium tracking-wide text-gray-500 transition-colors hover:text-[#1a1a1a]"
            >
              공간 둘러보기
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── 예약 흐름 — 에디토리얼 타임라인 ──────────────────────────── */}
      <section className="border-t border-gray-100 bg-[#1a1a1a] px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-[11px] tracking-[0.12em] text-white/40">예약 과정</p>
            <h2 className="mt-4 text-[clamp(1.8rem,4vw,3rem)] font-light leading-tight tracking-[-0.025em] text-white">
              온전한 쉼을 예약하는 과정
            </h2>
          </FadeIn>

          <div className="mt-14 grid gap-0 md:grid-cols-4">
            {reservationSteps.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.1}>
                <div className={`border-t border-white/10 pt-6 md:pr-8 ${i > 0 ? 'mt-8 md:mt-0 md:border-l md:border-t-0 md:pl-8 md:pt-0' : ''}`}>
                  <span className="text-[11px] tracking-[0.2em] text-white/30">0{step.step}</span>
                  <h3 className="mt-3 text-[17px] font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/50">{step.copy}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-14 flex flex-wrap gap-4">
              <Link
                href="/reservation"
                className="rounded-none border border-white bg-white px-7 py-3.5 text-[14px] font-semibold tracking-wide text-[#1a1a1a] transition-all duration-300 hover:bg-transparent hover:text-white"
              >
                일반 예약하기
              </Link>
              <Link
                href="/partnership"
                className="rounded-none border border-white/20 px-7 py-3.5 text-[14px] font-medium text-white/70 transition-all duration-300 hover:border-white/50 hover:text-white"
              >
                제휴 · 대관 문의
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 공지사항 ────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 px-5 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] tracking-[0.12em] text-gray-400">소식</p>
              <Link href="/notices" className="text-[12px] text-gray-400 transition-colors hover:text-[#1a1a1a]">전체 →</Link>
            </div>
          </FadeIn>
          <StaggerContainer staggerDelay={0.05} className="divide-y divide-gray-100">
            {noticeEntries.map((notice) => (
              <StaggerItem key={notice.title}>
                <Link href="/notices" className="group flex items-center justify-between py-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-300">{notice.date}</span>
                    <p className="text-[14px] text-[#1a1a1a]">{notice.title}</p>
                  </div>
                  <span className="text-gray-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#1a1a1a]">→</span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

    </PageShell>
  )
}
