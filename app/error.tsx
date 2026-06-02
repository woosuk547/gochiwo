'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page render error:', error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center text-[#1a1a1a]">
      <p className="text-[13px] font-medium tracking-[0.12em] text-gray-400">오류</p>
      <h1 className="mt-4 text-[clamp(2rem,5vw,3.5rem)] font-extralight leading-tight tracking-[-0.03em]">
        잠시 문제가 생겼어요
      </h1>
      <p className="mt-4 max-w-md text-[14px] leading-relaxed text-gray-500">
        예상치 못한 오류가 발생했어요. 잠시 후 다시 시도해 주세요.
      </p>
      <div className="mt-10 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="border border-[#1a1a1a] bg-[#1a1a1a] px-6 py-3 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-transparent hover:text-[#1a1a1a]"
        >
          다시 시도하기
        </button>
        <Link
          href="/"
          className="border border-gray-200 px-6 py-3 text-[13px] font-medium text-gray-600 transition-colors hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
        >
          홈으로 가기
        </Link>
      </div>
    </main>
  )
}
