import { Suspense } from 'react'
import type { Metadata } from 'next'
import { PageShell } from '@/components/site/page-shell'
import { PageHero } from '@/components/site/page-hero'
import { PaymentSuccessContent } from './payment-success-content'
import { noIndexRobots } from '@/lib/page-metadata'

export const metadata: Metadata = {
  title: '결제 완료',
  robots: noIndexRobots,
}

export default function PaymentSuccessPage() {
  return (
    <PageShell>
      <PageHero title="결제 처리" />

      <section className="mx-auto max-w-2xl px-4 py-10 md:px-6 md:py-16 lg:px-10 lg:py-20">
        <Suspense
          fallback={
            <div className="rounded-none border border-gray-200 bg-white p-8 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-[#1a1a1a]" />
              <p className="mt-4 text-[14px] text-gray-500">결제 정보 확인 중...</p>
            </div>
          }
        >
          <PaymentSuccessContent />
        </Suspense>
      </section>
    </PageShell>
  )
}
