'use client'

import { useState } from 'react'

interface NaverMapProps {
  latitude?: number
  longitude?: number
  zoom?: number
  title?: string
  address?: string
}

function OpenStreetMapFallback({
  latitude,
  longitude,
  title,
}: {
  latitude: number
  longitude: number
  title: string
}) {
  const delta = 0.015
  const bbox = [longitude - delta, latitude - delta, longitude + delta, latitude + delta].join(',')
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude}%2C${longitude}`

  return (
    <iframe
      title={`${title} 위치`}
      src={src}
      className="h-[380px] w-full border-0 md:h-[460px]"
      style={{ filter: 'grayscale(10%) contrast(98%)' }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}

export function NaverMap({
  latitude = 37.721200,
  longitude = 127.653400,
  zoom = 14,
  title = '리포즈 프라이빗 독채',
  address = '강원 홍천군 서면 숲속길 21',
}: NaverMapProps) {
  const [useFallback, setUseFallback] = useState(false)
  const staticMapSrc = `/api/map/static?lat=${latitude}&lng=${longitude}&w=800&h=460&level=${zoom}`
  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(address)}`

  return (
    <div className="relative overflow-hidden rounded-none border border-gray-200 bg-gray-50">
      {useFallback ? (
        <OpenStreetMapFallback latitude={latitude} longitude={longitude} title={title} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={staticMapSrc}
          alt={`${title} 위치 지도`}
          width={800}
          height={460}
          className="h-[380px] w-full object-cover md:h-[460px]"
          style={{ filter: 'grayscale(10%) contrast(98%)' }}
          loading="lazy"
          onError={() => setUseFallback(true)}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-3 text-[13px]">
        <div>
          <p className="font-semibold text-[#1a1a1a]">{title}</p>
          <p className="mt-0.5 text-gray-500">{address}</p>
        </div>
        <a
          href={naverMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center border border-[#1a1a1a] px-4 py-2 text-[12px] font-semibold tracking-wide text-[#1a1a1a] transition-colors hover:bg-[#1a1a1a] hover:text-white"
        >
          네이버 지도에서 보기
        </a>
      </div>
    </div>
  )
}
