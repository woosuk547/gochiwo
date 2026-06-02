'use client'

import { type ReactNode } from 'react'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
  return (
    <FadeIn delay={delay} className={className}>
      {children}
    </FadeIn>
  )
}

interface AnimatedGridProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function AnimatedGrid({ children, className, staggerDelay = 0.08 }: AnimatedGridProps) {
  return (
    <StaggerContainer staggerDelay={staggerDelay} className={className}>
      {children}
    </StaggerContainer>
  )
}

export function AnimatedGridItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <StaggerItem className={className}>
      {children}
    </StaggerItem>
  )
}

export { FadeIn, StaggerContainer, StaggerItem }
