'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { EASE_OUT_QUART } from '@/components/motion'
import { contactInfo } from '@/lib/repause-content'
import { InstagramIcon } from '@/components/site/instagram-icon'

export function KakaoChannelButton() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const kakaoChannelUrl = 'https://pf.kakao.com/_repause'

  const hideOnPages = ['/reservation', '/partnership', '/payment', '/admin']
  const hasMobileCTABar = !hideOnPages.some((p) => pathname.startsWith(p))

  return (
    <div className={`fixed right-5 z-40 flex flex-col items-end gap-3 transition-all duration-300 ${
      hasMobileCTABar
        ? 'bottom-[calc(92px+env(safe-area-inset-bottom))] lg:bottom-6'
        : 'bottom-[calc(16px+env(safe-area-inset-bottom))] lg:bottom-6'
    }`}>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.25, ease: EASE_OUT_QUART }}
            className="rounded-none border border-gray-200 bg-white p-4 shadow-lg max-w-[240px]"
          >
            <p className="text-[13px] font-semibold text-brand">문의하기</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
              궁금한 점을 카카오톡으로 편하게 물어보세요.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href={kakaoChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-none bg-[#FEE500] px-4 py-2.5 text-[13px] font-semibold text-[#3C1E1E] transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M9 1C4.58 1 1 3.79 1 7.21c0 2.17 1.45 4.08 3.63 5.17l-.93 3.42c-.08.3.26.54.52.37l4.1-2.72c.22.02.44.03.68.03 4.42 0 8-2.79 8-6.27C17 3.79 13.42 1 9 1z" fill="#3C1E1E"/>
                </svg>
                카카오톡 상담
              </Link>
              <Link
                href={contactInfo.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-none border border-gray-200 px-4 py-2.5 text-[13px] font-medium text-brand transition-colors hover:bg-brand hover:text-white active:scale-[0.97]"
              >
                <InstagramIcon size={16} />
                인스타그램 보기
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsExpanded((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        animate={{ rotate: isExpanded ? 90 : 0 }}
        transition={{ duration: 0.25, ease: EASE_OUT_QUART }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg"
        aria-label="문의하기"
      >
        {isExpanded ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </motion.button>
    </div>
  )
}
