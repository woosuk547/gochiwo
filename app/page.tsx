'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wrench, MapPin, Camera, CheckCircle2, ArrowRight, Award, Phone, Droplets, Wind, Zap, Settings, Hammer, House, Calculator } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">고쳐줘</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:1577-1234" className="hidden md:flex items-center gap-2 text-primary font-bold hover:text-primary/80">
              <Phone className="w-4 h-4" />
              <span>1577-1234</span>
            </a>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-gray-600">
                관리자
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero 섹션 - 문제 중심 접근 */}
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* 왼쪽: 텍스트 */}
              <div className="text-center md:text-left">
                <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                  <Award className="w-3 h-3 mr-1" />
                  투명한 가격 · 검증된 전문가
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  집수리, 지금 바로<br />
                  <span className="text-primary">전문가에게 맡기세요</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                  누수, 배관, 보일러, 전기 등<br />
                  <span className="font-semibold text-gray-900">경력 10년 이상 전문가</span>가 현장을 직접 방문해<br />
                  <span className="font-semibold text-primary">투명한 견적</span>을 제공합니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Link href="/request" className="flex-1 sm:flex-initial">
                    <Button size="lg" className="w-full text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg rounded-xl">
                      <Phone className="w-5 h-5 mr-2" />
                      수리 신청하기
                    </Button>
                  </Link>
                  <Link href="/estimate" className="flex-1 sm:flex-initial">
                    <Button size="lg" variant="outline" className="w-full text-lg px-8 py-6 border-2 rounded-xl hover:bg-primary/5">
                      <Calculator className="w-5 h-5 mr-2" />
                      견적 계산기
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-gray-500">
                  공임비·자재비 항목별 공개 &nbsp;·&nbsp; 추가 비용 없는 투명한 견적
                </p>
              </div>

              {/* 오른쪽: 전문가 이미지 */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden bg-white shadow-2xl">
                  <img
                    src="/hero-image.jpg?v=20260308"
                    alt="친절한 집수리 전문가"
                    className="w-full h-auto object-cover aspect-square"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                {/* 신뢰 뱃지 */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-6 py-3 shadow-lg border-2 border-blue-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-bold text-gray-900">인증된 전문가만</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 서비스 */}
      <section className="bg-white py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                주요 서비스
              </h3>
              <p className="text-lg text-gray-600">
                집에서 발생하는 다양한 수리 문제를 경력 10년 이상 전문가가 해결합니다.<br />
                <span className="text-sm text-gray-500">현장 방문 후 투명한 견적을 제공합니다</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 누수 */}
              <Card className="border-2 border-gray-100 hover:border-primary/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Droplets className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg mb-2">누수 수리</CardTitle>
                  <CardDescription className="text-gray-600">
                    화장실 누수, 싱크대 배수, 천장 누수 등<br />
                    정밀 진단 후 원인에 맞는 시공을 진행합니다<br />
                    <span className="text-primary font-semibold">평균 15만원대 (공임비+자재비)</span>
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* 보일러 */}
              <Card className="border-2 border-gray-100 hover:border-primary/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Wind className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg mb-2">보일러 수리</CardTitle>
                  <CardDescription className="text-gray-600">
                    난방 불량, 온수 미작동, 이상 소음 등<br />
                    긴급 상황도 24시간 대응합니다<br />
                    <span className="text-primary font-semibold">평균 8~12만원대 (증상별 상이)</span>
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* 전기 */}
              <Card className="border-2 border-gray-100 hover:border-primary/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg mb-2">전기 공사</CardTitle>
                  <CardDescription className="text-gray-600">
                    누전, 콘센트 교체, 조명 설치, 차단기 등<br />
                    안전을 최우선으로 전기 전문가가 처리합니다<br />
                    <span className="text-primary font-semibold">평균 5~10만원대 (작업별 상이)</span>
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* 배관 */}
              <Card className="border-2 border-gray-100 hover:border-primary/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Settings className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg mb-2">배관 공사</CardTitle>
                  <CardDescription className="text-gray-600">
                    배관 막힘, 교체, 녹물, 수압 불량 등<br />
                    고압 세척부터 전체 교체까지 대응합니다<br />
                    <span className="text-primary font-semibold">평균 12~20만원대 (범위별 상이)</span>
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* 철물 */}
              <Card className="border-2 border-gray-100 hover:border-primary/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Hammer className="w-6 h-6 text-gray-600" />
                  </div>
                  <CardTitle className="text-lg mb-2">철물 수리</CardTitle>
                  <CardDescription className="text-gray-600">
                    문짝, 잠금장치, 손잡이, 경첩 교체 등<br />
                    세심한 작업이 필요한 부분도 전문가가 처리합니다<br />
                    <span className="text-primary font-semibold">평균 6~10만원대 (부품비 포함)</span>
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* 기타 */}
              <Card className="border-2 border-gray-100 hover:border-primary/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <House className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg mb-2">기타 수리</CardTitle>
                  <CardDescription className="text-gray-600">
                    벽지, 페인트, 타일, 가구 조립 등<br />
                    다양한 수리 항목에 대해 문의하실 수 있습니다<br />
                    <span className="text-primary font-semibold">평균 10만원대~ (작업별 견적)</span>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Link href="/request">
                <Button size="lg" className="px-10 py-6 text-lg">
                  <Phone className="w-5 h-5 mr-2" />
                  수리 신청하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 이용 절차 */}
      <section className="bg-gray-50 py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl lg:max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                서비스 이용 절차
              </h3>
              <p className="text-lg text-gray-600">
                간단한 신청으로 <span className="font-semibold text-primary">빠르게 전문가와 연결</span>됩니다
              </p>
            </div>

            {/* 진행 상황 추적 바 */}
            <div className="relative mb-12">
              <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gray-200">
                <div className="h-full bg-primary w-full"></div>
              </div>
              <div className="grid md:grid-cols-5 gap-4 items-center relative">
                {/* Step 1 */}
                <div className="text-center md:col-span-1">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg relative z-10 border-4 border-white">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <div className="font-bold text-gray-900 mb-1">신청 완료</div>
                  <div className="text-sm text-gray-600">30초 신청</div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex justify-center md:col-span-1">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>

                {/* Step 2 */}
                <div className="text-center md:col-span-1">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg relative z-10 border-4 border-white">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <div className="font-bold text-gray-900 mb-1">전문가 배정</div>
                  <div className="text-sm text-gray-600">담당자 직접 배정</div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex justify-center md:col-span-1">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>

                {/* Step 3 */}
                <div className="text-center md:col-span-1">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg relative z-10 border-4 border-white">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <div className="font-bold text-gray-900 mb-1">연락 & 방문</div>
                  <div className="text-sm text-gray-600">30분 내 연락</div>
                </div>
              </div>
            </div>

            {/* 상세 단계 */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">위치 선택</h4>
                  <p className="text-gray-600">
                    지도 클릭으로<br />주소 자동 입력
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">사진 첨부</h4>
                  <p className="text-gray-600">
                    문제 부위 촬영<br />간단히 설명
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">전문가 연락</h4>
                  <p className="text-gray-600">
                    30분 내 연락<br />현장 방문 견적
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 시공 사례 */}
      <section className="bg-white py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                시공 사례
              </h3>
              <p className="text-lg text-gray-600">
                공임비·자재비를 항목별로 공개한 실제 시공 사례입니다<br />
                <span className="text-primary font-semibold">추가 비용 없이 견적 그대로 진행</span>합니다
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 사례 1 - 화장실 누수 */}
              <Card className="border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src="/cases/bathroom-after.jpg?v=20260308"
                    alt="화장실 누수 수리 완료"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                    시공 완료
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">누수 수리</Badge>
                  </div>
                  <CardTitle className="text-lg mb-2">강남구 역삼동 화장실 누수</CardTitle>
                  <CardDescription className="text-gray-700 mb-3">
                    배관 노후로 인한 누수 발생. 벽체 타일 제거 후<br />
                    배관 교체 및 방수 처리 완료
                  </CardDescription>
                  <div className="bg-blue-50 p-3 rounded-lg mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">공임비</span>
                      <span className="font-semibold">10만원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">자재비</span>
                      <span className="font-semibold">8만원</span>
                    </div>
                    <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between">
                      <span className="font-bold text-gray-900">총 비용</span>
                      <span className="text-primary font-bold text-lg">18만원</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    ★ 4.9 · "빠르고 깔끔하게 해결해주셨습니다"
                  </div>
                </CardHeader>
              </Card>

              {/* 사례 2 - 주방 배관 */}
              <Card className="border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src="/cases/kitchen-after.jpg?v=20260308"
                    alt="주방 배관 수리 완료"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                    깔끔 완료
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">배관 공사</Badge>
                  </div>
                  <CardTitle className="text-lg mb-2">송파구 잠실동 싱크대 배관 막힘</CardTitle>
                  <CardDescription className="text-gray-700 mb-3">
                    고압 세척으로 막힌 배관 완전 제거<br />
                    역류 방지 시공 완료
                  </CardDescription>
                  <div className="bg-green-50 p-3 rounded-lg mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">공임비</span>
                      <span className="font-semibold">12만원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">자재비</span>
                      <span className="font-semibold">3만원</span>
                    </div>
                    <div className="border-t border-green-200 mt-2 pt-2 flex justify-between">
                      <span className="font-bold text-gray-900">총 비용</span>
                      <span className="text-primary font-bold text-lg">15만원</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    ★ 4.8 · "가격이 투명하고 만족스러운 시공이었습니다"
                  </div>
                </CardHeader>
              </Card>

              {/* 사례 3 - 보일러 수리 */}
              <Card className="border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src="/services/boiler.jpg?v=20260308"
                    alt="보일러 수리"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                    수리 완료
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">보일러 수리</Badge>
                  </div>
                  <CardTitle className="text-lg mb-2">서초구 서초동 보일러 점화 불량</CardTitle>
                  <CardDescription className="text-gray-700 mb-3">
                    점화 플러그 교체 및 내부 청소<br />
                    난방 효율 개선 및 안전 점검 완료
                  </CardDescription>
                  <div className="bg-orange-50 p-3 rounded-lg mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">공임비</span>
                      <span className="font-semibold">6만원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">부품비</span>
                      <span className="font-semibold">3만원</span>
                    </div>
                    <div className="border-t border-orange-200 mt-2 pt-2 flex justify-between">
                      <span className="font-bold text-gray-900">총 비용</span>
                      <span className="text-primary font-bold text-lg">9만원</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    ★ 5.0 · "새벽에 연락했는데 신속하게 방문해주셨습니다"
                  </div>
                </CardHeader>
              </Card>
            </div>

            <div className="text-center mt-10">
              <Link href="/cases">
                <Button variant="outline" size="lg" className="border-2">
                  전체 시공 사례 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 고쳐줘를 선택하는 이유 */}
      <section className="bg-gray-50 py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              고쳐줘를 선택하는 이유
            </h3>
            <p className="text-lg text-gray-600 mb-12 text-center">
              검증된 전문가, 투명한 가격, 확실한 사후 보증을 제공합니다
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 신뢰 */}
              <Card className="border-2 border-primary/20 bg-white">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-3">검증된 전문가만 선별</CardTitle>
                      <CardDescription className="text-gray-700 text-base leading-relaxed">
                        • 경력 10년 이상 베테랑 우선 배치<br />
                        • 자격증 및 사업자등록 확인<br />
                        • 실제 고객 리뷰 4.5점 이상만 등록<br />
                        • 정기적인 재교육 및 평가 시스템
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* 투명성 */}
              <Card className="border-2 border-primary/20 bg-white">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-3">투명한 가격 정책</CardTitle>
                      <CardDescription className="text-gray-700 text-base leading-relaxed">
                        • 현장 방문 후 상세 견적 제공<br />
                        • 추가 비용 사전 고지 원칙<br />
                        • 실제 시공 사례와 비용 공개<br />
                        • 불만족 시 100% 환불 보장
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* 속도 */}
              <Card className="border-2 border-primary/20 bg-white">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-3">최대한 빠르게</CardTitle>
                      <CardDescription className="text-gray-700 text-base leading-relaxed">
                        • 평균 30분 이내 전문가 연락<br />
                        • 긴급 상황 24시간 대응 가능<br />
                        • 담당자 직접 검토 후 업체 배정<br />
                        • 당일 방문 시공 우선 지원
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* 고객 지원 */}
              <Card className="border-2 border-primary/20 bg-white">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-3">지속적인 고객 지원</CardTitle>
                      <CardDescription className="text-gray-700 text-base leading-relaxed">
                        • 시공 후 하자 발생 시 신속한 대응<br />
                        • 업체 연락 두절 시 대체 업체 연결<br />
                        • 고객 불만 접수 및 처리 지원<br />
                        • 플랫폼 차원의 품질 관리
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 고객 후기 */}
      <section className="bg-white py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                고객 후기
              </h3>
              <p className="text-lg text-gray-600">
                실제 이용 고객의 후기입니다
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* 후기 1 */}
              <Card className="border-2 border-gray-100">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-700">김</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">김민수님</div>
                      <div className="text-sm text-gray-500">강남구 역삼동 · 보일러 수리</div>
                    </div>
                  </div>
                  <div className="text-yellow-500 mb-3">⭐⭐⭐⭐⭐ 5.0</div>
                  <CardDescription className="text-gray-700 leading-relaxed">
                    "새벽에 보일러가 고장났는데 생각보다 빠르게 연락을 받았습니다.
                    <span className="font-semibold text-gray-900">공임비를 사전에 안내</span>해주셔서 신뢰가 갔고, 깔끔하게 해결됐습니다."
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* 후기 2 */}
              <Card className="border-2 border-gray-100">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-green-700">박</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">박지영님</div>
                      <div className="text-sm text-gray-500">서초구 서초동 · 누수 수리</div>
                    </div>
                  </div>
                  <div className="text-yellow-500 mb-3">⭐⭐⭐⭐ 4.8</div>
                  <CardDescription className="text-gray-700 leading-relaxed">
                    "화장실 누수 문제로 연락했는데
                    <span className="font-semibold text-gray-900">원인을 정확하게 진단</span>해주셔서 불필요한 공사 없이 해결됐습니다.
                    무료 견적 덕분에 부담 없이 시작할 수 있었습니다."
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* 후기 3 */}
              <Card className="border-2 border-gray-100">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-purple-700">이</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">이준호님</div>
                      <div className="text-sm text-gray-500">송파구 잠실동 · 배관 공사</div>
                    </div>
                  </div>
                  <div className="text-yellow-500 mb-3">⭐⭐⭐⭐⭐ 4.9</div>
                  <CardDescription className="text-gray-700 leading-relaxed">
                    "배관 막힘으로 연락했는데 여러 업체 비교했을 때 여기가 가장 설명이 친절했어요.
                    <span className="font-semibold text-gray-900">자재비와 공임비를 항목별로 구분</span>해서 보여줘서 신뢰가 갔습니다."
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* CTA 섹션 - 강력한 유도 */}
      <section className="bg-gradient-to-r from-primary to-blue-700 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
              지금 바로 전문가에게<br className="md:hidden" /> 맡기세요
            </h3>
            <p className="text-xl text-blue-50 mb-8 leading-relaxed">
              간단한 신청으로 30분 내 전문가가 연락드립니다<br className="hidden md:block" />
              현장 방문 후 <span className="font-bold text-white underline">투명한 견적</span>을 제공합니다<br />
              <span className="text-lg text-blue-100">견적이 마음에 들지 않으시면 언제든 거절하실 수 있습니다</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link href="/request">
                <Button size="lg" className="text-xl px-12 py-7 bg-white text-primary hover:bg-gray-50 shadow-2xl rounded-2xl font-bold">
                  <Phone className="w-6 h-6 mr-2" />
                  수리 신청하기
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>평균 30분 내 연락</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>공임비·자재비 항목별 공개</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>투명한 견적</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>시공 하자 신속 대응</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
              자주 묻는 질문
            </h3>
            <div className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">얼마나 빨리 연락이 오나요?</CardTitle>
                  <CardDescription className="text-gray-700 pt-2">
                    평균 30분 이내에 가장 가까운 전문가가 연락드립니다.
                    긴급한 상황의 경우 더 빠르게 연결될 수 있습니다.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">가격은 어떻게 책정되나요?</CardTitle>
                  <CardDescription className="text-gray-700 pt-2">
                    현장 방문 후 작업 범위와 필요한 자재를 확인한 뒤
                    항목별로 견적을 제시해드립니다. 추가 비용 발생 시
                    반드시 사전에 고지하고 동의를 구합니다.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">견적 후 시공을 진행하지 않아도 되나요?</CardTitle>
                  <CardDescription className="text-gray-700 pt-2">
                    견적 확인 후 진행 여부는 고객님께서 결정하십니다.
                    견적이 마음에 들지 않으시면 언제든 거절하실 수 있습니다.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* 로고 및 소개 */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">고쳐줘</span>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  우리 동네 집수리 전문가를 빠르고 쉽게 찾아주는<br />
                  믿을 수 있는 매칭 플랫폼입니다.
                </p>
                <div className="mb-4">
                  <a href="tel:1577-1234" className="flex items-center gap-2 text-primary font-bold text-lg hover:text-primary/80">
                    <Phone className="w-5 h-5" />
                    <span>1577-1234 (무료 상담)</span>
                  </a>
                  <p className="text-sm text-gray-500 mt-1 ml-7">평일 09:00 ~ 18:00 (연중무휴)</p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="outline" className="text-xs">투명한 견적</Badge>
                  <Badge variant="outline" className="text-xs">검증된 전문가</Badge>
                </div>
              </div>

              {/* 서비스 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">서비스</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/request" className="hover:text-primary transition-colors">누수 수리</Link></li>
                  <li><Link href="/request" className="hover:text-primary transition-colors">배관 공사</Link></li>
                  <li><Link href="/request" className="hover:text-primary transition-colors">보일러 수리</Link></li>
                  <li><Link href="/request" className="hover:text-primary transition-colors">전기 공사</Link></li>
                  <li><Link href="/request" className="hover:text-primary transition-colors">철물 수리</Link></li>
                </ul>
              </div>

              {/* 고객센터 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">고객센터</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/notices" className="hover:text-primary transition-colors">공지사항</Link></li>
                  <li><Link href="/faq" className="hover:text-primary transition-colors">자주 묻는 질문</Link></li>
                  <li><Link href="/terms" className="hover:text-primary transition-colors">이용약관</Link></li>
                  <li><Link href="/privacy" className="hover:text-primary transition-colors">개인정보처리방침</Link></li>
                </ul>
              </div>
            </div>

            {/* 하단 */}
            <div className="pt-8 border-t text-center">
              <p className="text-sm text-gray-500">
                © 2026 고쳐줘(FixMatch). All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* 모바일 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t shadow-lg">
        <div className="container mx-auto px-4 py-3 flex gap-2">
          <a href="tel:1577-1234" className="flex-1">
            <Button className="w-full bg-white text-primary border-2 border-primary hover:bg-primary/5">
              <Phone className="w-5 h-5 mr-2" />
              전화 상담
            </Button>
          </a>
          <Link href="/request" className="flex-1">
            <Button className="w-full bg-primary text-white hover:bg-primary/90">
              수리 신청하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
