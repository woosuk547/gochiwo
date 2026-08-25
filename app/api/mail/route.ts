import { NextRequest, NextResponse } from 'next/server'
import { fetchInbox } from '@/lib/mailer'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: '메일함 API는 사용할 수 없습니다.' }, { status: 404 })
  }

  const denied = requireAdmin(request)
  if (denied) return denied

  const raw = Number(request.nextUrl.searchParams.get('limit') ?? '20')
  const limit = Number.isFinite(raw) ? Math.min(Math.max(raw, 1), 30) : 20

  try {
    const mails = await fetchInbox(limit)
    return NextResponse.json(mails)
  } catch {
    return NextResponse.json(
      { error: '메일 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}
