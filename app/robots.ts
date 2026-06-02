import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/payment'],
    },
    sitemap: 'https://repause.co.kr/sitemap.xml',
  }
}
