'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Wrench, MapPin, CheckCircle2, Shield, Phone, Clock, Star } from 'lucide-react'

declare global {
  interface Window {
    naver: any
  }
}

const SPECIALTY_OPTIONS = [
  { id: '보일러수리', label: '보일러 수리/설치' },
  { id: '누수탐지', label: '누수 탐지/수리' },
  { id: '배관공사', label: '배관 공사' },
  { id: '전기공사', label: '전기 수리/공사' },
  { id: '도배장판', label: '도배/장판' },
  { id: '에어컨설치', label: '에어컨 설치/수리' },
  { id: '욕실리모델링', label: '욕실 리모델링' },
  { id: '타일공사', label: '타일 공사' },
  { id: '방수공사', label: '방수 공사' },
  { id: '집수리', label: '종합 집수리' },
  { id: '싱크대수리', label: '싱크대/주방설비' },
  { id: '인테리어', label: '인테리어' },
]

export default function ContractorJoinPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    serviceArea: '',
    latitude: null as number | null,
    longitude: null as number | null,
    description: '',
    specialties: [] as string[],
  })

  useEffect(() => {
    const initMap = () => {
      if (typeof window !== 'undefined' && window.naver && mapRef.current && !map) {
        const initialCenter = new window.naver.maps.LatLng(37.5666, 126.9784)
        const mapInstance = new window.naver.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: 12,
        })
        window.naver.maps.Event.addListener(mapInstance, 'click', (e: any) => {
          handleMapClick(e.coord.y, e.coord.x, mapInstance)
        })
        setMap(mapInstance)
      }
    }

    if (window.naver) {
      initMap()
    } else {
      const interval = setInterval(() => {
        if (window.naver) {
          clearInterval(interval)
          initMap()
        }
      }, 300)
      return () => clearInterval(interval)
    }
  }, [map])

  const handleMapClick = (lat: number, lng: number, mapInstance: any) => {
    if (marker) marker.setMap(null)

    const newMarker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(lat, lng),
      map: mapInstance,
    })
    setMarker(newMarker)
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))

    window.naver.maps.Service.reverseGeocode(
      {
        coords: new window.naver.maps.LatLng(lat, lng),
        orders: [
          window.naver.maps.Service.OrderType.ADDR,
          window.naver.maps.Service.OrderType.ROAD_ADDR,
        ].join(','),
      },
      (status: any, response: any) => {
        if (status !== window.naver.maps.Service.Status.ERROR && response.v2.results.length > 0) {
          const r = response.v2.results[0]
          const area = `${r.region.area1.name} ${r.region.area2.name}`
          setFormData(prev => ({ ...prev, serviceArea: area }))
        }
      }
    )
  }

  const toggleSpecialty = (id: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(id)
        ? prev.specialties.filter(s => s !== id)
        : [...prev.specialties, id],
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.latitude || !formData.longitude) {
      setError('지도에서 주요 서비스 지역을 클릭해주세요.')
      setLoading(false)
      return
    }

    if (formData.specialties.length === 0) {
      setError('전문 분야를 최소 1개 이상 선택해주세요.')
      setLoading(false)
      return
    }

    try {
      const descParts = [
        formData.ownerName ? `대표자: ${formData.ownerName}` : '',
        formData.description,
      ].filter(Boolean)

      const res = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          serviceArea: formData.serviceArea,
          latitude: formData.latitude,
          longitude: formData.longitude,
          description: descParts.length > 0 ? descParts.join('\n') : null,
          specialties: formData.specialties,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '가입 신청에 실패했습니다.')
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">신청이 완료되었습니다!</h2>
            <p className="text-gray-600 mb-2">
              <strong>{formData.name}</strong>의 파트너 가입 신청을 접수했습니다.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              관리자 검토 후 1~2 영업일 내 등록 완료 문자를 발송해 드립니다.
              <br />
              문의: 1577-1234
            </p>
            <Link href="/">
              <Button className="w-full rounded-xl h-12">홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              뒤로
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">고쳐줘</h1>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <section className="container mx-auto px-4 py-6 max-w-2xl lg:max-w-4xl">
        {/* 헤더 배너 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-2">파트너 업체 가입 신청</h2>
          <p className="text-blue-100 text-sm mb-4">
            전국 9,000개 이상 검증 업체와 함께 더 많은 고객을 만나보세요
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">무료</p>
              <p className="text-xs text-blue-100">가입비</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">30분</p>
              <p className="text-xs text-blue-100">평균 배정</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">4.8점</p>
              <p className="text-xs text-blue-100">파트너 만족도</p>
            </div>
          </div>
        </div>

        {/* 혜택 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Phone, label: '빠른 배정', desc: '새 고객 즉시 알림' },
            { icon: Shield, label: '신뢰 인증', desc: '인증 배지 제공' },
            { icon: Star, label: '리뷰 관리', desc: '리뷰 쌓기 지원' },
            { icon: Clock, label: '24시간', desc: '연중무휴 플랫폼' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>

        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* 업체 기본 정보 */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b">업체 기본 정보</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-semibold">
                      업체명 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="예: 강남 전기 수리 전문"
                      required
                      disabled={loading}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="font-semibold">
                      대표자명 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ownerName"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      placeholder="예: 홍길동"
                      required
                      disabled={loading}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-semibold">
                      연락처 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="예: 010-1234-5678"
                      required
                      disabled={loading}
                      className="h-12 rounded-xl"
                    />
                    <p className="text-xs text-gray-500">고객 연결 및 가입 승인 알림에 사용됩니다</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-semibold">
                      업체 소개 <span className="text-gray-500 text-sm font-normal">(선택)</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="경력, 전문 분야, 특이사항 등을 간단히 소개해주세요"
                      rows={3}
                      disabled={loading}
                      className="rounded-xl resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 전문 분야 */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1 pb-2 border-b">
                  전문 분야 <span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-gray-500 mb-4">해당하는 분야를 모두 선택해주세요</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SPECIALTY_OPTIONS.map(({ id, label }) => {
                    const selected = formData.specialties.includes(id)
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleSpecialty(id)}
                        disabled={loading}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                          selected
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary'
                        }`}
                      >
                        {selected && <span className="mr-1">✓</span>}
                        {label}
                      </button>
                    )
                  })}
                </div>
                {formData.specialties.length > 0 && (
                  <p className="text-xs text-primary mt-2">{formData.specialties.length}개 선택됨</p>
                )}
              </div>

              {/* 서비스 지역 (지도) */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1 pb-2 border-b">
                  주요 서비스 지역 <span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-gray-500 mb-3">지도에서 주로 활동하는 지역을 클릭해주세요</p>

                <div className="relative">
                  <div
                    ref={mapRef}
                    className="w-full h-[300px] border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm"
                  />
                  {formData.latitude && formData.longitude && (
                    <div className="absolute top-3 left-3 right-3 flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium shadow-lg">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>위치 선택됨</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  <Label htmlFor="serviceArea" className="font-semibold">
                    서비스 지역명 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="serviceArea"
                    name="serviceArea"
                    value={formData.serviceArea}
                    onChange={handleChange}
                    placeholder="지도 클릭 시 자동 입력 (또는 직접 입력)"
                    required
                    disabled={loading}
                    className="h-12 rounded-xl bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    선택 위치 기준 반경 10km 내 고객에게 우선 배정됩니다
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      신청 중...
                    </>
                  ) : (
                    <>
                      <Wrench className="w-5 h-5 mr-2" />
                      파트너 가입 신청하기 (무료)
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-gray-500 mt-3">
                  신청 후 1~2 영업일 내 관리자 승인 문자를 발송해 드립니다
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 자주 묻는 질문 */}
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">자주 묻는 질문</h3>
          <div className="space-y-3 text-sm">
            {[
              { q: '가입비나 월 이용료가 있나요?', a: '없습니다. 완전 무료로 가입하고 이용하실 수 있습니다.' },
              { q: '가입 승인까지 얼마나 걸리나요?', a: '신청 후 1~2 영업일 내에 검토 후 문자로 안내해 드립니다.' },
              { q: '서비스 지역을 여러 곳으로 설정할 수 있나요?', a: '가입 후 관리자에게 문의하시면 서비스 지역 추가가 가능합니다.' },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                <p className="font-semibold text-gray-800 mb-1">Q. {q}</p>
                <p className="text-gray-600">A. {a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
