/** NCP Maps Static Map (ID-KEY 인증) */
export const NAVER_STATIC_MAP_ENDPOINT = 'https://maps.apigw.ntruss.com/map-static/v2/raster'

export function getNaverMapClientId() {
  return (
    process.env.NAVER_MAP_NCP_KEY_ID ??
    process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ??
    ''
  )
}

export function getNaverMapClientSecret() {
  return (
    process.env.NAVER_MAP_NCP_KEY_SECRET ??
    process.env.NAVER_MAP_CLIENT_SECRET ??
    ''
  )
}

export function getNaverMapCredentials() {
  return {
    clientId: getNaverMapClientId(),
    clientSecret: getNaverMapClientSecret(),
  }
}

export function buildStaticMapQuery(input: {
  longitude: number
  latitude: number
  width: number
  height: number
  level?: number
}) {
  const { longitude, latitude, width, height, level = 14 } = input
  const params = new URLSearchParams({
    w: String(Math.min(1024, Math.max(1, width))),
    h: String(Math.min(1024, Math.max(1, height))),
    center: `${longitude},${latitude}`,
    level: String(level),
    scale: '2',
    markers: `type:d|size:mid|color:0x1a1a1a|pos:${longitude} ${latitude}`,
  })

  return params.toString()
}
