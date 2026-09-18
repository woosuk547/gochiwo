import { guestReviews } from '@/lib/reviews'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'

export function GuestReviews() {
  if (guestReviews.length === 0) return null

  return (
    <section className="border-t border-gray-100 px-5 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="text-label text-gray-500">방문 후기</p>
          <h2 className="mt-3 font-serif text-section font-extralight tracking-[-0.025em] text-[#1a1a1a]">
            머물다 간 이야기
          </h2>
        </FadeIn>
        <StaggerContainer className="mt-14 grid gap-0 md:grid-cols-3">
          {guestReviews.map((review) => (
            <StaggerItem key={`${review.guestLabel}-${review.stayedAt}`}>
              <figure className="border-t border-gray-100 py-8 md:border-l md:border-t-0 md:py-0 md:pl-8 md:pr-8 md:first:border-l-0 md:first:pl-0">
                <blockquote className="font-serif text-[1.15rem] font-light leading-[1.8] tracking-[-0.02em] text-[#1a1a1a]">
                  {review.quote}
                </blockquote>
                <figcaption className="mt-4 text-[13px] text-gray-500">
                  {review.guestLabel} · {review.stayedAt}
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
