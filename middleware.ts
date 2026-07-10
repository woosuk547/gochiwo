import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'repause_admin_session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /admin, /stays(mock) — 검색 노출 차단
  if (pathname.startsWith('/admin') || pathname.startsWith('/stays')) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/stays/:path*'],
}
