import type { Metadata } from 'next'
import { HomeContent } from './home-content'
import { publicPageMeta } from '@/lib/page-metadata'

export const metadata: Metadata = {
  ...publicPageMeta(
    '하이엔드 프라이빗 독채 스테이',
    '연인과 가족을 위한 하이엔드 프라이빗 독채. 전면창 거실, 자쿠지, 프라이빗 데크와 지하수 사계절 전용 풀을 경험해 보세요.',
    '/',
  ),
  title: { absolute: '리포즈 | 하이엔드 프라이빗 독채 스테이' },
  openGraph: {
    title: '리포즈 | 하이엔드 프라이빗 독채 스테이',
    description: '고요한 휴식과 우리만의 시간을 위한 프라이빗 독채 스테이.',
    url: 'https://repause.co.kr',
    images: [{ url: '/repause/editorial-exterior.jpg', width: 1200, height: 630, alt: '리포즈 프라이빗 독채' }],
  },
}

export default function HomePage() {
  return <HomeContent />
}
