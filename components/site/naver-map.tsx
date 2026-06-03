/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    naver?: any
  }
}

interface NaverMapProps {
  ncpKeyId?: string
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
  ncpKeyId = '',
  latitude = 37.721200,
  longitude = 127.653400,
  zoom = 14,
  title = '리포즈 포레스트 하우스',
  address = '강원 홍천군 서면 숲속길 21',
}: NaverMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [useFallback, setUseFallback] = useState(!ncpKeyId)

  useEffect(() => {
    if (!ncpKeyId) {
      setUseFallback(true)
      return
    }

    setUseFallback(false)
    setMapLoaded(false)
    initializedRef.current = false

    let mapInstance: any = null
    let markerInstance: any = null

    const initializeMap = () => {
      if (initializedRef.current || typeof window === 'undefined' || !mapContainerRef.current) {
        return
      }

      if (!window.naver?.maps?.Map) {
        return
      }

      try {
        const center = new window.naver.maps.LatLng(latitude, longitude)

        mapInstance = new window.naver.maps.Map(mapContainerRef.current, {
          center,
          zoom,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.RIGHT_CENTER,
            style: window.naver.maps.ZoomControlStyle.SMALL,
          },
          mapTypeControl: false,
          scaleControl: false,
          logoControl: true,
          logoControlOptions: {
            position: window.naver.maps.Position.BOTTOM_LEFT,
          },
        })

        const markerContent = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: rgba(26, 26, 26, 0.10); border-radius: 50%; border: 1px solid rgba(26, 26, 26, 0.18);">
            <div style="width: 14px; height: 14px; background: #1a1a1a; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.18);"></div>
            <div style="position: absolute; bottom: -28px; white-space: nowrap; background: #1a1a1a; color: #ffffff; font-family: sans-serif; font-size: 11px; letter-spacing: 0.15em; padding: 4px 10px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); font-weight: 600;">
              REPAUSE
            </div>
          </div>
        `

        markerInstance = new window.naver.maps.Marker({
          position: center,
          map: mapInstance,
          icon: {
            content: markerContent,
            size: new window.naver.maps.Size(44, 44),
            anchor: new window.naver.maps.Point(22, 22),
          },
        })

        initializedRef.current = true
        setMapLoaded(true)
      } catch (err) {
        console.error('Failed to initialize Naver Map:', err)
        setUseFallback(true)
      }
    }

    const interval = setInterval(() => {
      initializeMap()
      if (initializedRef.current) {
        clearInterval(interval)
      }
    }, 400)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (!initializedRef.current) {
        setUseFallback(true)
      }
    }, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
      if (markerInstance) markerInstance.setMap(null)
      if (mapInstance) mapInstance.destroy?.()
    }
  }, [latitude, longitude, zoom, ncpKeyId])

  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(address)}`

  return (
    <div className="relative overflow-hidden rounded-none border border-gray-200 bg-gray-50">
      {useFallback ? (
        <OpenStreetMapFallback latitude={latitude} longitude={longitude} title={title} />
      ) : (
        <>
          <div
            ref={mapContainerRef}
            className="h-[380px] w-full md:h-[460px]"
            style={{ filter: 'grayscale(10%) contrast(98%)' }}
          />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
              <span className="text-[13px] text-gray-400 animate-pulse">지도 로딩 중</span>
            </div>
          )}
        </>
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
