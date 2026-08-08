import Link from 'next/link'
import Image from 'next/image'
import { contactInfo, lodgingProvider, siteNavigation } from '@/lib/repause-content'
import { InstagramIcon } from '@/components/site/instagram-icon'

type BizParty = {
  title: string
  company: string
  ceo: string
  businessNumber: string
  mailOrderNumber: string
  address: string
  phone: string
}

function BusinessPartyBlock({ party }: { party: BizParty }) {
  const rows = [
    { label: '상호명', value: party.company },
    { label: '대표자명', value: party.ceo },
    { label: '사업자등록번호', value: party.businessNumber },
    { label: '사업장 소재지', value: party.address },
    { label: '전화번호', value: party.phone },
    { label: '통신판매업 신고번호', value: party.mailOrderNumber },
  ]

  return (
    <div>
      <p className="text-[12px] font-semibold tracking-tight text-[#1a1a1a] md:text-[13px]">{party.title}</p>
      <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 text-[12px] leading-relaxed md:text-[13px]">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3 sm:gap-4">
            <dt className="w-[7.5rem] shrink-0 text-gray-400">{row.label}</dt>
            <dd className="min-w-0 text-gray-600">
              {row.label === '전화번호' && row.value ? (
                <a href={`tel:${row.value.replace(/-/g, '')}`} className="hover:text-brand">
                  {row.value}
                </a>
              ) : (
                row.value || '—'
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

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
                  sizes="100px"
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
                <a href={`tel:${contactInfo.phone.replace(/-/g, '')}`} className="min-h-[44px] flex items-center hover:text-brand md:min-h-[32px]">
                  {contactInfo.phone}
                </a>
                <a href={`mailto:${contactInfo.email}`} className="min-h-[44px] flex items-center hover:text-brand md:min-h-[32px]">
                  {contactInfo.email}
                </a>
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

        {/* 카드사·통신판매 심사용: 결제 당사자 + 운영사 필수 정보 (항상 노출) */}
        <div className="mt-8 space-y-8 border-t border-gray-200 pt-5 md:mt-10 md:space-y-10 md:pt-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <BusinessPartyBlock party={lodgingProvider} />
            <BusinessPartyBlock
              party={{
                title: contactInfo.roleTitle,
                company: contactInfo.company,
                ceo: contactInfo.ceo,
                businessNumber: contactInfo.businessNumber,
                mailOrderNumber: contactInfo.mailOrderNumber,
                address: contactInfo.address,
                phone: contactInfo.phone,
              }}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 text-[12px] text-gray-400 md:flex-row md:items-center md:justify-between md:text-[13px]">
            <p>&copy; 2026 Repause. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/terms" className="min-h-[44px] flex items-center hover:text-gray-600 md:min-h-[32px]">이용약관</Link>
              <Link href="/privacy" className="min-h-[44px] flex items-center hover:text-gray-600 md:min-h-[32px]">개인정보처리방침</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
