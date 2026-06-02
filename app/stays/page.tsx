import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { PageShell } from '@/components/site/page-shell'
import { StayCard } from '@/components/site/stay-card'
import { AnimatedGrid, AnimatedGridItem } from '@/components/motion/animated-sections'
import { mockStays } from '@/lib/mock-stays'

export const metadata: Metadata = {
  title: '스테이 컬렉션 — 리포즈',
  description: '강원, 제주, 경주. 풍경이 다른 세 가지 프리미엄 독채 스테이를 둘러보세요.',
}

export default function StaysPage() {
  return (
    <PageShell>
      <PageHero
        title="스테이 컬렉션"
        description="지역과 풍경이 다른 프리미엄 독채를 둘러보세요."
      />

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <AnimatedGrid staggerDelay={0.12} className="grid gap-6 md:grid-cols-3">
          {mockStays.map((stay) => (
            <AnimatedGridItem key={stay.slug}>
              <StayCard stay={stay} />
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      </section>
    </PageShell>
  )
}
