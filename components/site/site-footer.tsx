import Link from 'next/link'
import Image from 'next/image'
import { contactInfo, siteNavigation } from '@/lib/repause-content'

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 px-4 pb-24 pt-10 md:px-5 md:pb-12 md:pt-12 lg:pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-10">
          <div>
            <Link href="/" className="inline-block">
              <div className="relative h-16 w-36 mix-blend-multiply">
                <Image
                  src="/repause/logo.png"
                  alt="Repause"
                  fill
                  className="object-contain scale-[2.2] translate-y-[-1px]"
                />
              </div>
            </Link>
            <p className="mt-2 text-[14px] leading-relaxed text-gray-500 md:text-[15px]">
              고요한 휴식과 우리만의 시간을 위한 프라이빗 독채 스테이
            </p>
          </div>

          <div className="flex gap-10 md:gap-12">
            <div>
              <p className="text-[13px] font-semibold text-gray-400">바로가기</p>
              <div className="mt-3 flex flex-col gap-2.5 md:gap-2">
                {siteNavigation.map((item) => (
                  <Link key={item.href} href={item.href} className="min-h-[32px] flex items-center text-[14px] text-gray-600 hover:text-[#1a1a1a]">
                    {item.label}
                  </Link>
                ))}
                <Link href="/my-reservation" className="min-h-[32px] flex items-center text-[14px] text-gray-600 hover:text-[#1a1a1a]">
                  예약 조회
                </Link>
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-400">문의</p>
              <div className="mt-3 flex flex-col gap-2.5 text-[14px] text-gray-600 md:gap-2">
                <p>{contactInfo.phone}</p>
                <p>{contactInfo.email}</p>
              </div>
            </div>
          </div>
        </div>

        <details className="mt-8 border-t border-gray-200 pt-5 md:mt-10 md:pt-6">
          <summary className="min-h-[44px] flex items-center cursor-pointer text-[13px] text-gray-400 hover:text-gray-600">
            사업자 정보
          </summary>
          <div className="mt-2 space-y-1 text-[12px] text-gray-400 md:mt-3 md:text-[13px]">
            <p>{contactInfo.company} · 대표 {contactInfo.ceo.includes('공지') ? '(오픈 예정)' : contactInfo.ceo}</p>
            {!contactInfo.businessNumber.includes('공지') && (
              <p>사업자등록번호 {contactInfo.businessNumber}{!contactInfo.mailOrderNumber.includes('공지') ? ` · 통신판매업 ${contactInfo.mailOrderNumber}` : ''}</p>
            )}
            <p>{contactInfo.address}</p>
            {contactInfo.notice && <p className="text-[11px] text-gray-300 md:text-[12px]">{contactInfo.notice}</p>}
          </div>
        </details>

        <div className="mt-5 flex flex-col gap-3 border-t border-gray-200 pt-5 text-[12px] text-gray-400 md:mt-6 md:flex-row md:items-center md:justify-between md:pt-6 md:text-[13px]">
          <p>&copy; 2026 Repause. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="min-h-[32px] flex items-center hover:text-gray-600">이용약관</Link>
            <Link href="/privacy" className="min-h-[32px] flex items-center hover:text-gray-600">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
