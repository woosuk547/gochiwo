import { NextRequest, NextResponse } from 'next/server'
import {
  buildStaticMapQuery,
  getNaverMapCredentials,
  NAVER_STATIC_MAP_ENDPOINT,
} from '@/lib/naver-map-config'
import { clientIp, rateLimitExceeded, tooManyRequestsResponse } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (rateLimitExceeded(`map:${clientIp(request)}`, 30, 60 * 1000)) {
    return tooManyRequestsResponse()
  }

  const { searchParams } = request.nextUrl
  const latitude = Number(searchParams.get('lat') ?? '37.721200')
  const longitude = Number(searchParams.get('lng') ?? '127.653400')
  const width = Number(searchParams.get('w') ?? '800')
  const height = Number(searchParams.get('h') ?? '460')
  const level = Number(searchParams.get('level') ?? '14')

  const { clientId, clientSecret } = getNaverMapCredentials()

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: '지도 API 키가 설정되지 않았습니다.' }, { status: 503 })
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: '좌표가 올바르지 않습니다.' }, { status: 400 })
  }

  const query = buildStaticMapQuery({ latitude, longitude, width, height, level })
  const upstream = `${NAVER_STATIC_MAP_ENDPOINT}?${query}`

  try {
    const response = await fetch(upstream, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret,
      },
      next: { revalidate: 86400 },
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('Naver Static Map error:', response.status, detail)
      return NextResponse.json({ error: '지도 이미지를 불러오지 못했습니다.' }, { status: 502 })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') ?? 'image/jpeg'

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    console.error('Naver Static Map fetch failed:', error)
    return NextResponse.json({ error: '지도 요청 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
