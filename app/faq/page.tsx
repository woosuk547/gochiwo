'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Phone, ChevronDown } from 'lucide-react'

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const faqs = [
    {
      category: '서비스 이용',
      items: [
        {
          question: '견적 후 시공을 진행하지 않아도 되나요?',
          answer: '견적 확인 후 진행 여부는 고객님께서 결정하십니다. 견적이 마음에 들지 않으시면 언제든 거절하실 수 있습니다.'
        },
        {
          question: '얼마나 빨리 연락이 오나요?',
          answer: '평균 30분 이내에 가장 가까운 전문가가 연락드립니다. 긴급한 상황의 경우 더 빠르게 연결될 수 있어요.'
        },
        {
          question: '서비스 이용 시간은 어떻게 되나요?',
          answer: '24시간 신청 접수가 가능하며, 긴급 상황의 경우 야간에도 대응 가능한 업체를 연결해드립니다. 일반적인 상담은 오전 9시부터 오후 6시까지 가능합니다.'
        }
      ]
    },
    {
      category: '비용 및 결제',
      items: [
        {
          question: '가격은 어떻게 책정되나요?',
          answer: '현장 방문 후 작업 범위와 필요한 자재를 확인한 뒤 항목별로 견적을 제시해드립니다. 추가 비용 발생 시 반드시 사전에 고지하고 동의를 구합니다.'
        },
        {
          question: '결제는 언제 하나요?',
          answer: '시공이 완료되고 고객님께서 확인하신 후 결제하시면 됩니다. 선결제는 요구하지 않으며, 현금, 카드, 계좌이체 모두 가능합니다.'
        },
        {
          question: '견적서를 받을 수 있나요?',
          answer: '네, 현장 방문 후 상세한 견적서를 제공해드립니다. 작업 항목별 비용이 명시되어 있어 투명하게 확인하실 수 있습니다.'
        }
      ]
    },
    {
      category: '시공 후 처리',
      items: [
        {
          question: '시공 후 문제가 생기면 어떻게 하나요?',
          answer: '시공 후 하자가 발생하면 즉시 연락주세요. 해당 업체에 연락하여 처리를 요청드리며, 업체 연락이 되지 않을 경우 저희가 대체 업체를 연결해드립니다.'
        },
        {
          question: '시공에 불만족하면 어떻게 하나요?',
          answer: '시공 품질에 문제가 있을 경우 즉시 연락주시면 재시공 또는 환불 처리를 협의해드립니다. 고객 만족을 최우선으로 생각합니다.'
        }
      ]
    },
    {
      category: '업체 및 전문가',
      items: [
        {
          question: '어떤 업체들이 등록되어 있나요?',
          answer: '경력 10년 이상의 베테랑 전문가들만 선별하여 등록되어 있습니다. 자격증 보유, 사업자등록 확인, 실제 고객 리뷰 4.5점 이상 등 엄격한 기준을 통과한 업체만 활동합니다.'
        },
        {
          question: '전문가를 직접 선택할 수 있나요?',
          answer: '네, 추천된 전문가 목록에서 리뷰와 경력을 확인하신 후 직접 선택하실 수 있습니다. 관리자가 매칭해드리는 경우에도 고객님의 선택권이 최우선입니다.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
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

      <section className="bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              자주 묻는 질문
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              고쳐줘 서비스에 대해 궁금하신 점을 확인하세요
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-10">
            {faqs.map((category, catIdx) => (
              <div key={catIdx}>
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary/20">
                  {category.category}
                </h2>
                <div className="space-y-2">
                  {category.items.map((faq, faqIdx) => {
                    const key = `${catIdx}-${faqIdx}`
                    const isOpen = !!openItems[key]
                    return (
                      <div key={faqIdx} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                          onClick={() => toggle(key)}
                        >
                          <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 text-gray-700 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                            <p className="pt-3">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-blue-700 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              더 궁금하신 점이 있으신가요?
            </h3>
            <p className="text-lg text-blue-50 mb-6">
              전문가 상담을 통해 자세히 안내해드립니다
            </p>
            <Link href="/request">
              <Button size="lg" className="text-lg px-10 py-6 bg-white text-primary hover:bg-gray-50 shadow-2xl rounded-xl font-bold">
                <Phone className="w-5 h-5 mr-2" />
                무료 상담 신청
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
