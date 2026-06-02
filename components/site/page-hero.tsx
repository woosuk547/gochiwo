'use client'

import Image from 'next/image'
import { FadeIn, TextReveal } from '@/components/motion'

interface PageHeroProps {
  title: string
  description?: string
  eyebrow?: string
  image?: string
}

export function PageHero({ title, description, eyebrow, image }: PageHeroProps) {
  if (image) {
    return (
      <section className="relative -mt-16 flex min-h-[45vh] items-end overflow-hidden md:min-h-[55vh]">
        <Image src={image} alt={title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-12 md:pb-16">
          {eyebrow && (
            <FadeIn delay={0.05}>
              <p className="text-[11px] tracking-[0.2em] text-white/40 uppercase">{eyebrow}</p>
            </FadeIn>
          )}
          <div className="overflow-hidden mt-2">
            <FadeIn delay={0.15} duration={0.8} distance={40}>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] font-extralight leading-tight tracking-[-0.04em] text-white">
                {title}
              </h1>
            </FadeIn>
          </div>
          {description && (
            <FadeIn delay={0.35}>
              <p className="mt-3 text-[15px] leading-relaxed text-white/60 md:max-w-lg">{description}</p>
            </FadeIn>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="border-b border-gray-100 px-5 pb-10 pt-28 md:pb-14 md:pt-32">
      <div className="mx-auto max-w-6xl">
        {eyebrow && (
          <FadeIn delay={0.05} distance={12}>
            <p className="text-[11px] tracking-[0.15em] text-gray-400 uppercase">{eyebrow}</p>
          </FadeIn>
        )}
        <div className="overflow-hidden mt-3">
          <FadeIn delay={0.1} duration={0.7} distance={40}>
            <h1 className="text-[clamp(2.2rem,5vw,3.5rem)] font-extralight leading-tight tracking-[-0.04em] text-[#1a1a1a]">
              {title}
            </h1>
          </FadeIn>
        </div>
        {description && (
          <FadeIn delay={0.25} distance={16}>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-gray-500">{description}</p>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
