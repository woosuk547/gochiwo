import { NextRequest, NextResponse } from 'next/server'
import {
  isAdminConfigured,
  setAdminSession,
  validateAdminCredentials,
} from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: '관리자 계정이 아직 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const adminId = typeof body.adminId === 'string' ? body.adminId.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!adminId || !password) {
      return NextResponse.json(
        { error: '관리자 ID와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!validateAdminCredentials(adminId, password)) {
      return NextResponse.json(
        { error: '관리자 ID 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true })
    setAdminSession(response)

    return response
  } catch {
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
