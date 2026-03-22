'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Phone } from 'lucide-react'

export default function CasesPage() {
  const cases = [
    {
      id: 1,
      category: '누수 수리',
      categoryColor: 'bg-blue-100 text-blue-700',
      title: '강남구 역삼동 화장실 누수',
      location: '서울 강남구 역삼동',
      description: '배관 노후로 인한 누수 발생. 벽체 타일 제거 후 배관 교체 및 방수 처리 완료',
      cost: '18만원',
      duration: '4시간',
      rating: 4.9,
      review: '빠르고 깔끔하게 해결해주셨어요',
      image: '/cases/bathroom-after.jpg',
      date: '2026-02-15'
    },
    {
      id: 2,
      category: '배관 공사',
      categoryColor: 'bg-green-100 text-green-700',
      title: '송파구 잠실동 싱크대 배관 막힘',
      location: '서울 송파구 잠실동',
      description: '배관 청소 및 역류 방지 시공. 고압 세척으로 막힌 배관 완전 제거',
      cost: '15만원',
      duration: '3시간',
      rating: 4.8,
      review: '가격도 합리적이고 만족스러워요',
      image: '/cases/kitchen-after.jpg',
      date: '2026-02-10'
    },
    {
      id: 3,
      category: '보일러 수리',
      categoryColor: 'bg-orange-100 text-orange-700',
      title: '서초구 서초동 보일러 점화 불량',
      location: '서울 서초구 서초동',
      description: '점화 플러그 교체 및 청소. 난방 효율 개선 및 안전 점검 완료',
      cost: '9만원',
      duration: '2시간',
      rating: 5.0,
      review: '친절하고 설명도 자세히 해주셨어요',
      image: '/services/boiler.jpg',
      date: '2026-02-05'
    },
    {
      id: 4,
      category: '누수 수리',
      categoryColor: 'bg-blue-100 text-blue-700',
      title: '마포구 홍대 원룸 천장 누수',
      location: '서울 마포구 홍대',
      description: '상층 누수로 인한 천장 균열. 상층 배관 수리 및 천장 보수 완료',
      cost: '25만원',
      duration: '6시간',
      rating: 4.7,
      review: '상층과 조율도 잘 해주셔서 편했어요',
      image: '/cases/bathroom-after.jpg',
      date: '2026-01-28'
    },
    {
      id: 5,
      category: '전기 공사',
      categoryColor: 'bg-yellow-100 text-yellow-700',
      title: '강서구 등촌동 누전 차단기 교체',
      location: '서울 강서구 등촌동',
      description: '노후 차단기 교체 및 전기 안전 점검. 콘센트 추가 설치',
      cost: '12만원',
      duration: '2.5시간',
      rating: 4.9,
      review: '전기 안전도 꼼꼼히 체크해주셨어요',
      image: '/cases/bathroom-after.jpg',
      date: '2026-01-20'
    },
    {
      id: 6,
      category: '배관 공사',
      categoryColor: 'bg-green-100 text-green-700',
      title: '용산구 이촌동 세면대 배관 교체',
      location: '서울 용산구 이촌동',
      description: '녹물 발생으로 인한 배관 전체 교체. 수압 개선 및 필터 설치',
      cost: '20만원',
      duration: '5시간',
      rating: 4.8,
      review: '물이 정말 깨끗해졌어요',
      image: '/cases/kitchen-after.jpg',
      date: '2026-01-15'
    }
  ]

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-lg">돌아가기</span>
          </Link>
          <Link href="/request">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Phone className="w-4 h-4 mr-2" />
              신청하기
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero 섹션 */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              실제 시공 사례
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6">
              투명하게 공개하는 시공 전후 과정과 정확한 비용
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>총 {cases.length}건의 시공 완료</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>평균 만족도 4.9★</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 시공 사례 그리드 */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((item) => (
                <Card key={item.id} className="border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                      시공 완료
                    </div>
                  </div>
                  <CardHeader>
                    <Badge className={`w-fit mb-2 ${item.categoryColor} hover:${item.categoryColor}`}>
                      {item.category}
                    </Badge>
                    <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{item.location}</span>
                    </div>
                    <CardDescription className="text-gray-700 mb-3">
                      {item.description}
                    </CardDescription>
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">시공비</span>
                        <span className="text-primary font-bold text-lg">{item.cost}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">소요 시간</span>
                        <span className="font-semibold">{item.duration}</span>
                      </div>
                      <div className="text-sm text-gray-500 pt-2 border-t">
                        ⭐ {item.rating} · "{item.review}"
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-gradient-to-r from-primary to-blue-700 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              우리 동네 전문가에게 맡기세요
            </h3>
            <p className="text-lg text-blue-50 mb-6">
              30초 신청으로 30분 내 전문가 연락
            </p>
            <Link href="/request">
              <Button size="lg" className="text-lg px-10 py-6 bg-white text-primary hover:bg-gray-50 shadow-2xl rounded-xl font-bold">
                <Phone className="w-5 h-5 mr-2" />
                무료 현장 점검 신청
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
