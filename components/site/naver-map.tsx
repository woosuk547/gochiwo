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

export function NaverMap({
  ncpKeyId = '',
  latitude = 37.721200,
  longitude = 127.653400,
  zoom = 14,
  title = '리포즈 포레스트 하우스',
  address = '강원 홍천군 서면 숲속길 21',
}: NaverMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!ncpKeyId) {
      setError(true)
      return
    }

    let mapInstance: any = null
    let markerInstance: any = null

    const initializeMap = () => {
      if (typeof window === 'undefined' || !window.naver || !mapContainerRef.current) {
        return
      }

      try {
        const center = new window.naver.maps.LatLng(latitude, longitude)
        
        // 지도 초기화
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

        // 커스텀 프리미엄 마커 (조용하고 미니멀한 에디토리얼 스타일)
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

        setMapLoaded(true)
      } catch (err) {
        console.error('Failed to initialize Naver Map:', err)
        setError(true)
      }
    }

    // 윈도우 객체 및 naver 객체 준비 상태 확인
    if (typeof window !== 'undefined' && window.naver && window.naver.maps) {
      initializeMap()
    } else {
      // 1초 주기로 폴링하여 naver 객체가 로드되는지 감지 (Script 로드 대기)
      const interval = setInterval(() => {
        if (typeof window !== 'undefined' && window.naver && window.naver.maps) {
          initializeMap()
          clearInterval(interval)
        }
      }, 500)

      // 최대 10초 대기 후 해제
      const timeout = setTimeout(() => {
        clearInterval(interval)
        if (!mapLoaded) {
          setError(true)
        }
      }, 10000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }

    return () => {
      if (markerInstance) markerInstance.setMap(null)
      // Naver Maps 객체 해제는 인스턴스 소멸 시 가비지 컬렉션 처리됨
    }
  }, [latitude, longitude, zoom, mapLoaded, ncpKeyId])

  return (
    <div className="relative overflow-hidden rounded-none border border-gray-200 bg-gray-50">
      {/* 지도 컨테이너 */}
      <div 
        ref={mapContainerRef} 
        className="h-[380px] w-full md:h-[460px]" 
        style={{ filter: 'grayscale(10%) contrast(98%)' }}
      />

      {/* 에러 상태 뷰 */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/95">
          <p className="text-[16px] font-semibold text-[#1a1a1a]">{title}</p>
          <p className="mt-2 text-[14px] text-gray-500">{address}</p>
          <p className="mt-2 text-xs text-gray-400">
            {ncpKeyId
              ? '지도를 로드하는 중 일시적인 오류가 발생했습니다. 주소를 참고해 주시기 바랍니다.'
              : '지도 API 키가 설정되지 않았습니다. 잠시 후 다시 시도해 주세요.'}
          </p>
        </div>
      )}

      {/* 로딩 표시 */}
      {!mapLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
          <span className="text-[13px] text-gray-400 animate-pulse">지도 로딩 중</span>
        </div>
      )}
    </div>
  )
}
