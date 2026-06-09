import Link from 'next/link'
import type { Metadata } from 'next'
import { PageShell } from '@/components/site/page-shell'
import { FadeIn, TextReveal, ParallaxImage } from '@/components/motion'
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from '@/components/motion/animated-sections'
import { amenityGroups } from '@/lib/repause-content'
import { editorialBtnPrimary, editorialBtnOutline } from '@/lib/editorial'

export const metadata: Metadata = {
  title: '공간 소개 — 리포즈',
  description: '전면창 거실, 히노끼 욕조, 프라이빗 데크. 리포즈 포레스트 하우스의 객실과 시설을 살펴보세요.',
}

const spaceDetails = [
  {
    label: '거실',
    title: '전면창 거실',
    copy: '자연이 액자처럼 들어오는 거실. 깊은 소파와 낮은 조명 사이로 우리만의 시간이 천천히 시작돼요.',
    image: '/repause/editorial-living.jpg',
    reverse: false,
  },
  {
    label: '욕실',
    title: '히노끼 욕조',
    copy: '히노끼 향이 천천히 퍼지는 저녁. 반신욕이 하루의 마무리가 되는 공간이에요.',
    image: '/repause/editorial-bath.jpg',
    reverse: true,
  },
  {
    label: '침실',
    title: '침실',
    copy: '밤이 조용하고 깊어요. 잠드는 게 아깝다는 말을 자주 듣는 방이에요.',
    image: '/repause/editorial-bedroom.jpg',
    reverse: false,
  },
  {
    label: '데크',
    title: '프라이빗 데크',
    copy: '포치 아래 의자에 앉아 잠시 눈을 감아보세요. 마음이 차분해지며 고요한 명상에 잠기게 됩니다.',
    image: '/repause/editorial-deck.jpg',
    reverse: true,
  },
]

export default function SpacePage() {
  return (
    <PageShell>

      {/* ── 이미지 히어로 ─────────────────────────────────────────────── */}
      <section className="relative -mt-16 aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
        <ParallaxImage
          src="/repause/editorial-exterior.jpg"
          alt="리포즈 포레스트 하우스 외관"
          aspectRatioClassName=""
          className="absolute inset-0"
          priority
          revealDirection="center"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <FadeIn delay={0.1}>
            <p className="text-eyebrow text-white/70">프라이빗 포레스트 하우스</p>
          </FadeIn>
          <div className="overflow-hidden mt-3">
            <FadeIn delay={0.2} duration={0.9} distance={50}>
              <h1 className="text-[clamp(2.4rem,6vw,5rem)] font-extralight leading-tight tracking-[-0.02em] text-white">
                포레스트 하우스
              </h1>
            </FadeIn>
          </div>
          <FadeIn delay={0.45}>
            <p className="mt-4 text-[14px] leading-relaxed text-white/75 md:text-[15px]">
              바쁜 일상의 걸음을 잠시 멈추고, 공간 속에 내포된 고유한 감각을 천천히 묵상해 보세요.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── 브랜드 소개 텍스트 ────────────────────────────────────────── */}
      <section className="px-5 py-20 md:py-24">
        <div className="mx-auto max-w-4xl">
          <TextReveal>
            <p className="text-[clamp(1.3rem,2.5vw,2rem)] font-light leading-[1.8] tracking-[-0.025em] text-[#1a1a1a]">
              공간 안에서 마주하는 사색의 깊이가 길어질수록, 회복의 부피 또한 깊어집니다.<br />
              자연을 응시하는 거실에서 조용히 시작되어 깊은 수면, 히노끼 정화, 그리고 테라스 데크로 이어지는 유려한 여정을 경험해 보세요.
            </p>
          </TextReveal>

          <FadeIn delay={0.3}>
            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-gray-100 pt-8 md:grid-cols-4">
              {[
                { label: '전면창 거실', value: '자연을 응시하는 소파 라운지' },
                { label: '히노끼 욕조', value: '따뜻한 반신욕과 편백 향' },
                { label: '프라이빗 데크', value: '포치 아래 고요한 명상' },
                { label: '다이닝 & 키친', value: 'BBQ 존과 프라이빗 다이닝' },
              ].map((item) => (
                <div key={item.label} className="border-b border-gray-50 pb-4 md:border-b-0 md:pb-0">
                  <p className="text-eyebrow text-gray-500">{item.label}</p>
                  <p className="mt-1.5 text-[14px] font-semibold text-[#1a1a1a] tracking-tight">{item.value}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 공간별 교대 섹션 ──────────────────────────────────────────── */}
      {spaceDetails.map((space) => (
        <section key={space.label} className="border-t border-gray-100">
          <div className={`flex flex-col ${space.reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
            {/* 이미지 */}
            <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-[520px] md:w-1/2">
              <ParallaxImage
                src={space.image}
                alt={space.title}
                aspectRatioClassName=""
                className="absolute inset-0"
                revealDirection={space.reverse ? 'right' : 'left'}
              />
            </div>
            {/* 텍스트 */}
            <div className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2 md:px-14 md:py-16 lg:px-20">
              <FadeIn>
                <p className="text-eyebrow text-gray-500">{space.label}</p>
                <h2 className="mt-3 font-serif text-section font-extralight leading-tight tracking-[-0.025em] text-[#1a1a1a]">
                  {space.title}
                </h2>
                <p className="mt-5 text-[15px] leading-[1.8] tracking-tight text-gray-500">{space.copy}</p>
              </FadeIn>
            </div>
          </div>
        </section>
      ))}

      {/* ── 시설 · 어메니티 ────────────────────────────────────────────── */}
      <section className="bg-[#f8f8f8] px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <h2 className="font-serif text-section font-extralight tracking-[-0.02em] text-[#1a1a1a]">시설 · 어메니티</h2>
          </AnimatedSection>
          <AnimatedGrid staggerDelay={0.08} className="mt-12 grid gap-px border border-gray-200 md:grid-cols-3">
            {amenityGroups.map((group) => (
              <AnimatedGridItem key={group.title}>
                <div className="bg-white p-8 md:p-10">
                  <h3 className="text-[13px] font-semibold tracking-[0.05em] text-gray-400">{group.title}</h3>
                  <ul className="mt-5 space-y-3">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-[15px] text-[#1a1a1a]">
                        <span className="h-px w-4 shrink-0 bg-gray-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedGridItem>
            ))}
          </AnimatedGrid>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden aspect-[16/10] md:aspect-auto md:min-h-[480px]">
        <ParallaxImage
          src="/repause/editorial-kitchen.jpg"
          alt="리포즈 주방"
          aspectRatioClassName=""
          className="absolute inset-0"
          revealDirection="center"
        />
        <div className="absolute inset-0 bg-[#1a1a1a]/75" />
        <div className="relative px-5 py-24 text-center md:py-32">
          <TextReveal>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-light tracking-[-0.02em] text-white font-serif">
              지금, 우리만의 시간을 예약하세요
            </h2>
          </TextReveal>
          <FadeIn delay={0.3}>
            <p className="mt-4 text-[14px] text-white/65">가용 일정을 확인하고 바로 예약해 보세요.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/reservation" className={editorialBtnPrimary}>
                예약하기
              </Link>
              <Link href="/partnership" className={editorialBtnOutline}>
                제휴 · 대관 문의
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </PageShell>
  )
}
