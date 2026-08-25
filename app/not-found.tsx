import type { Metadata } from 'next'
import Link from 'next/link'
import { noIndexRobots } from '@/lib/page-metadata'

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없어요',
  robots: noIndexRobots,
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center text-[#1a1a1a]">
      <p className="text-[13px] font-medium tracking-[0.12em] text-gray-500">404</p>
      <h1 className="mt-4 text-[clamp(2rem,5vw,3.5rem)] font-extralight leading-tight tracking-[-0.03em]">
        길을 잃으셨네요
      </h1>
      <p className="mt-4 max-w-md text-[14px] leading-relaxed text-gray-500">
        찾으시는 페이지가 사라졌거나 주소가 바뀌었어요. 홈에서 다시 시작해 주세요.
      </p>
      <div className="mt-10 flex items-center gap-3">
        <Link
          href="/"
          className="border border-[#1a1a1a] bg-[#1a1a1a] px-6 py-3 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-transparent hover:text-[#1a1a1a]"
        >
          홈으로 가기
        </Link>
        <Link
          href="/reservation"
          className="border border-gray-200 px-6 py-3 text-[13px] font-medium text-gray-600 transition-colors hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
        >
          예약하기
        </Link>
      </div>
    </main>
  )
}
