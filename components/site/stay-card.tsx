import Image from 'next/image'
import Link from 'next/link'
import type { MockStay } from '@/lib/mock-stays'

interface StayCardProps {
  stay: MockStay
}

export function StayCard({ stay }: StayCardProps) {
  return (
    <article className="group overflow-hidden rounded-none border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand">
      <Link href={`/stays/${stay.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={stay.coverImage}
            alt={stay.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        </div>
        <div className="p-5">
          <span className="rounded-none bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            {stay.badge}
          </span>
          <h3 className="mt-2 text-[17px] font-bold text-brand">{stay.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-gray-500">{stay.summary}</p>
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-[13px] text-gray-500">{stay.region} · {stay.guests}</span>
            <span className="text-[14px] font-semibold text-brand">{stay.price}~</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
