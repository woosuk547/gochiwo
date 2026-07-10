import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { PageShell } from '@/components/site/page-shell'
import { PartnershipContent } from '@/components/site/partnership-content'
import { getAvailabilitySnapshot } from '@/lib/reservation-service'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '제휴 및 대관 — 리포즈',
  description: '임직원 전용 요금 혜택 및 미디어 상업 촬영 대관 가이드. 법인 정산 및 전문 디렉팅 협의.',
}

export default async function PartnershipPage() {
  const availability = await getAvailabilitySnapshot()

  return (
    <PageShell>
      <PageHero
        title="제휴 · 대관"
        description="임직원 우대와 미디어 촬영 대관을 안내해요."
        image="/repause/editorial-living.jpg"
      />

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-5 md:py-12 lg:py-16">
        <PartnershipContent
          blockedDates={availability.blockedDates.map((item) => item.date)}
          reservedRanges={availability.reservations.map((item) => ({ checkIn: item.checkIn, checkOut: item.checkOut }))}
        />
      </section>
    </PageShell>
  )
}
