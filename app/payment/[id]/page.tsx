import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PageShell } from '@/components/site/page-shell'
import { PageHero } from '@/components/site/page-hero'
import { PaymentCheckout } from '@/components/site/payment-checkout'
import { PaymentEmailGate } from '@/components/site/payment-email-gate'
import { prisma } from '@/lib/prisma'
import { expireStalePendingReservations, serializeReservation } from '@/lib/reservation-service'
import { noIndexRobots } from '@/lib/page-metadata'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '결제',
  robots: noIndexRobots,
}

interface PaymentPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string }>
}

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {
  const { id } = await params
  const { email: emailParam } = await searchParams

  await expireStalePendingReservations()

  const reservationData = await prisma.reservation.findUnique({
    where: { id },
  })

  if (!reservationData) {
    notFound()
  }

  const email = typeof emailParam === 'string' ? emailParam.trim().toLowerCase() : ''
  const verified = Boolean(email && email === reservationData.email.toLowerCase())
  const emailMismatch = Boolean(email && !verified)

  if (!verified) {
    return (
      <PageShell>
        <PageHero
          title="결제"
          description="예약을 확인할 이메일을 입력해 주세요."
          image="/repause/editorial-living.jpg"
        />
        <section className="mx-auto max-w-md px-4 py-10 md:px-6 md:py-16">
          <PaymentEmailGate reservationId={id} initialError={emailMismatch ? '예약 정보와 이메일이 일치하지 않아요.' : ''} />
        </section>
      </PageShell>
    )
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
