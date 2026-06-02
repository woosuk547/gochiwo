import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { PageShell } from '@/components/site/page-shell'
import { PartnershipContent } from '@/components/site/partnership-content'
import { getAvailabilitySnapshot } from '@/lib/reservation-service'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '제휴 예약 — 리포즈',
  description: '임직원 전용 요금, 촬영, VIP 일정을 위한 제휴 전용 예약. 12% 할인 · 법인 정산 지원.',
}

export default async function PartnershipPage() {
  const availability = await getAvailabilitySnapshot()

  return (
    <PageShell>
      <PageHero
        title="파트너를 위한 예약"
        description="임직원 12% 우대 혜택과 미디어 촬영 대관, 전담 법인 정산까지 기품 있게 맞춰 드려요."
        image="/repause/editorial-living.jpg"
        eyebrow="제휴 예약"
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
