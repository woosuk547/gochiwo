'use client'

import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { PageTransition } from '@/components/motion'

interface PageShellProps {
  children: ReactNode
  overlayHeader?: boolean
  className?: string
}

export function PageShell({ children, overlayHeader = false, className }: PageShellProps) {
  return (
    <div className={`min-h-screen bg-white text-brand ${className ?? ''}`}>
      <a href="#main" className="skip-link">
        본문으로 건너뛰기
      </a>
      <SiteHeader overlay={overlayHeader} />
      <PageTransition>
        <main id="main">{children}</main>
      </PageTransition>
      <SiteFooter />
    </div>
  )
}
