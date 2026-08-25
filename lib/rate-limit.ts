import { NextRequest, NextResponse } from 'next/server'

type Hits = number[]

const buckets = new Map<string, Hits>()
const MAX_KEYS = 8_000

function prune(now: number) {
  if (buckets.size < MAX_KEYS) return
  for (const [key, hits] of buckets) {
    const fresh = hits.filter((t) => now - t < 60 * 60 * 1000)
    if (fresh.length === 0) buckets.delete(key)
    else buckets.set(key, fresh)
  }
}

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first.slice(0, 64)
  }
  const real = request.headers.get('x-real-ip')?.trim()
  if (real) return real.slice(0, 64)
  return 'unknown'
}

/** true면 한도를 넘김 (이번 요청은 거절) */
export function rateLimitExceeded(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  prune(now)
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) {
    buckets.set(key, hits)
    return true
  }
  hits.push(now)
  buckets.set(key, hits)
  return false
}

export function tooManyRequestsResponse() {
  return NextResponse.json(
    { error: '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.' },
    { status: 429, headers: { 'Retry-After': '60' } },
  )
}
