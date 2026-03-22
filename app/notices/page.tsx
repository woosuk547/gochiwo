'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Phone } from 'lucide-react'

export default function NoticesPage() {
  const notices = [
    {
      id: 1,
      title: '🎉 고쳐줘 서비스 정식 오픈!',
      date: '2026-03-01',
      category: '공지',
      isNew: true,
      content: '우리 동네 집수리 전문가 매칭 플랫폼 "고쳐줘"가 정식으로 오픈했습니다. 누수, 배관, 보일러 등 집에서 발생하는 모든 문제를 빠르고 투명하게 해결해드립니다.'
    },
    {
      id: 2,
      title: '무료 현장 점검 서비스 시작',
      date: '2026-03-05',
      category: '이벤트',
      isNew: true,
      content: '3월 한 달간 모든 고객님께 무료 현장 점검 서비스를 제공합니다. 전문가가 직접 방문하여 정확한 견적을 제시해드립니다.'
    },
    {
      id: 3,
      title: '고객 리뷰 이벤트 진행 안내',
      date: '2026-03-08',
      category: '이벤트',
      isNew: true,
      content: '시공 완료 후 리뷰를 남겨주시는 고객님께 스타벅스 커피 쿠폰을 드립니다. 여러분의 솔직한 후기가 더 나은 서비스를 만듭니다.'
    },
    {
      id: 4,
      title: 'A/S 보증 기간 연장 안내',
      date: '2026-02-28',
      category: '공지',
      isNew: false,
      content: '기존 3개월이었던 A/S 보증 기간이 6개월로 연장되었습니다. 더욱 안심하고 서비스를 이용하실 수 있습니다.'
    },
    {
      id: 5,
      title: '긴급 출동 서비스 24시간 운영',
      date: '2026-02-20',
      category: '공지',
      isNew: false,
      content: '누수, 보일러 고장 등 긴급 상황에 대응하기 위해 24시간 긴급 출동 서비스를 시작합니다. 언제든 연락주세요.'
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
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              공지사항
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              고쳐줘의 새로운 소식과 이벤트를 확인하세요
            </p>
          </div>
        </div>
      </section>

      {/* 공지사항 목록 */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {notices.map((notice) => (
              <Card key={notice.id} className="border-2 border-gray-100 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={
                            notice.category === '이벤트'
                              ? 'bg-green-100 text-green-700 hover:bg-green-100'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                          }
                        >
                          {notice.category}
                        </Badge>
                        {notice.isNew && (
                          <Badge className="bg-red-500 text-white hover:bg-red-600">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2">{notice.title}</CardTitle>
                      <CardDescription className="text-gray-700 leading-relaxed">
                        {notice.content}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {notice.date}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-gradient-to-r from-primary to-blue-700 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              지금 바로 서비스를 이용해보세요
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
