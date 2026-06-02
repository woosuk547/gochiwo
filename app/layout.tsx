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
    default: '리포즈 | 숲 속 프리미엄 독채 스테이',
    template: '%s | 리포즈',
  },
  description: '강원 홍천, 숲을 마주한 독채 스테이. 전면창 거실, 히노끼 욕조, 프라이빗 데크. 비수기 680,000원부터.',
  keywords: ['리포즈', '독채 스테이', '강원 홍천', '프리미엄 펜션', '풀빌라', '숲속 스테이'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '리포즈',
    title: '리포즈 | 숲 속 프리미엄 독채 스테이',
    description: '강원 홍천, 숲을 마주한 독채 스테이. 느린 하루를 위해 설계한 프리미엄 독채.',
    url: 'https://repause.co.kr',
  },
  twitter: {
    card: 'summary_large_image',
    title: '리포즈 | 숲 속 프리미엄 독채 스테이',
    description: '강원 홍천, 숲을 마주한 독채 스테이.',
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
