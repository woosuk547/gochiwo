import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PageShell } from '@/components/site/page-shell'
import { FadeIn, TextReveal } from '@/components/motion'
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from '@/components/motion/animated-sections'
import {
  brandPrinciples,
  brandHeadCopy,
  brandSubCopy,
  brandPhilosophy,
  brandTargetGuests,
  brandClosingMessage,
} from '@/lib/repause-brand-content'
import { contactInfo } from '@/lib/repause-content'
import { editorialBtnPrimary, editorialBtnOutline } from '@/lib/editorial'

export const metadata: Metadata = {
  title: '브랜드 — 리포즈',
  description: '리포즈의 브랜드 철학과 진정한 쉼의 가치를 소개합니다.',
}

export default function BrandPage() {
  return (
    <PageShell>

      {/* ── 이미지 히어로 ─────────────────────────────────────────────── */}
      <section className="relative -mt-16 flex min-h-[55vh] items-end overflow-hidden md:min-h-[65vh]">
        <Image src="/repause/villa-night.jpg" alt="리포즈 외관" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-12 md:pb-16">
          <FadeIn delay={0.1}>
            <p className="text-eyebrow text-white/70">브랜드</p>
          </FadeIn>
          <div className="overflow-hidden mt-2">
            <FadeIn delay={0.2} duration={0.9} distance={50}>
              <h1 className="text-[clamp(2.2rem,5vw,4.5rem)] font-extralight leading-tight tracking-[-0.02em] text-white font-serif">
                리포즈라는 이름
              </h1>
            </FadeIn>
          </div>
          <FadeIn delay={0.4}>
            <p className="mt-4 text-[14px] leading-relaxed text-white/75 md:text-[15px]">
              세상의 알람을 끄고 자연의 숨소리에 주파수를 맞추는 순간, 비로소 쉼의 본질에 가까워집니다.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── 핵심 헤드카피 ─────────────────────────────────────────────── */}
      <section className="px-5 py-20 md:py-32">
        <div className="mx-auto max-w-3xl">
          <TextReveal>
            <p className="text-[clamp(1.5rem,3vw,2.4rem)] font-light leading-[1.7] tracking-[-0.01em] text-[#1a1a1a] font-serif">
              {brandHeadCopy}
            </p>
          </TextReveal>
          <FadeIn delay={0.4}>
            <p className="mt-6 text-[15px] leading-relaxed text-gray-500">
              {brandSubCopy}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── 브랜드 철학 ───────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-[#f8f8f8] px-5 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <p className="text-eyebrow text-gray-500">브랜드 철학</p>
            <h2 className="mt-3 text-[1.8rem] font-light tracking-[-0.02em] text-[#1a1a1a] md:text-[2.2rem]">
              {brandPhilosophy.title}
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-6 text-[15px] leading-[1.9] text-gray-600 whitespace-pre-line">
              {brandPhilosophy.body}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── 브랜드 원칙 ───────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-eyebrow text-gray-500">운영 원칙</p>
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

      {/* ── 타깃 고객 ─────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <p className="text-eyebrow text-gray-500">이런 분들에게 리포즈를 추천합니다</p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <ul className="mt-8 space-y-4 border-t border-gray-100 pt-8">
              {brandTargetGuests.map((guest) => (
                <li key={guest} className="flex items-start gap-4 text-[15px] leading-relaxed text-[#1a1a1a]">
                  <span className="mt-2 h-px w-6 shrink-0 bg-gray-300" />
                  {guest}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* ── 마무리 메시지 ─────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-[#1a1a1a] px-5 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <TextReveal>
            <p className="text-[clamp(1.4rem,3vw,2.2rem)] font-light leading-[1.75] tracking-[-0.02em] text-white font-serif">
              {brandClosingMessage}
            </p>
          </TextReveal>
          <FadeIn delay={0.4}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/reservation" className={editorialBtnPrimary}>
                예약하기
              </Link>
              <Link href="/space" className={editorialBtnOutline}>
                공간 둘러보기
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 크리오스 ──────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#1a1a1a] px-5 pb-16 pt-0 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="border-t border-white/10 pt-14">
            <AnimatedSection>
              <p className="text-eyebrow text-white/60">운영사</p>
              <h2 className="mt-3 text-[1.8rem] font-light text-white">크리오스</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-white/50">
                리포즈의 모든 공간 기획과 전담 운영을 깊이 있게 총괄하는 전문 법인입니다.
              </p>
            </AnimatedSection>

            <AnimatedGrid staggerDelay={0.06} className="mt-10 grid gap-px border border-white/10 md:grid-cols-2 lg:grid-cols-5">
              {[
                { label: '법인명', value: contactInfo.company },
                { label: '도메인', value: contactInfo.site },
                { label: '이메일', value: contactInfo.email },
                { label: '전화', value: contactInfo.phone },
                { label: '인스타그램', value: '@repause_poolvilla', href: contactInfo.instagram },
              ].map((item) => (
                <AnimatedGridItem key={item.label}>
                  <div className="bg-white/5 px-7 py-8 transition-colors hover:bg-white/10">
                    <p className="text-[11px] tracking-[0.1em] text-white/40">{item.label}</p>
                    {'href' in item && item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-[14px] font-medium text-white/70 underline-offset-4 hover:text-white hover:underline"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-2 text-[14px] font-medium text-white/70">{item.value}</p>
                    )}
                  </div>
                </AnimatedGridItem>
              ))}
            </AnimatedGrid>
          </div>
        </div>
      </section>

    </PageShell>
  )
}
