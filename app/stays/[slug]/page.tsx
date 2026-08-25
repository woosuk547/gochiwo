import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PageShell } from '@/components/site/page-shell'
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from '@/components/motion/animated-sections'
import { getMockStay, mockStays } from '@/lib/mock-stays'

interface StayDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return mockStays.map((stay) => ({ slug: stay.slug }))
}

export async function generateMetadata({ params }: StayDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const stay = getMockStay(slug)
  if (!stay) return { title: '리포즈' }
  return {
    title: stay.name,
    description: stay.summary,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${stay.name} | 리포즈`,
      description: stay.summary,
      images: [stay.coverImage],
    },
  }
}

export default async function StayDetailPage({ params }: StayDetailPageProps) {
  const { slug } = await params
  const stay = getMockStay(slug)

  if (!stay) notFound()

  return (
    <PageShell>
      {/* 이미지 갤러리 */}
      <section className="px-5 pt-6 md:pt-8">
        <div className="mx-auto max-w-6xl">
          <AnimatedGrid staggerDelay={0.15} className="grid gap-3 md:grid-cols-2">
            <AnimatedGridItem>
              <div className="relative aspect-[4/3] overflow-hidden rounded-none">
                <Image src={stay.coverImage} alt={stay.name} fill className="object-cover" />
              </div>
            </AnimatedGridItem>
            <AnimatedGridItem>
              <div className="relative aspect-[4/3] overflow-hidden rounded-none">
                <Image src={stay.interiorImage} alt={`${stay.name} 내부`} fill className="object-cover" />
              </div>
            </AnimatedGridItem>
          </AnimatedGrid>
        </div>
      </section>

      {/* 정보 */}
      <section className="px-5 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <AnimatedSection>
                <span className="rounded-none bg-gray-100 px-2.5 py-1 text-[12px] font-medium text-gray-500">
                  {stay.badge}
                </span>
                <h1 className="mt-4 text-3xl font-bold text-[#1a1a1a] md:text-4xl">{stay.name}</h1>
                <p className="mt-4 text-[16px] leading-relaxed text-gray-600">{stay.intro}</p>
              </AnimatedSection>

              {/* 핵심 정보 */}
              <AnimatedGrid staggerDelay={0.06} className="mt-8 grid grid-cols-3 gap-3">
                {stay.facts.map((fact) => (
                  <AnimatedGridItem key={fact.label}>
                    <div className="rounded-none bg-gray-50 p-4">
                      <p className="text-[12px] font-medium text-gray-500">{fact.label}</p>
                      <p className="mt-1 text-[14px] font-semibold text-[#1a1a1a]">{fact.value}</p>
                    </div>
                  </AnimatedGridItem>
                ))}
              </AnimatedGrid>

              {/* 하이라이트 */}
              <AnimatedSection delay={0.2}>
                <div className="mt-8">
                  <h2 className="text-[16px] font-semibold text-[#1a1a1a]">특징</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {stay.highlights.map((item) => (
                      <span key={item} className="rounded-none border border-gray-200 bg-white px-3 py-1.5 text-[14px] text-gray-600 transition-colors duration-200 hover:border-gray-300 hover:bg-gray-50">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* 어메니티 */}
              <AnimatedSection delay={0.3}>
                <div className="mt-8">
                  <h2 className="text-[16px] font-semibold text-[#1a1a1a]">시설 · 어메니티</h2>
                  <ul className="mt-3 grid grid-cols-2 gap-2">
                    {stay.amenities.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[14px] text-gray-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            </div>

            {/* 예약 카드 (sticky) */}
            <AnimatedSection delay={0.2}>
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-none border border-gray-200 bg-white p-6">
                  <p className="text-[14px] text-gray-500">{stay.region} · {stay.category}</p>
                  <p className="mt-2 text-2xl font-bold text-[#1a1a1a]">{stay.price}<span className="text-[15px] font-normal text-gray-500">/박</span></p>
                  <p className="mt-1 text-[14px] text-gray-500">{stay.guests}</p>

                  <Link
                    href="/reservation"
                    className="mt-6 flex w-full items-center justify-center rounded-none bg-[#1a1a1a] py-3.5 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#333] active:scale-[0.97]"
                  >
                    날짜 선택하기
                  </Link>
                  <Link
                    href="/partnership"
                    className="mt-3 flex w-full items-center justify-center rounded-none border border-gray-300 py-3.5 text-[15px] font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 active:scale-[0.97]"
                  >
                    제휴 예약
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
