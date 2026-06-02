import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { parseDateInput } from '@/lib/booking'
import { prisma } from '@/lib/prisma'
import { serializeBlockedDate } from '@/lib/reservation-service'

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const blockedDates = await prisma.blockedDate.findMany({
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(blockedDates.map(serializeBlockedDate))
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const date = typeof body.date === 'string' ? parseDateInput(body.date) : null
    const label = typeof body.label === 'string' ? body.label.trim() : ''

    if (!date) {
      return NextResponse.json({ error: '올바른 날짜를 입력해주세요.' }, { status: 400 })
    }

    const existing = await prisma.blockedDate.findUnique({
      where: { date },
    })

    if (existing) {
      return NextResponse.json({ error: '이미 등록된 차단일입니다.' }, { status: 409 })
    }

    const blockedDate = await prisma.blockedDate.create({
      data: { date, label: label || null },
    })

    return NextResponse.json(serializeBlockedDate(blockedDate), { status: 201 })
  } catch {
    return NextResponse.json({ error: '차단일을 저장하지 못했습니다.' }, { status: 500 })
  }
}
