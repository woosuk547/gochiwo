'use client'

import Script from 'next/script'
import { getNaverMapsScriptSrc } from '@/lib/naver-map-config'

interface NaverMapsScriptProps {
  ncpKeyId: string
}

export function NaverMapsScript({ ncpKeyId }: NaverMapsScriptProps) {
  if (!ncpKeyId) return null

  return (
    <Script
      id="naver-maps-sdk"
      src={getNaverMapsScriptSrc(ncpKeyId)}
      strategy="afterInteractive"
    />
  )
}
