import { NextResponse } from 'next/server'

/** 대관은 전화·채팅 상담만. 공개 POST는 닫아 둔다. */
export async function POST() {
  return NextResponse.json({ error: '대관 문의는 전화 또는 채팅 상담으로 받아 드려요.' }, { status: 404 })
}
