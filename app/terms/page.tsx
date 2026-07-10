import { PageHero } from '@/components/site/page-hero'
import { PageShell } from '@/components/site/page-shell'
import { cancellationPolicy, contactInfo } from '@/lib/repause-content'

const sections = [
  {
    title: '서비스 범위',
    body: 'Repause 웹사이트는 독채 스테이 예약, 제휴기업 예약, 운영 안내 제공을 목적으로 합니다. 일반 예약과 제휴 예약은 서로 다른 승인 및 결제 기준으로 운영될 수 있습니다. 운영 주체는 주식회사 크리오스입니다.',
  },
  {
    title: '예약 신청',
    body: '사용자는 실제 예약 가능 날짜와 요청 내용을 바탕으로 신청해야 하며, 허위 정보 입력 또는 타인 정보 도용은 금지됩니다. 입력한 일정과 인원 기준으로 예상 금액이 계산될 수 있습니다.',
  },
  {
    title: '승인 및 결제',
    body: '예약은 운영자 검토 후 확정됩니다. 승인된 예약에 한해 카드 결제(토스페이먼츠), 계좌 안내 또는 법인 정산 방식이 개별 안내되며, 결제 완료 전에는 예약이 최종 확정되지 않을 수 있습니다. 예약금은 최종 금액의 50%(1,000원 단위 반올림)입니다.',
  },
  {
    title: '취소 및 환불',
    body: [
      '환불 금액은 최종 납부 금액을 기준으로, 입실일까지 남은 일수에 따라 산정됩니다. 예약 신청·접수 당일 취소라도 이용 예정일 기준이 동일하게 적용됩니다.',
      '비수기: 이용 10일 전까지 100% 환불. 이후 일수에 따라 차감되며, 이용 2일 전~당일은 환불 불가입니다.',
      '성수기(여름 7/15~8/24, 겨울 12/1~1/15): 이용 15일 전까지만 100% 환불. 이후 일수에 따라 위약금이 발생하며, 이용 3일 전~당일은 환불 불가입니다.',
      '날짜 변경은 이용 10일 전까지만 가능하며, 이후 요청은 취소 후 재예약으로 처리됩니다. 노쇼(No-Show) 시 환불이 불가합니다. 기상 악화로 인한 교통 결항 시 증빙 서류 제출 후 100% 환불 또는 날짜 변경이 가능합니다.',
      '일자별 환불 비율은 아래 표가 기준입니다.',
    ].join('\n\n'),
  },
  {
    title: '고지 사항',
    body: `운영 정책이나 결제 방식이 변경되면 ${contactInfo.email} 또는 사이트 공지를 통해 안내합니다. 문의 전화: ${contactInfo.phone}.`,
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
              <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-gray-600">{section.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto border border-gray-200">
          <table className="w-full border-collapse bg-white text-left text-[12px] md:text-[13px]">
            <caption className="sr-only">취소 시점별 비수기·성수기 환불 규정</caption>
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-500">
                <th scope="col" className="px-3 py-2.5 font-medium">취소 및 변경 요청일</th>
                <th scope="col" className="px-3 py-2.5 font-medium">비수기</th>
                <th scope="col" className="px-3 py-2.5 font-medium">성수기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {cancellationPolicy.tableRows.map((row) => (
                <tr key={row.daysLabel}>
                  <td className="px-3 py-2 font-medium">{row.daysLabel}</td>
                  <td className="px-3 py-2">{row.offpeak}</td>
                  <td className={`px-3 py-2 ${row.peak.includes('불가') ? 'font-medium text-red-500' : ''}`}>{row.peak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 space-y-1 text-[13px] text-gray-500">
          {cancellationPolicy.peakSeasons.map((season) => (
            <li key={season}>· {season}</li>
          ))}
          {cancellationPolicy.notes.map((note) => (
            <li key={note}>· {note}</li>
          ))}
        </ul>

        <p className="mt-8 text-[13px] text-gray-400">본 약관은 2026년 7월 10일부터 적용됩니다.</p>
      </section>
    </PageShell>
  )
}
