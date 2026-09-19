import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { serializeGuestReview, validateGuestReviewInput } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await params
  try {
    const body = await request.json()
    const data: { quote?: string; guestLabel?: string; stayedAt?: string; published?: boolean } = {}

    if (typeof body.quote === 'string') data.quote = body.quote.trim()
    if (typeof body.guestLabel === 'string') data.guestLabel = body.guestLabel.trim()
    if (typeof body.stayedAt === 'string') data.stayedAt = body.stayedAt.trim()
    if (typeof body.published === 'boolean') data.published = body.published

    const quote = data.quote
    const guestLabel = data.guestLabel
    const stayedAt = data.stayedAt
    if (quote !== undefined || guestLabel !== undefined || stayedAt !== undefined) {
      const existing = await prisma.guestReview.findUnique({ where: { id } })
      if (!existing) return NextResponse.json({ error: '후기를 찾지 못했어요.' }, { status: 404 })
      const error = validateGuestReviewInput({
        quote: quote ?? existing.quote,
        guestLabel: guestLabel ?? existing.guestLabel,
        stayedAt: stayedAt ?? existing.stayedAt,
      })
      if (error) return NextResponse.json({ error }, { status: 400 })
    }

    const updated = await prisma.guestReview.update({ where: { id }, data })
    return NextResponse.json(serializeGuestReview(updated))
  } catch {
    return NextResponse.json({ error: '후기를 수정하지 못했어요.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await params
  try {
    await prisma.guestReview.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '후기를 삭제하지 못했어요.' }, { status: 500 })
  }
}
