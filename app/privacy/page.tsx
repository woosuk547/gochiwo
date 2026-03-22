'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 개인정보의 수집 및 이용목적</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                고쳐줘(이하 "회사")는 다음의 목적을 위해 개인정보를 수집 및 이용합니다:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>집수리 서비스 신청 접수 및 업체 매칭</li>
                <li>고객 문의 및 A/S 처리</li>
                <li>서비스 이용 관련 안내 및 공지사항 전달</li>
                <li>서비스 개선 및 통계 분석</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 수집하는 개인정보 항목</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">가. 필수 수집 항목</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>성명, 연락처(전화번호)</li>
                  <li>서비스 이용 주소(위치 정보)</li>
                  <li>서비스 요청 내용 및 첨부 사진</li>
                </ul>

                <p className="font-semibold mt-4">나. 자동 수집 항목</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP 주소, 쿠키, 접속 로그</li>
                  <li>서비스 이용 기록</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 개인정보의 보유 및 이용기간</h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 서비스 제공 기간 동안 개인정보를 보유하며, 서비스 이용 종료 시 지체 없이 파기합니다.
                단, 관련 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 개인정보의 제3자 제공</h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
                다만, 서비스 제공을 위해 필요한 경우 최소한의 정보만을 매칭된 업체에 제공하며,
                이용자의 동의를 받은 경우에 한합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 개인정보의 파기절차 및 방법</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">가. 파기절차</p>
                <p>이용자가 입력한 정보는 목적 달성 후 별도의 DB로 옮겨져 내부 방침 및 관련 법령에 따라 보관 후 파기됩니다.</p>

                <p className="font-semibold mt-4">나. 파기방법</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>전자적 파일: 복구 불가능한 방법으로 영구 삭제</li>
                  <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 이용자의 권리</h2>
              <p className="text-gray-700 leading-relaxed">
                이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며,
                개인정보 처리의 정지 또는 삭제를 요청할 수 있습니다.
                요청 시 지체 없이 필요한 조치를 취하겠습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 개인정보 보호책임자</h2>
              <div className="bg-gray-50 p-6 rounded-lg space-y-2 text-gray-700">
                <p><strong>성명:</strong> 홍길동</p>
                <p><strong>직책:</strong> 개인정보 보호책임자</p>
                <p><strong>연락처:</strong> privacy@fixmatch.com</p>
                <p><strong>전화:</strong> 02-1234-5678</p>
              </div>
            </section>

            <section className="border-t pt-8">
              <p className="text-sm text-gray-500">
                본 개인정보처리방침은 2026년 3월 1일부터 시행됩니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
