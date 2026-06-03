export function getNaverMapNcpKeyId() {
  return (
    process.env.NAVER_MAP_NCP_KEY_ID ??
    process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ??
    ''
  )
}

export function getNaverMapsScriptSrc(ncpKeyId: string) {
  return `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(ncpKeyId)}&submodules=geocoder`
}
