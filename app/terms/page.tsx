'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-lg">돌아가기</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">이용약관</h1>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
              <p className="text-gray-700 leading-relaxed">
                본 약관은 고쳐줘(이하 "회사")가 제공하는 집수리 중개 플랫폼 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제2조 (정의)</h2>
              <div className="space-y-3 text-gray-700">
                <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>"서비스"라 함은 회사가 제공하는 집수리 업체와 고객을 연결하는 중개 플랫폼을 말합니다.</li>
                  <li>"이용자"라 함은 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
                  <li>"업체"라 함은 회사의 플랫폼에 등록되어 실제 시공 서비스를 제공하는 전문 업체를 말합니다.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제3조 (서비스의 제공)</h2>
              <div className="space-y-3 text-gray-700">
                <p>회사는 다음과 같은 서비스를 제공합니다:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>집수리 요청 접수 및 업체 매칭</li>
                  <li>현장 점검 및 견적 중개</li>
                  <li>시공 후 A/S 관리</li>
                  <li>고객 리뷰 및 평가 시스템</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제4조 (이용자의 의무)</h2>
              <div className="space-y-3 text-gray-700">
                <p>이용자는 다음 행위를 하여서는 안됩니다:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>허위 정보 입력 또는 타인의 정보 도용</li>
                  <li>서비스를 이용한 영리 목적의 활동</li>
                  <li>회사 및 업체에 대한 명예 훼손 또는 업무 방해</li>
                  <li>기타 관계 법령에 위배되는 행위</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제5조 (결제 및 환불)</h2>
              <p className="text-gray-700 leading-relaxed">
                서비스 이용료는 시공 완료 후 업체에 직접 지불하며, 회사는 중개 수수료를 별도로 청구하지 않습니다.
                시공에 하자가 있는 경우 6개월 이내 무상 A/S를 받을 수 있으며, 업체와 협의가 되지 않을 경우 회사가 중재합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제6조 (면책조항)</h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 중개 플랫폼을 제공할 뿐 실제 시공은 업체가 수행하므로, 시공 과정에서 발생하는 직접적인 손해에 대해서는
                업체가 책임을 집니다. 다만, 회사는 등록 업체 관리 및 분쟁 조정에 최선을 다합니다.
              </p>
            </section>

            <section className="border-t pt-8">
              <p className="text-sm text-gray-500">
                본 약관은 2026년 3월 1일부터 시행됩니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
