'use client'

import { useState, type MouseEvent } from 'react'
import Image from 'next/image'
import { useReducedMotion } from 'framer-motion'
import { editorialBtnOutline } from '@/lib/editorial'

export function HeroVideo() {
  const prefersReducedMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)

  if (prefersReducedMotion) {
    return (
      <Image
        src="/repause/hero-exterior.jpg"
        alt="리포즈 프라이빗 독채"
        fill
        className="pointer-events-none object-cover"
        priority
        sizes="100vw"
      />
    )
  }

  function togglePlayback(event: MouseEvent<HTMLButtonElement>) {
    const video = event.currentTarget.parentElement?.querySelector('video')
    if (!video) return
    if (video.paused) {
      void video.play()
      setPaused(false)
    } else {
      video.pause()
      setPaused(true)
    }
  }

  return (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-label="리포즈 프라이빗 독채 소개 영상"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        poster="/repause/hero-exterior.jpg"
      >
        <source src="/repause/hero.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={togglePlayback}
        aria-pressed={paused}
        aria-label={paused ? '영상 재생' : '영상 일시정지'}
        className={`${editorialBtnOutline} pointer-events-auto absolute bottom-[calc(96px+env(safe-area-inset-bottom))] left-5 z-20 px-4 text-[13px] lg:bottom-6`}
      >
        {paused ? '재생' : '일시정지'}
      </button>
    </>
  )
}
