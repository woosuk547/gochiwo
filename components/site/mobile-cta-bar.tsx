'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function MobileCTABar() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  const hideOnPages = ['/reservation', '/partnership', '/payment', '/admin']
  const shouldHide = hideOnPages.some((p) => pathname.startsWith(p))

  useEffect(() => {
    if (shouldHide) return
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [shouldHide])

  return (
    <AnimatePresence>
      {!shouldHide && visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 px-5 backdrop-blur-md lg:hidden"
        >
          <Link
            href="/reservation"
            className="flex h-12 w-full items-center justify-center rounded-none border border-[#1a1a1a] bg-[#1a1a1a] text-[14px] font-bold tracking-wider text-white transition-all duration-300 hover:bg-transparent hover:text-[#1a1a1a] active:scale-[0.98]"
          >
            예약하기
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
