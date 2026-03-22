'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, MapPin, Wrench, FileText, Camera, CheckCircle2, Home, Phone, Clock, Shield } from 'lucide-react'

// 네이버 지도 타입 선언
declare global {
  interface Window {
    naver: any
  }
}

export default function RequestPage() {
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    imageUrl: '',
  })

  // 네이버 지도 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && window.naver && mapRef.current && !map) {
      const initialCenter = new window.naver.maps.LatLng(37.5666, 126.9784) // 서울 시청

      const mapInstance = new window.naver.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: 13,
      })

      // 지도 클릭 이벤트
      window.naver.maps.Event.addListener(mapInstance, 'click', (e: any) => {
        const latlng = e.coord
        handleMapClick(latlng.y, latlng.x, mapInstance)
      })

      setMap(mapInstance)
    }
  }, [map])

  // 지도 클릭 핸들러 (위치 설정 + 주소 변환)
  const handleMapClick = async (lat: number, lng: number, mapInstance: any) => {
    // 기존 마커 제거
    if (marker) {
      marker.setMap(null)
    }

    // 새 마커 생성
    const newMarker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(lat, lng),
      map: mapInstance,
    })

    setMarker(newMarker)
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }))

    // Reverse Geocoding으로 주소 가져오기
    try {
      window.naver.maps.Service.reverseGeocode(
        {
          coords: new window.naver.maps.LatLng(lat, lng),
          orders: [
            window.naver.maps.Service.OrderType.ADDR,
            window.naver.maps.Service.OrderType.ROAD_ADDR,
          ].join(','),
        },
        (status: any, response: any) => {
          if (status === window.naver.maps.Service.Status.ERROR) {
            return
          }

          if (response.v2.results.length > 0) {
            const result = response.v2.results[0]
            const address = result.region.area1.name + ' ' +
                          result.region.area2.name + ' ' +
                          result.region.area3.name + ' ' +
                          (result.land?.number1 || '')

            setFormData((prev) => ({
              ...prev,
              address: address.trim(),
            }))
          }
        }
      )
    } catch {
      // 주소 변환 실패 시 사용자가 직접 입력
    }
  }

  // 이미지 업로드 핸들러 (Base64 변환)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData((prev) => ({
        ...prev,
        imageUrl: base64String,
      }))
      setImagePreview(base64String)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 유효성 검사
    if (!formData.latitude || !formData.longitude) {
      setError('지도에서 위치를 선택해주세요.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '요청 생성에 실패했습니다.')
      }

      // 성공 메시지 개선
      const successMessage = `✅ 신청이 완료되었습니다!

📞 평균 30분 내 전문가가 연락드립니다
📍 주소: ${formData.address || '선택한 위치'}
🛠️ 내용: ${formData.title}

방문 점검 및 견적은 무료입니다.
감사합니다!`

      alert(successMessage)
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* 헤더 */}
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
          <div className="w-16"></div>
        </div>
      </header>

      {/* 폼 섹션 */}
      <section className="container mx-auto px-4 py-6 max-w-2xl lg:max-w-4xl">
        {/* 신뢰 배지 */}
        <div className="bg-gradient-to-r from-blue-50 to-white border-2 border-blue-100 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                안심하고 요청하세요
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>방문 점검 무료</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>평균 30분 내 연락</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>검증된 전문가 배정</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 페이지 타이틀 */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            무료 현장 점검 신청
          </h2>
          <p className="text-base text-gray-600">
            30초 신청으로 <span className="font-semibold text-primary">평균 30분 내</span> 경력 10년 이상 전문가가 연락드립니다
          </p>
        </div>

        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* 네이버 지도 */}
              <div className="space-y-3">
                <div>
                  <Label className="text-base font-semibold text-gray-900">
                    어디로 방문하면 되나요? <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    지도에서 정확한 위치를 클릭해주세요 (가까운 전문가를 찾아드려요)
                  </p>
                </div>
                <div className="relative">
                  <div
                    ref={mapRef}
                    className="w-full h-[350px] border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm"
                  />
                  {formData.latitude && formData.longitude && (
                    <div className="absolute top-3 left-3 right-3 flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl text-sm font-medium shadow-lg">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>위치가 선택되었습니다</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-semibold text-gray-900">
                  상세 주소
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="지도 클릭 시 자동 입력됩니다"
                  disabled={loading}
                  className="h-12 rounded-xl bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold text-gray-900">
                  어떤 문제인가요? <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-600">
                  빠른 선택 또는 직접 입력해주세요
                </p>
                {/* 빠른 선택 버튼 */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  {['화장실 누수', '주방 배관 막힘', '보일러 고장', '전기 수리', '문짝 교체', '기타'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, title: type }))}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        formData.title === type
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary'
                      }`}
                      disabled={loading}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <Input
                  id="title"
                  name="title"
                  placeholder="또는 직접 입력하세요 (예: 싱크대 수전 교체)"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold text-gray-900">
                  어떤 증상인가요? <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-600">
                  증상을 자세히 설명해주실수록 정확한 견적을 받을 수 있어요
                </p>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="예시:&#10;• 화장실 변기 뒤쪽에서 물이 계속 새요&#10;• 언제부터: 3일 전부터&#10;• 상태: 하루에 수건 2~3장 정도 젖어요&#10;• 긴급도: 빠를수록 좋아요"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  required
                  disabled={loading}
                  className="rounded-xl resize-none"
                />
              </div>

              {/* 이미지 업로드 */}
              <div className="space-y-3">
                <div>
                  <Label className="text-base font-semibold text-gray-900">
                    사진이 있으면 더 정확해요 <span className="text-gray-500 text-sm font-normal">(선택)</span>
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    문제 부위를 촬영해주시면 더 정확한 견적을 받을 수 있어요
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                  className="hidden"
                />

                {!imagePreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-10 hover:border-primary hover:bg-blue-50/30 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 group"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-semibold text-gray-900 mb-1">
                          📸 사진 추가하기
                        </p>
                        <p className="text-sm text-gray-600">
                          문제 부위를 촬영해주세요 (최대 5MB)
                        </p>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="w-full h-auto max-h-80 object-contain bg-gray-50"
                    />
                    <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/50 to-transparent">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">✓ 사진이 첨부되었습니다</span>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('')
                            setFormData(prev => ({ ...prev, imageUrl: '' }))
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                          className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      전송 중...
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-2" />
                      무료 현장 점검 신청하기
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  신청 후 평균 30분 내 전문가가 연락드립니다
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 진행 과정 안내 */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Card className="border-2 border-blue-100 bg-blue-50/50">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-base">1. 빠른 연락</CardTitle>
              <CardDescription className="text-sm">
                신청 후 평균 30분 이내<br />
                가까운 전문가 배정
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-blue-100 bg-blue-50/50">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-2">
                <Home className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-base">2. 무료 점검</CardTitle>
              <CardDescription className="text-sm">
                현장 방문 및 점검<br />
                투명한 견적 제시
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-blue-100 bg-blue-50/50">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-base">3. 시공 완료</CardTitle>
              <CardDescription className="text-sm">
                전문적인 시공<br />
                하자 발생 시 신속 대응
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 안심 정보 */}
        <div className="mt-6 p-5 bg-white border-2 border-gray-100 rounded-2xl">
          <div className="space-y-3">
            <p className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              안심하고 이용하세요
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>경력 10년 이상 <strong>검증된 전문가</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>투명한 가격, <strong>추가 비용 사전 고지</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>공임비·자재비 <strong>항목별 분리 공개</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>시공 하자 발생 시 <strong>신속 대응</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
