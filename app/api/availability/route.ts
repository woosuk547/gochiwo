import { NextRequest, NextResponse } from 'next/server'
import { getAvailabilitySnapshot } from '@/lib/reservation-service'
import { clientIp, rateLimitExceeded, tooManyRequestsResponse } from '@/lib/rate-limit'

/** 공개 가용일 (예약 페이지에 이미 노출되는 정보만. 투숙객 정보 없음) */
export async function GET(request: NextRequest) {
  if (rateLimitExceeded(`availability:${clientIp(request)}`, 60, 15 * 60 * 1000)) {
    return tooManyRequestsResponse()
  }

  const snapshot = await getAvailabilitySnapshot()

  return NextResponse.json({
    blockedDates: snapshot.blockedDates.map((item) => item.date),
    reservedRanges: snapshot.reservations.map((item) => ({
      checkIn: item.checkIn,
      checkOut: item.checkOut,
    })),
  })
}
