import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { PageShell } from '@/components/site/page-shell'
import { AnimatedGrid, AnimatedGridItem } from '@/components/motion/animated-sections'
import { noticeEntries } from '@/lib/repause-brand-content'

import { publicPageMeta } from '@/lib/page-metadata'

export const metadata: Metadata = publicPageMeta(
  '공지사항',
  '예약과 운영에 관한 소식을 안내해요.',
  '/notices',
)

export default function NoticesPage() {
  return (
    <PageShell>
      <PageHero
        title="공지사항"
        description="예약과 운영에 관한 소식을 안내해요."
      />

      <section className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        <AnimatedGrid staggerDelay={0.08} className="space-y-4">
          {noticeEntries.map((notice) => (
            <AnimatedGridItem key={notice.title}>
              <article className="rounded-none border border-gray-200 bg-white p-6 transition-colors duration-300 hover:border-gray-300">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-500">{notice.category}</span>
                  <span className="text-[13px] text-gray-500">{notice.date}</span>
                </div>
                <h2 className="mt-3 text-[17px] font-bold text-[#1a1a1a]">{notice.title}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-gray-500">{notice.summary}</p>
              </article>
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      </section>
    </PageShell>
  )
}
