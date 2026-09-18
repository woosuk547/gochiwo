import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { normalizeDiscountCode } from '@/lib/discount-codes'
import { parseDateInput } from '@/lib/booking'
import { prisma } from '@/lib/prisma'
import { serializeDiscountCode } from '@/lib/reservation-service'

const CODE_PATTERN = /^[A-Z0-9-]{3,24}$/

function validationError(input: {
  code: string
  label: string
  type: string
  value: number
  maxUses: number | null
  expiresAt: Date | null
}): string | null {
  if (!CODE_PATTERN.test(input.code)) return '코드는 영문·숫자·하이픈 3~24자로 입력해 주세요.'
  if (!input.label) return '코드 이름(라벨)을 입력해 주세요.'
  if (input.type === 'PERCENT') {
    if (!Number.isInteger(input.value) || input.value < 1 || input.value > 90) {
      return '정률은 1~90% 사이로 입력해 주세요.'
    }
  } else if (input.type === 'FIXED') {
    if (!Number.isInteger(input.value) || input.value < 1000 || input.value > 5000000) {
      return '정액은 1,000원~5,000,000원 사이로 입력해 주세요.'
    }
  } else {
    return '할인 방식을 다시 선택해 주세요.'
  }
  if (input.maxUses !== null && (!Number.isInteger(input.maxUses) || input.maxUses < 1 || input.maxUses > 10000)) {
    return '사용 횟수 상한은 1~10,000 사이로 입력해 주세요.'
  }
  if (input.expiresAt && Number.isNaN(input.expiresAt.getTime())) return '만료일을 다시 확인해 주세요.'
  return null
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(codes.map(serializeDiscountCode))
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const code = typeof body.code === 'string' ? normalizeDiscountCode(body.code) : ''
    const label = typeof body.label === 'string' ? body.label.trim().slice(0, 60) : ''
    const type = body.type === 'FIXED' ? 'FIXED' : 'PERCENT'
    const value = Number(body.value)
    const maxUses =
      body.maxUses === null || body.maxUses === '' || body.maxUses === undefined
        ? null
        : Number(body.maxUses)
    const expiresAt =
      typeof body.expiresAt === 'string' && body.expiresAt ? parseDateInput(body.expiresAt) : null
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : ''

    const error = validationError({ code, label, type, value, maxUses, expiresAt })
    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }
    if (expiresAt && expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: '만료일은 오늘 이후로 입력해 주세요.' }, { status: 400 })
    }

    const existing = await prisma.discountCode.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: '이미 등록된 코드예요.' }, { status: 409 })
    }

    const created = await prisma.discountCode.create({
      data: { code, label, type, value, maxUses, expiresAt, note: note || null },
    })

    return NextResponse.json(serializeDiscountCode(created), { status: 201 })
  } catch {
    return NextResponse.json({ error: '할인코드를 저장하지 못했습니다.' }, { status: 500 })
  }
}
