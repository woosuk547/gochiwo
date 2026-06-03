'use client'

import { type ReactNode } from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useRef } from 'react'

type EasingArray = [number, number, number, number]
const EASE_OUT_QUART: EasingArray = [0.25, 1, 0.5, 1]
const EASE_OUT_EXPO: EasingArray = [0.16, 1, 0.3, 1]

// ─── TextReveal: clip-path 마스크 reveal ───────────────────────────────────
interface TextRevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function TextReveal({ children, delay = 0, className }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div ref={ref} className={className}>{children}</div>
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ''}`}>
      <motion.div
        initial={{ y: '105%' }}
        animate={isInView ? { y: '0%' } : { y: '105%' }}
        transition={{ duration: 0.7, delay, ease: EASE_OUT_EXPO }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// ─── FadeIn ────────────────────────────────────────────────────────────────
interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  once?: boolean
  className?: string
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 30,
  once = true,
  className,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '-60px' })
  const prefersReduced = useReducedMotion()

  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  }

  if (prefersReduced) {
    return <div ref={ref} className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directionMap[direction] }}
      transition={{ duration, delay, ease: EASE_OUT_QUART }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── StaggerContainer ──────────────────────────────────────────────────────
interface StaggerContainerProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
  once?: boolean
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
  once = true,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '-60px' })
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div ref={ref} className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── StaggerItem ───────────────────────────────────────────────────────────
interface StaggerItemProps {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
}

export function StaggerItem({
  children,
  className,
  direction = 'up',
  distance = 24,
}: StaggerItemProps) {
  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, ...directionMap[direction] },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration: 0.5, ease: EASE_OUT_QUART },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── ScaleIn ───────────────────────────────────────────────────────────────
interface ScaleInProps {
  children: ReactNode
  delay?: number
  className?: string
  once?: boolean
}

export function ScaleIn({ children, delay = 0, className, once = true }: ScaleInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '-60px' })
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div ref={ref} className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT_QUART }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── PageTransition ────────────────────────────────────────────────────────
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── CountUp ───────────────────────────────────────────────────────────────
interface CountUpProps {
  value: number
  className?: string
}

export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      className={className}
    >
      {isInView ? value.toLocaleString() : '0'}
    </motion.span>
  )
}

// ─── Parallax ──────────────────────────────────────────────────────────────
interface ParallaxProps {
  children: ReactNode
  speed?: number
  className?: string
}

export function Parallax({ children, speed = 0.3, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 60}px`, `-${speed * 60}px`])

  if (prefersReduced) {
    return <div ref={ref} className={className}>{children}</div>
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

export { motion, EASE_OUT_QUART, EASE_OUT_EXPO, useScroll, useTransform }
export { ParallaxImage } from './parallax-image'
export { ParallaxLayers } from './parallax-layers'
