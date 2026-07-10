import type { Metadata } from 'next'
import { PageShell } from '@/components/site/page-shell'
import { PageHero } from '@/components/site/page-hero'
import { MyReservationContent } from './my-reservation-content'

export const metadata: Metadata = {
  title: '예약 조회 — 리포즈',
  description: '예약 번호와 이메일로 리포즈 예약 상태를 확인하세요.',
}

export default function MyReservationPage() {
  return (
    <PageShell>
      <PageHero
        title="예약 조회"
        description="예약 번호와 이메일로 상태를 확인하세요."
      />

      <section className="mx-auto max-w-2xl px-4 py-10 md:px-6 md:py-16 lg:px-10 lg:py-20">
        <MyReservationContent />
      </section>
    </PageShell>
  )
}
