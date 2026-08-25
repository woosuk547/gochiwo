import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { PageShell } from '@/components/site/page-shell'
import { contactInfo } from '@/lib/repause-content'

import { publicPageMeta } from '@/lib/page-metadata'

export const metadata: Metadata = publicPageMeta(
  '개인정보처리방침',
  '예약에 필요한 최소한의 정보만 수집해요.',
  '/privacy',
)

const sections = [
  {
    title: '수집 목적',
    body: '주식회사 크리오스(예약 대행·시스템 운영)와 슈가스테이(숙박 제공 및 결제 당사자)는 Repause 예약 확인, 일정 안내, 결제·환불 처리, 제휴 예약 관리, 고객 문의 응대, 관련 법령상 의무 이행을 위해 개인정보를 수집·이용합니다.',
  },
  {
    title: '수집 항목',
    body: '필수: 예약자명, 이메일, 연락처, 체크인/체크아웃 일정, 인원 수, 결제 방식. 선택: 요청 사항. 제휴 예약 시 회사명·혜택 유형. 결제 시 토스페이먼츠를 통해 결제 승인에 필요한 정보가 처리될 수 있습니다(카드번호 등 민감 결제정보는 회사가 직접 저장하지 않습니다).',
  },
  {
    title: '보유 및 이용 기간',
    body: [
      '원칙적으로 수집 목적 달성 후 지체 없이 파기합니다. 다만 관련 법령에 따라 아래 기간 동안 보관할 수 있습니다.',
      '· 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)',
      '· 대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)',
      '· 소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)',
      '· 표시·광고에 관한 기록: 6개월 (전자상거래법)',
      '· 통신사실확인자료: 관련 법령이 정한 기간',
    ].join('\n'),
  },
  {
    title: '제3자 제공',
    body: '회사는 원칙적으로 이용자 동의 없이 개인정보를 외부에 제공하지 않습니다. 다만 법령에 근거한 요청이 있는 경우 예외로 합니다.',
  },
  {
    title: '처리위탁',
    body: [
      '원활한 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁합니다.',
      `· 수탁자: 토스페이먼츠 주식회사 — 위탁 업무: 신용카드·계좌이체 등 결제 처리 및 결제 관련 고객 응대`,
      `· 수탁자: 네이버 주식회사(네이버 메일) — 위탁 업무: 예약·결제 안내 메일 발송`,
      '위탁 계약 시 개인정보 보호 관련 법령을 준수하며, 위탁 업무 변경 시 본 방침을 통해 고지합니다.',
    ].join('\n'),
  },
  {
    title: '영상정보처리기기',
    body: '현재 숙소 내부·외부에 CCTV 등 영상정보처리기기를 운영하지 않습니다. 설치하게 되면 설치 위치·촬영 범위·보관 기간을 본 방침에 적고, 예약 시 동의를 다시 받습니다.',
  },
  {
    title: '이용자 권리',
    body: '이용자는 언제든지 자신의 개인정보 열람·정정·삭제·처리정지를 요청할 수 있습니다. 요청은 아래 개인정보 보호책임자 연락처 또는 이메일로 접수해 주세요. 법령상 보관 의무가 있는 정보는 해당 기간 동안 삭제 요청이 제한될 수 있습니다.',
  },
  {
    title: '쿠키의 사용',
    body: '사이트는 서비스 이용 편의와 보안을 위해 필요한 범위에서 쿠키 또는 이와 유사한 기술을 사용할 수 있습니다. 브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 일부 기능 이용이 제한될 수 있습니다.',
  },
  {
    title: '개인정보 보호책임자',
    body: [
      `성명: ${contactInfo.privacyOfficer}`,
      `소속/직책: ${contactInfo.company} 대표`,
      `전화: ${contactInfo.phone}`,
      `이메일: ${contactInfo.email}`,
      '개인정보 관련 문의·불만·침해 신고는 위 연락처로 접수해 주세요. 접수 후 지체 없이 답변드리겠습니다.',
    ].join('\n'),
  },
]

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHero title="개인정보처리방침" description="예약에 필요한 최소한의 정보만 수집해요." />

      <section className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        <div className="divide-y divide-gray-100">
          {sections.map((section) => (
            <article key={section.title} className="py-6">
              <h2 className="text-[17px] font-bold text-[#1a1a1a]">{section.title}</h2>
              <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-gray-600">{section.body}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-[13px] text-gray-500">본 방침은 2026년 7월 10일부터 적용됩니다.</p>
      </section>
    </PageShell>
  )
}
