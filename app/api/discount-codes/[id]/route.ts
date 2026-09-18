import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { parseDateInput } from '@/lib/booking'
import { prisma } from '@/lib/prisma'
import { serializeDiscountCode } from '@/lib/reservation-service'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const { id } = await params
    const body = await request.json()
    const existing = await prisma.discountCode.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: '할인코드를 찾을 수 없어요.' }, { status: 404 })
    }

    const data: {
      label?: string
      type?: string
      value?: number
      maxUses?: number | null
      expiresAt?: Date | null
      active?: boolean
      note?: string | null
    } = {}

    if (body.label !== undefined) {
      const label = typeof body.label === 'string' ? body.label.trim().slice(0, 60) : ''
      if (!label) return NextResponse.json({ error: '코드 이름을 입력해 주세요.' }, { status: 400 })
      data.label = label
    }

    const nextType = body.type === 'FIXED' ? 'FIXED' : body.type === 'PERCENT' ? 'PERCENT' : existing.type
    if (body.type !== undefined) data.type = nextType
    if (body.value !== undefined) {
      const value = Number(body.value)
      if (nextType === 'PERCENT' && (!Number.isInteger(value) || value < 1 || value > 90)) {
        return NextResponse.json({ error: '정률은 1~90% 사이로 입력해 주세요.' }, { status: 400 })
      }
      if (nextType === 'FIXED' && (!Number.isInteger(value) || value < 1000 || value > 5000000)) {
        return NextResponse.json({ error: '정액은 1,000원~5,000,000원 사이로 입력해 주세요.' }, { status: 400 })
      }
      data.value = value
    }

    if (body.maxUses !== undefined) {
      const maxUses = body.maxUses === null || body.maxUses === '' ? null : Number(body.maxUses)
      if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 10000)) {
        return NextResponse.json({ error: '사용 횟수 상한은 1~10,000 사이로 입력해 주세요.' }, { status: 400 })
      }
      data.maxUses = maxUses
    }

    if (body.expiresAt !== undefined) {
      const expiresAt = typeof body.expiresAt === 'string' && body.expiresAt ? parseDateInput(body.expiresAt) : null
      if (body.expiresAt && !expiresAt) {
        return NextResponse.json({ error: '만료일을 다시 확인해 주세요.' }, { status: 400 })
      }
      data.expiresAt = expiresAt
    }

    if (body.active !== undefined) data.active = Boolean(body.active)
    if (body.note !== undefined) {
      const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : ''
      data.note = note || null
    }

    const updated = await prisma.discountCode.update({ where: { id }, data })
    return NextResponse.json(serializeDiscountCode(updated))
  } catch {
    return NextResponse.json({ error: '할인코드를 수정하지 못했습니다.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const { id } = await params
    await prisma.discountCode.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '할인코드를 삭제하지 못했습니다.' }, { status: 500 })
  }
}
