'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, ShieldCheck } from 'lucide-react'

export default function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: '홈',
      href: '/',
      icon: Home,
      active: pathname === '/',
    },
    {
      name: '수리요청',
      href: '/request',
      icon: FileText,
      active: pathname === '/request',
    },
    {
      name: '관리자',
      href: '/admin',
      icon: ShieldCheck,
      active: pathname === '/admin',
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                item.active
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${item.active ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-xs ${item.active ? 'font-semibold' : 'font-medium'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
