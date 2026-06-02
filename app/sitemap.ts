import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://repause.co.kr'
  const routes = ['', '/space', '/guide', '/brand', '/partnership', '/reservation', '/my-reservation', '/notices', '/terms', '/privacy']

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/reservation' ? 0.9 : 0.6,
  }))
}
