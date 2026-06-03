'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { siteNavigation } from '@/lib/repause-content'

interface SiteHeaderProps {
  overlay?: boolean
}

export function SiteHeader({ overlay = false }: SiteHeaderProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const solidHeader = !overlay || scrolled || menuOpen

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        solidHeader
          ? 'border-b border-gray-100 bg-white/80 backdrop-blur-md'
          : 'bg-gradient-to-b from-black/50 via-black/15 to-transparent'
      }`}
    >
      <div className={`mx-auto flex h-16 max-w-6xl items-center justify-between px-5 transition-all duration-500 ${!solidHeader ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]' : ''}`}>
        <Link href="/" className="flex items-center py-1">
          <div className="relative h-12 w-28">
            <Image
              src="/repause/logo-header.png"
              alt="Repause"
              fill
              className={`object-contain scale-[1.85] translate-y-[-1px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                solidHeader
                  ? 'mix-blend-multiply'
                  : 'brightness-0 invert mix-blend-screen'
              }`}
              priority
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {siteNavigation.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-[14px] font-medium tracking-tight transition-colors rounded-none ${
                  active
                    ? solidHeader ? 'font-semibold text-[#1a1a1a]' : 'font-semibold text-white'
                    : solidHeader ? 'text-gray-600 hover:text-[#1a1a1a]' : 'text-white/80 hover:text-white'
                }`}
              >
                {item.label}
                {active && (
                  <span className={`absolute bottom-0.5 left-4 right-4 h-px ${solidHeader ? 'bg-[#1a1a1a]' : 'bg-white'}`} />
                )}
              </Link>
            )
          })}
          <Link
            href="/reservation"
            className={`ml-3 px-5 py-2 text-[13px] font-semibold tracking-wide transition-all duration-300 rounded-none border ${
              solidHeader
                ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white hover:bg-transparent hover:text-[#1a1a1a]'
                : 'border-white bg-white text-[#1a1a1a] hover:bg-transparent hover:text-white'
            }`}
          >
            예약하기
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-none lg:hidden"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <div className="flex flex-col gap-[5px]" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`block h-[1.5px] w-5 transition-all duration-300 ${solidHeader ? 'bg-[#1a1a1a]' : 'bg-white'} ${
                  menuOpen && i === 0 ? 'translate-y-[6.5px] rotate-45' : ''
                } ${menuOpen && i === 1 ? 'opacity-0' : ''} ${
                  menuOpen && i === 2 ? '-translate-y-[6.5px] -rotate-45' : ''
                }`}
              />
            ))}
          </div>
        </button>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 right-0 top-16 z-50 lg:hidden"
            id="mobile-menu"
          >
            <div className="border-b border-gray-100 bg-white px-5 py-6 shadow-xl rounded-none">
              <nav className="flex flex-col gap-1.5">
                {siteNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-3.5 text-[15px] font-medium transition-colors rounded-none ${
                      pathname === item.href ? 'bg-gray-50 font-semibold text-[#1a1a1a]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/reservation"
                  className="mt-4 flex items-center justify-center border border-[#1a1a1a] bg-[#1a1a1a] px-4 py-4 text-[14px] font-semibold tracking-wide text-white rounded-none transition-all duration-300 hover:bg-transparent hover:text-[#1a1a1a]"
                  onClick={() => setMenuOpen(false)}
                >
                  예약하기
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
