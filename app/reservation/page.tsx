import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { PageShell } from '@/components/site/page-shell'
import { ReservationContent } from '@/components/site/reservation-content'
import { getAvailabilitySnapshot } from '@/lib/reservation-service'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '예약 — 리포즈',
  description: '머무실 일정과 인원을 가늠하시면 고유한 여정 정산 금액이 정교하게 산정됩니다. REPAUSE 안식 설계.',
}

export default async function ReservationPage() {
  const availability = await getAvailabilitySnapshot()

  return (
    <PageShell>
      <PageHero
        title="머무실 날을 가만히 가늠해 보세요"
        description="원하시는 일정을 조심히 남겨 주시면 중복되지 않는 온전한 여정의 여백을 기품 있게 정비해 드립니다."
        image="/repause/editorial-bedroom.jpg"
        eyebrow="예약하기"
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
