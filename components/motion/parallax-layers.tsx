'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'

interface Layer {
  src: string
  speed: number
  zIndex: number
}

interface ParallaxLayersProps {
  layers: Layer[]
  title: string
  subtitle: string
  className?: string
}

export function ParallaxLayers({ layers, title, subtitle, className }: ParallaxLayersProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const textOpacity = useTransform(scrollYProgress, [0.25, 0.5], [0, 1])

  if (prefersReduced) {
    const lastLayer = layers[layers.length - 1]
    return (
      <section className={`relative overflow-hidden ${className ?? ''}`}>
        <div className="relative aspect-[16/10] md:aspect-[21/9]">
          <Image src={lastLayer.src} alt={title} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
            <p className="text-label text-white/50">{subtitle}</p>
            <h2 className="mt-3 font-serif text-section font-extralight tracking-[-0.025em] text-white">
              {title}
            </h2>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className={`relative min-h-[70vh] overflow-hidden md:min-h-[85vh] ${className ?? ''}`}>
      {layers.map((layer) => (
        <LayerImage key={layer.src} layer={layer} scrollYProgress={scrollYProgress} />
      ))}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-5 text-center">
        <motion.p style={{ opacity: textOpacity }} className="text-label text-white/50">
          {subtitle}
        </motion.p>
        <motion.h2
          style={{ opacity: textOpacity }}
          className="mt-3 font-serif text-section font-extralight tracking-[-0.025em] text-white"
        >
          {title}
        </motion.h2>
      </div>
    </section>
  )
}

function LayerImage({
  layer,
  scrollYProgress,
}: {
  layer: Layer
  scrollYProgress: MotionValue<number>
}) {
  const y = useTransform(scrollYProgress, [0, 1], [`${layer.speed * 80}px`, `-${layer.speed * 120}px`])

  return (
    <motion.div style={{ y, zIndex: layer.zIndex }} className="absolute inset-0">
      <Image src={layer.src} alt="" fill className="object-cover" sizes="100vw" />
    </motion.div>
  )
}
