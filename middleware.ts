import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'repause_admin_session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /admin 페이지 자체는 쿠키 없어도 접근 허용 (클라이언트에서 세션 확인)
  // /api/admin 은 각 라우트 핸들러에서 requireAdmin()으로 보호됨
  // 단, 관리자 설정이 안 된 환경에서 404처럼 보이게 할 수 있음
  // 여기서는 /admin/* 경로에 robots 차단 헤더만 추가
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
