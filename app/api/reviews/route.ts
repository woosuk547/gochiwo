import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serializeGuestReview } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = await prisma.guestReview.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })
  return NextResponse.json(rows.map(serializeGuestReview))
}
