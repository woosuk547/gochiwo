import { PageHero } from '@/components/site/page-hero'
import { PageShell } from '@/components/site/page-shell'
import { contactInfo } from '@/lib/repause-content'

const sections = [
  {
    title: '수집 목적',
    body: 'Repause는 예약 신청 확인, 운영 일정 조율, 결제 안내, 제휴 예약 관리, 예약 관련 메일 발송을 위해 최소한의 개인정보를 수집해요.',
  },
  {
    title: '수집 항목',
    body: '예약자명, 이메일, 연락처, 체크인/체크아웃 일정, 인원 수, 결제 방식, 제휴 예약 시 회사명 및 요청 사항을 수집할 수 있어요.',
  },
  {
    title: '보관 기간',
    body: '예약 운영 및 분쟁 대응에 필요한 범위 내에서 보관하며, 관련 법령상 보존 의무가 없는 정보는 목적 달성 후 안전하게 삭제해요.',
  },
  {
    title: '제3자 제공',
    body: '원칙적으로 외부에 제공하지 않으며, 결제 처리, 세금계산서 발행 등 별도 제공이 필요한 경우 사전에 고지하고 필요한 범위 내에서만 이용해요.',
  },
  {
    title: '문의',
    body: contactInfo.email
      ? `개인정보 관련 문의는 ${contactInfo.email}로 접수할 수 있어요.`
      : '개인정보 관련 문의는 예약 접수 후 회신 메일을 통해 안내돼요.',
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
              <p className="mt-3 text-[14px] leading-relaxed text-gray-600">{section.body}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-[13px] text-gray-400">본 방침은 2026년 5월 13일부터 적용됩니다.</p>
      </section>
    </PageShell>
  )
}
