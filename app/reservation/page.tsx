import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { PageShell } from '@/components/site/page-shell'
import { ReservationContent } from '@/components/site/reservation-content'
import { getAvailabilitySnapshot } from '@/lib/reservation-service'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '예약 — 리포즈',
  description: '날짜와 인원을 선택하면 예상 요금을 바로 확인할 수 있어요. 리포즈 프라이빗 독채 예약.',
}

export default async function ReservationPage() {
  const availability = await getAvailabilitySnapshot()

  return (
    <PageShell>
      <PageHero
        title="예약하기"
        description="날짜와 인원을 선택하시면 예상 요금을 바로 확인할 수 있어요."
        image="/repause/editorial-bedroom.jpg"
        eyebrow="예약"
      />

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-5 md:py-12 lg:py-16">
        <ReservationContent
          blockedDates={availability.blockedDates.map((item) => item.date)}
          reservedRanges={availability.reservations.map((item) => ({ checkIn: item.checkIn, checkOut: item.checkOut }))}
        />
      </section>
    </PageShell>
  )
}
