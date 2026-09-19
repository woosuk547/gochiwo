import type { Metadata } from 'next'
import { PageShell } from '@/components/site/page-shell'
import { ReservationContent } from '@/components/site/reservation-content'
import { getAvailabilitySnapshot } from '@/lib/reservation-service'
import { publicPageMeta } from '@/lib/page-metadata'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = publicPageMeta(
  '예약',
  '날짜와 인원을 선택하면 예상 요금을 바로 확인할 수 있어요. 리포즈 프라이빗 독채 예약.',
  '/reservation',
)

export default async function ReservationPage() {
  const availability = await getAvailabilitySnapshot()

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-8 md:px-5 md:pb-10 md:pt-10">
        <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] font-extralight leading-tight tracking-[-0.04em] text-brand">
          예약
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-gray-500">
          날짜와 인원을 고르면 예상 요금을 바로 보여 드려요.
        </p>
        <div className="mt-8">
          <ReservationContent
            blockedDates={availability.blockedDates.map((item) => item.date)}
            reservedRanges={availability.reservations.map((item) => ({ checkIn: item.checkIn, checkOut: item.checkOut }))}
          />
        </div>
      </section>
    </PageShell>
  )
}
