import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { serializeGuestReview, validateGuestReviewInput } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const rows = await prisma.guestReview.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(rows.map(serializeGuestReview))
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const quote = typeof body.quote === 'string' ? body.quote.trim() : ''
    const guestLabel = typeof body.guestLabel === 'string' ? body.guestLabel.trim() : ''
    const stayedAt = typeof body.stayedAt === 'string' ? body.stayedAt.trim() : ''
    const published = body.published !== false

    const error = validateGuestReviewInput({ quote, guestLabel, stayedAt })
    if (error) return NextResponse.json({ error }, { status: 400 })

    const created = await prisma.guestReview.create({
      data: { quote, guestLabel, stayedAt, published },
    })
    return NextResponse.json(serializeGuestReview(created), { status: 201 })
  } catch {
    return NextResponse.json({ error: '후기를 저장하지 못했어요.' }, { status: 500 })
  }
}
