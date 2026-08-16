import type { Metadata } from 'next'

const SITE = 'https://repause.co.kr'
const OG_IMAGE = '/repause/editorial-exterior.jpg'

export function publicPageMeta(title: string, description: string, path: string): Metadata {
  const url = path === '/' ? SITE : `${SITE}${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | 리포즈`,
      description,
      url,
      locale: 'ko_KR',
      siteName: '리포즈',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: '리포즈 프라이빗 독채' }],
    },
  }
}

export const noIndexRobots = { index: false, follow: false } as const
