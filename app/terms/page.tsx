import { PageHero } from '@/components/site/page-hero'
import { PageShell } from '@/components/site/page-shell'
import { contactInfo } from '@/lib/repause-content'

const sections = [
  {
    title: '서비스 범위',
    body: 'Repause 웹사이트는 독채 스테이 예약, 제휴기업 예약, 운영 안내 제공을 목적으로 합니다. 일반 예약과 제휴 예약은 서로 다른 승인 및 결제 기준으로 운영될 수 있습니다.',
  },
  {
    title: '예약 신청',
    body: '사용자는 실제 예약 가능 날짜와 요청 내용을 바탕으로 신청해야 하며, 허위 정보 입력 또는 타인 정보 도용은 금지됩니다. 입력한 일정과 인원 기준으로 예상 금액이 계산될 수 있습니다.',
  },
  {
    title: '승인 및 결제',
    body: '예약은 운영자 검토 후 확정됩니다. 승인된 예약에 한해 카드 결제 링크, 계좌 안내 또는 법인 정산 방식이 개별 안내되며, 결제 완료 전에는 예약이 최종 확정되지 않을 수 있습니다.',
  },
  {
    title: '취소 및 환불',
    body: '환불 금액은 총 결제 금액을 기준으로 입실일까지 남은 일수에 따라 산정됩니다. 이용 15일 전 취소 시 전액 환불되며, 이용 2일 전~당일 취소는 환불이 불가합니다. 성수기(여름 7/15~8/24, 겨울 12/20~1/15)는 별도 수수료 기준이 적용됩니다. 날짜 변경은 이용 10일 전까지만 가능하며, 이후 요청은 취소 후 재예약으로 처리됩니다. 노쇼(No-Show) 시 환불이 절대 불가하며, 기상 악화로 인한 교통 결항 시 증빙 서류 제출 후 100% 환불 또는 날짜 변경이 가능합니다.',
  },
  {
    title: '고지 사항',
    body: contactInfo.email
      ? `운영 정책이나 결제 방식이 변경되면 ${contactInfo.email} 또는 사이트 공지를 통해 안내해요.`
      : '운영 정책이나 결제 방식이 변경되면 사이트 공지를 통해 안내해요.',
  },
]

export default function TermsPage() {
  return (
    <PageShell>
      <PageHero title="이용약관" description="예약과 결제에 적용되는 기본 원칙이에요." />

      <section className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        <div className="divide-y divide-gray-100">
          {sections.map((section) => (
            <article key={section.title} className="py-6">
              <h2 className="text-[17px] font-bold text-[#1a1a1a]">{section.title}</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-gray-600">{section.body}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-[13px] text-gray-400">본 약관은 2026년 5월 13일부터 적용됩니다.</p>
      </section>
    </PageShell>
  )
}
