import { notFound } from 'next/navigation'
import { PageShell } from '@/components/site/page-shell'
import { PageHero } from '@/components/site/page-hero'
import { PaymentCheckout } from '@/components/site/payment-checkout'
import { prisma } from '@/lib/prisma'
import { serializeReservation } from '@/lib/reservation-service'

export const dynamic = 'force-dynamic'

interface PaymentPageProps {
  params: Promise<{ id: string }>
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params

  const reservationData = await prisma.reservation.findUnique({
    where: { id },
  })

  if (!reservationData) {
    notFound()
  }

  const reservation = serializeReservation(reservationData)

  return (
    <PageShell>
      <PageHero
        title="결제"
        description="예약 정보를 확인하고 결제를 진행하세요."
        image="/repause/editorial-living.jpg"
      />

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-16 lg:px-10 lg:py-20">
        <PaymentCheckout reservation={reservation} />
      </section>
    </PageShell>
  )
}
