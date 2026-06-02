import { Suspense } from 'react'
import Link from 'next/link'
import { PageShell } from '@/components/site/page-shell'
import { PageHero } from '@/components/site/page-hero'
import { Button } from '@/components/ui/button'
import { contactInfo } from '@/lib/repause-content'
import PaymentFailContent from './payment-fail-content'

export default function PaymentFailPage() {
  return (
    <PageShell>
      <PageHero
        title="결제 실패"
        description=""
      />
      <section className="mx-auto max-w-2xl px-4 py-10 md:px-6 md:py-16 lg:px-10 lg:py-20">
        <Suspense fallback={
          <div className="rounded-none border border-gray-200 bg-white p-5 text-center md:p-8">
            <p className="text-gray-400 text-sm">불러오는 중...</p>
          </div>
        }>
          <PaymentFailContent contactEmail={contactInfo.email} />
        </Suspense>
      </section>
    </PageShell>
  )
}
