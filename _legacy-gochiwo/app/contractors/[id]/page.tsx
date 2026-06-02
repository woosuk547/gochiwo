'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Clock, CheckCircle2, Star, ThumbsUp, Phone } from 'lucide-react'

interface Review {
  id: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

interface Contractor {
  id: string
  name: string
  phone: string
  serviceArea: string
  latitude: number
  longitude: number
  rating: number
  reviewCount: number
  completedJobs: number
  trustScore: number
  responseTime: number
  profileImage: string | null
  description: string | null
  specialties: string | null
  verified: boolean
  verifiedAt: string | null
  createdAt: string
  reviews: Review[]
}

export default function ContractorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const contractorId = params?.id
    if (contractorId && typeof contractorId === 'string') {
      fetch(`/api/contractors/${contractorId}`)
        .then((res) => res.json())
        .then((data) => {
          setContractor(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error('업체 조회 실패:', err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-16 md:pb-0">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-16 md:pb-0">
        <div className="text-center">
          <p className="text-gray-500 mb-4">업체를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/admin')}>돌아가기</Button>
        </div>
      </div>
    )
  }

  let specialties: string[] = []
  try {
    specialties = contractor.specialties
      ? JSON.parse(contractor.specialties)
      : []
  } catch (error) {
    console.error('Failed to parse specialties:', error)
    specialties = []
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
        </div>
      </header>

      {/* 프로필 섹션 */}
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-4xl lg:max-w-5xl">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* 프로필 이미지 */}
              <div className="flex-shrink-0">
                {contractor.profileImage ? (
                  <img
                    src={contractor.profileImage}
                    alt={contractor.name}
                    className="w-32 h-32 rounded-2xl object-cover border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">
                      {contractor.name[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* 기본 정보 */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {contractor.name}
                      </h1>
                      {contractor.verified && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          인증
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{contractor.serviceArea}</span>
                    </div>
                  </div>
                </div>

                {/* 평점 및 통계 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xl font-bold text-gray-900">
                        {contractor.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">평점</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {contractor.trustScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">신뢰지수</div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-lg font-bold text-gray-900">
                        {contractor.responseTime}분
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">평균 응답</div>
                  </div>

                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {contractor.completedJobs}
                    </div>
                    <div className="text-xs text-gray-600">완료 건수</div>
                  </div>
                </div>

                {/* 전문 분야 */}
                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-white border-blue-200 text-blue-700"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 소개 */}
            {contractor.description && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">소개</h3>
                <p className="text-gray-600 leading-relaxed">
                  {contractor.description}
                </p>
              </div>
            )}

            {/* 연락하기 버튼 */}
            <div className="mt-6 pt-6 border-t">
              <a href={`tel:${contractor.phone}`}>
                <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                  <Phone className="w-5 h-5 mr-2" />
                  {contractor.phone} 전화하기
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* 리뷰 섹션 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5" />
                고객 리뷰
              </CardTitle>
              <Badge variant="secondary">{contractor.reviewCount}개</Badge>
            </div>
            <CardDescription>
              실제 이용하신 고객님들의 후기입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contractor.reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                아직 리뷰가 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {contractor.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-700">
                            {review.customerName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {review.customerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
