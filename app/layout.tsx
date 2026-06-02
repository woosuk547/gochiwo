import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { KakaoChannelButton } from '@/components/site/kakao-channel-button'
import { MobileCTABar } from '@/components/site/mobile-cta-bar'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://repause.co.kr'),
  title: {
    default: '리포즈 | 하이엔드 프라이빗 독채 스테이',
    template: '%s | 리포즈',
  },
  description: '리포즈는 연인과 가족을 위한 하이엔드 프라이빗 독채 풀빌라입니다. 전면창 거실, 히노끼 욕조, 프라이빗 데크와 사계절 전용 풀을 경험해 보세요.',
  keywords: ['리포즈', '독채 스테이', '하이엔드 풀빌라', '프라이빗 스테이', '럭셔리 독채', '가족 풀빌라'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '리포즈',
    title: '리포즈 | 하이엔드 프라이빗 독채 스테이',
    description: '연인과 가족을 위한 프라이빗 독채 풀빌라. 고요한 휴식과 우리만의 시간을 제안합니다.',
    url: 'https://repause.co.kr',
  },
  twitter: {
    card: 'summary_large_image',
    title: '리포즈 | 하이엔드 프라이빗 독채 스테이',
    description: '고요한 휴식과 우리만의 시간을 위한 프라이빗 독채 스테이.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        <MobileCTABar />
        <KakaoChannelButton />
        <Script
          src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
