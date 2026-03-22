'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calculator, Phone, CheckCircle2 } from 'lucide-react'

export default function EstimatePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedUrgency, setSelectedUrgency] = useState<string>('normal')
  const [selectedArea, setSelectedArea] = useState<string>('')

  const categories = [
    { id: 'leak', name: '누수 수리', icon: '💧', avgPrice: '15-20만원', description: '화장실, 싱크대, 천장 누수' },
    { id: 'pipe', name: '배관 공사', icon: '🔧', avgPrice: '12-25만원', description: '배관 막힘, 교체, 수압 문제' },
    { id: 'boiler', name: '보일러 수리', icon: '🔥', avgPrice: '8-15만원', description: '난방, 온수, 점화 문제' },
    { id: 'electric', name: '전기 공사', icon: '⚡', avgPrice: '5-12만원', description: '누전, 콘센트, 조명' },
    { id: 'hardware', name: '철물 수리', icon: '🔨', avgPrice: '6-10만원', description: '문짝, 잠금장치, 손잡이' },
    { id: 'etc', name: '기타 수리', icon: '🏠', avgPrice: '10-20만원', description: '벽지, 타일, 가구 조립' }
  ]

  const areas = [
    { id: 'small', name: '소형 (10평 이하)', multiplier: 1.0 },
    { id: 'medium', name: '중형 (10-20평)', multiplier: 1.2 },
    { id: 'large', name: '대형 (20평 이상)', multiplier: 1.4 }
  ]

  const getEstimateRange = () => {
    if (!selectedCategory) return null

    const category = categories.find(c => c.id === selectedCategory)
    if (!category) return null

    const areaMultiplier = areas.find(a => a.id === selectedArea)?.multiplier || 1.0
    const urgencyMultiplier = selectedUrgency === 'urgent' ? 1.3 : 1.0

    // 예상 금액 계산 (간단한 로직)
    const baseMin = parseInt(category.avgPrice.split('-')[0])
    const baseMax = parseInt(category.avgPrice.split('-')[1].replace('만원', ''))

    const estimatedMin = Math.round(baseMin * areaMultiplier * urgencyMultiplier)
    const estimatedMax = Math.round(baseMax * areaMultiplier * urgencyMultiplier)

    return { min: estimatedMin, max: estimatedMax }
  }

  const estimate = getEstimateRange()

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-lg">돌아가기</span>
          </Link>
          <a href="tel:1577-1234" className="hidden md:flex items-center gap-2 text-primary font-bold hover:text-primary/80">
            <Phone className="w-4 h-4" />
            <span>1577-1234</span>
          </a>
        </div>
      </header>

      {/* Hero 섹션 */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              간편 견적 계산기 💡
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              30초만에 예상 비용을 확인하세요<br />
              <span className="text-sm text-gray-500">*정확한 견적은 무료 현장 점검 후 제공됩니다</span>
            </p>
          </div>
        </div>
      </section>

      {/* 견적 계산 섹션 */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Step 1: 카테고리 선택 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  수리 종류를 선택해주세요
                </CardTitle>
                <CardDescription>어떤 문제가 발생했나요?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
                        selectedCategory === category.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{category.icon}</div>
                      <div className="font-bold text-gray-900 mb-1">{category.name}</div>
                      <div className="text-sm text-gray-600 mb-2">{category.description}</div>
                      <div className="text-xs text-primary font-semibold">평균 {category.avgPrice}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: 긴급도 선택 */}
            {selectedCategory && (
              <Card className="mb-8 animate-in slide-in-from-top">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    긴급도를 선택해주세요
                  </CardTitle>
                  <CardDescription>언제까지 수리가 필요한가요?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedUrgency('normal')}
                      className={`p-6 border-2 rounded-xl text-left transition-all ${
                        selectedUrgency === 'normal'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="font-bold text-gray-900 mb-2">일반 신청 ⏰</div>
                      <div className="text-sm text-gray-600">일주일 내 방문 가능</div>
                      <Badge className="mt-2 bg-gray-100 text-gray-700 hover:bg-gray-100">정상 요금</Badge>
                    </button>
                    <button
                      onClick={() => setSelectedUrgency('urgent')}
                      className={`p-6 border-2 rounded-xl text-left transition-all ${
                        selectedUrgency === 'urgent'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-500/50'
                      }`}
                    >
                      <div className="font-bold text-gray-900 mb-2">긴급 요청 🚨</div>
                      <div className="text-sm text-gray-600">24시간 내 방문 필요</div>
                      <Badge className="mt-2 bg-red-500 text-white hover:bg-red-600">긴급 할증 +30%</Badge>
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: 면적 선택 */}
            {selectedCategory && selectedUrgency && (
              <Card className="mb-8 animate-in slide-in-from-top">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    작업 규모를 선택해주세요
                  </CardTitle>
                  <CardDescription>집 크기 또는 작업 범위</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {areas.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => setSelectedArea(area.id)}
                        className={`p-6 border-2 rounded-xl text-center transition-all ${
                          selectedArea === area.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="font-bold text-gray-900 mb-2">{area.name}</div>
                        <div className="text-sm text-gray-600">
                          {area.multiplier === 1.0 ? '기본 요금' : `기본 요금 × ${area.multiplier}`}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 견적 결과 */}
            {estimate && selectedArea && (
              <Card className="border-4 border-primary animate-in slide-in-from-bottom">
                <CardHeader className="bg-gradient-to-r from-primary to-blue-700 text-white">
                  <CardTitle className="text-2xl">예상 견적 💰</CardTitle>
                  <CardDescription className="text-blue-50">
                    아래는 평균 예상 금액입니다. 정확한 견적은 현장 점검 후 안내드립니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-primary mb-2">
                      {estimate.min}~{estimate.max}만원
                    </div>
                    <div className="text-gray-600">
                      {selectedUrgency === 'urgent' && <Badge className="bg-red-500">긴급 요청 포함</Badge>}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="text-sm text-gray-700 space-y-2">
                      <div className="flex justify-between">
                        <span>기본 공임비</span>
                        <span className="font-semibold">{Math.round(estimate.min * 0.6)}~{Math.round(estimate.max * 0.6)}만원</span>
                      </div>
                      <div className="flex justify-between">
                        <span>자재비 (예상)</span>
                        <span className="font-semibold">{Math.round(estimate.min * 0.4)}~{Math.round(estimate.max * 0.4)}만원</span>
                      </div>
                      {selectedUrgency === 'urgent' && (
                        <div className="flex justify-between text-red-600">
                          <span>긴급 할증</span>
                          <span className="font-semibold">+30%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>방문 점검 및 정확한 견적 제공 <strong className="text-primary">완전 무료</strong></span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>추가 비용 발생 시 사전 고지 및 동의 후 진행</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>시공 하자 발생 시 신속 대응</span>
                    </div>
                  </div>

                  <Link href="/request">
                    <Button size="lg" className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
                      <Phone className="w-5 h-5 mr-2" />
                      무료 현장 점검 신청하기
                    </Button>
                  </Link>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    신청 후 평균 30분 내 전문가 연락
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
