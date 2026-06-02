import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PageShell } from '@/components/site/page-shell'
import { FadeIn, TextReveal } from '@/components/motion'
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from '@/components/motion/animated-sections'
import { brandPrinciples } from '@/lib/repause-brand-content'
import { contactInfo } from '@/lib/repause-content'

export const metadata: Metadata = {
  title: '브랜드 — 리포즈',
  description: '리포즈의 브랜드 철학과 운영 기준을 정밀하게 소개합니다.',
}

export default function BrandPage() {
  return (
    <PageShell>

      {/* ── 이미지 히어로 ─────────────────────────────────────────────── */}
      <section className="relative -mt-16 flex min-h-[55vh] items-end overflow-hidden md:min-h-[65vh]">
        <Image src="/repause/villa-night.jpg" alt="리포즈 외관" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-12 md:pb-16">
          <FadeIn delay={0.1}>
            <p className="text-[11px] tracking-[0.15em] text-white/50">브랜드</p>
          </FadeIn>
          <div className="overflow-hidden mt-2">
            <FadeIn delay={0.2} duration={0.9} distance={50}>
              <h1 className="text-[clamp(2.2rem,5vw,4.5rem)] font-extralight leading-tight tracking-[-0.02em] text-white">
                리포즈라는 이름
              </h1>
            </FadeIn>
          </div>
          <FadeIn delay={0.4}>
            <p className="mt-4 text-[14px] leading-relaxed text-white/50 md:text-[15px]">
              공간의 조밀한 조도부터 예약이 흘러가는 방식까지, 일관된 철학의 결로 기품 있게 보듬는 것, 그것이 REPAUSE가 추구하는 가치입니다.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── 핵심 인용구 ───────────────────────────────────────────────── */}
      <section className="px-5 py-20 md:py-32">
        <div className="mx-auto max-w-3xl">
          <TextReveal>
            <p className="text-[clamp(1.5rem,3vw,2.4rem)] font-light leading-[1.7] tracking-[-0.01em] text-[#1a1a1a]">
              멈춰야 비로소 보이는 것들을 위한 공간.
            </p>
          </TextReveal>
          <FadeIn delay={0.4}>
            <p className="mt-6 text-[15px] leading-relaxed text-gray-500">
              일상의 급한 보폭에서 잠시 내려서 대자연의 무구한 호흡에 가만히 밀착하는 시간적 가치를 설계합니다.
              겉도는 액티비티를 배제하고 머무시는 장면 하나하나의 질감과 정밀한 밀도를 조율하는 데 오롯이 집중합니다.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── 브랜드 원칙 ───────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-[11px] tracking-[0.12em] text-gray-400">운영 원칙</p>
          </FadeIn>
          <AnimatedGrid staggerDelay={0.1} className="mt-10 grid gap-px border border-gray-100 md:grid-cols-3">
            {brandPrinciples.map((p, i) => (
              <AnimatedGridItem key={p.title}>
                <div className="bg-white p-8 md:p-10">
                  <p className="text-[11px] tracking-[0.2em] text-gray-300">0{i + 1}</p>
                  <h3 className="mt-4 text-[1.2rem] font-semibold text-[#1a1a1a]">{p.title}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-gray-500">{p.copy}</p>
                </div>
              </AnimatedGridItem>
            ))}
          </AnimatedGrid>
        </div>
      </section>

      {/* ── 크리오스 ──────────────────────────────────────────────────── */}
      <section className="bg-[#1a1a1a] px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.12em] text-white/40">운영사</p>
            <h2 className="mt-3 text-[1.8rem] font-light text-white">크리오스</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/50">
              리포즈의 모든 공간 기획과 전담 운영을 깊이 있게 총괄하는 전문 법인입니다.
            </p>
          </AnimatedSection>

          <AnimatedGrid staggerDelay={0.06} className="mt-10 grid gap-px border border-white/10 md:grid-cols-4">
            {[
              { label: '법인명', value: contactInfo.company },
              { label: '도메인', value: contactInfo.site },
              { label: '이메일', value: contactInfo.email },
              { label: '전화', value: contactInfo.phone },
            ].map((item) => (
              <AnimatedGridItem key={item.label}>
                <div className="bg-white/5 px-7 py-8 transition-colors hover:bg-white/10">
                  <p className="text-[11px] tracking-[0.1em] text-white/40">{item.label}</p>
                  <p className="mt-2 text-[14px] font-medium text-white/70">{item.value}</p>
                </div>
              </AnimatedGridItem>
            ))}
          </AnimatedGrid>

          <AnimatedSection delay={0.3}>
            <div className="mt-10 flex flex-wrap gap-4 border-t border-white/10 pt-10">
              <Link
                href="/reservation"
                className="rounded-none border border-white bg-white px-7 py-3.5 text-[14px] font-medium text-[#1a1a1a] transition-all duration-300 hover:bg-transparent hover:text-white"
              >
                예약하기
              </Link>
              <Link
                href="/partnership"
                className="rounded-none border border-white/20 px-7 py-3.5 text-[14px] font-medium text-white/60 transition-all duration-300 hover:border-white/50 hover:text-white"
              >
                제휴 예약
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </PageShell>
  )
}
