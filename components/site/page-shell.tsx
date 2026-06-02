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
    <div className={`min-h-screen bg-white text-[#1a1a1a] ${className ?? ''}`}>
      <SiteHeader overlay={overlayHeader} />
      <PageTransition>
        {children}
      </PageTransition>
      <SiteFooter />
    </div>
  )
}
