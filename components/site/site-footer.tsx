import Link from 'next/link'
import Image from 'next/image'
import { contactInfo, siteNavigation } from '@/lib/repause-content'
import { InstagramIcon } from '@/components/site/instagram-icon'

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white px-4 pb-24 pt-10 md:px-5 md:pb-12 md:pt-12 lg:pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-10">
          <div>
            <Link href="/" className="inline-block">
              <div className="relative h-[72px] w-[100px] mix-blend-multiply">
                <Image
                  src="/repause/logo.png"
                  alt="RE:PAUSE private stay"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="mt-2 font-serif text-[14px] leading-relaxed text-gray-500 md:text-[15px]">
              고요한 휴식과 우리만의 시간을 위한 프라이빗 독채 스테이
            </p>
          </div>

          <div className="flex gap-10 md:gap-12">
            <div>
              <p className="text-[13px] font-semibold text-gray-400">바로가기</p>
              <div className="mt-3 flex flex-col gap-2.5 md:gap-2">
                {siteNavigation.map((item) => (
                  <Link key={item.href} href={item.href} className="min-h-[44px] flex items-center text-[14px] text-gray-600 hover:text-brand md:min-h-[32px]">
                    {item.label}
                  </Link>
                ))}
                <Link href="/my-reservation" className="min-h-[44px] flex items-center text-[14px] text-gray-600 hover:text-brand md:min-h-[32px]">
                  예약 조회
                </Link>
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-400">문의</p>
              <div className="mt-3 flex flex-col gap-2.5 text-[14px] text-gray-600 md:gap-2">
                <p>{contactInfo.phone}</p>
                <p>{contactInfo.email}</p>
                <a
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] flex items-center gap-2 hover:text-brand md:min-h-[32px]"
                >
                  <InstagramIcon size={16} className="shrink-0" />
                  @repause_poolvilla
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 카드사·통신판매 심사용: 사업자등록증과 일치하는 필수 정보 (항상 노출) */}
        <div className="mt-8 border-t border-gray-200 pt-5 text-[12px] leading-relaxed text-gray-500 md:mt-10 md:pt-6 md:text-[13px]">
          <p>상호명 {contactInfo.company}</p>
          <p>대표자명 {contactInfo.ceo || '—'}</p>
          <p>사업자등록번호 {contactInfo.businessNumber || '—'}</p>
          <p>사업장 주소 {contactInfo.address}</p>
          <p>전화번호 {contactInfo.phone}</p>
          <p>통신판매업 신고번호 {contactInfo.mailOrderNumber}</p>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-gray-200 pt-5 text-[12px] text-gray-400 md:mt-6 md:flex-row md:items-center md:justify-between md:pt-6 md:text-[13px]">
          <p>&copy; 2026 Repause. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="min-h-[44px] flex items-center hover:text-gray-600 md:min-h-[32px]">이용약관</Link>
            <Link href="/privacy" className="min-h-[44px] flex items-center hover:text-gray-600 md:min-h-[32px]">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
