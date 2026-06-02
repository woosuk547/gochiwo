'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion, useInView } from 'framer-motion'
import Image from 'next/image'

interface ParallaxImageProps {
  src: string
  alt: string
  aspectRatioClassName?: string // e.g. "aspect-[16/9]" or "aspect-[4/3]"
  className?: string
  priority?: boolean
  revealDirection?: 'center' | 'left' | 'right' | 'up' | 'down'
}

export function ParallaxImage({
  src,
  alt,
  aspectRatioClassName = "aspect-video",
  className = "",
  priority = false,
  revealDirection = 'center',
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const isInView = useInView(containerRef, { once: true, margin: '-10% 0px -10% 0px' })

  // 스크롤 트래킹 (컨테이너가 뷰포트 진입해서 나갈 때까지)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // 스크롤 속도에 반응한 미세 줌 패럴랙스 (1.0에서 1.08까지 자연스러운 줌인)
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.1])
  // 수직 역방향 흐름 패럴랙스 (Y축으로 미세 이동)
  const imageY = useTransform(scrollYProgress, [0, 1], ['-4%', '4%'])

  // 1. 하이엔드 센터-아웃 및 다양한 리빌 마스크 정의
  const masks = {
    center: {
      initial: { clipPath: 'inset(0% 50% 0% 50%)' },
      animate: isInView ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(0% 50% 0% 50%)' },
    },
    left: {
      initial: { clipPath: 'inset(0% 100% 0% 0%)' },
      animate: isInView ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(0% 100% 0% 0%)' },
    },
    right: {
      initial: { clipPath: 'inset(0% 0% 0% 100%)' },
      animate: isInView ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(0% 0% 0% 100%)' },
    },
    up: {
      initial: { clipPath: 'inset(100% 0% 0% 0%)' },
      animate: isInView ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(100% 0% 0% 0%)' },
    },
    down: {
      initial: { clipPath: 'inset(0% 0% 100% 0%)' },
      animate: isInView ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(0% 0% 100% 0%)' },
    },
  }

  const activeMask = masks[revealDirection]

  // 모션 감소 설정을 존중하는 가벼운 레이아웃 리턴
  if (prefersReduced) {
    return (
      <div ref={containerRef} className={`relative overflow-hidden ${aspectRatioClassName} ${className}`}>
        <Image src={src} alt={alt} fill className="object-cover" priority={priority} />
      </div>
    )
  }

  const isAbsolute = className.includes('absolute')

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${isAbsolute ? '' : 'relative w-full'} ${aspectRatioClassName} ${className}`}
    >
      <motion.div
        initial={activeMask.initial}
        animate={activeMask.animate}
        transition={{
          duration: 1.1,
          ease: [0.16, 1, 0.3, 1], // EASE_OUT_EXPO 느낌의 부드러운 감속
        }}
        className="w-full h-full relative overflow-hidden"
      >
        <motion.div
          style={{
            scale: imageScale,
            y: imageY,
          }}
          className="absolute inset-0 w-full h-[112%] top-[-6%]" // y 미세 이동을 위해 위아래 버퍼 확보
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            priority={priority}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
