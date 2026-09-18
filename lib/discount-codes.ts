export type DiscountCodeType = 'PERCENT' | 'FIXED'

export interface DiscountCodeRow {
  id: string
  code: string
  label: string
  type: string
  value: number
  maxUses: number | null
  usedCount: number
  expiresAt: Date | null
  active: boolean
}

export function normalizeDiscountCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

/** 코드 행의 사용 가능 여부. null이면 사용 가능. */
export function discountCodeError(row: DiscountCodeRow, now = new Date()): string | null {
  if (!row.active) return '사용할 수 없는 할인코드예요.'
  if (row.expiresAt && row.expiresAt.getTime() < now.getTime()) return '만료된 할인코드예요.'
  if (row.maxUses !== null && row.usedCount >= row.maxUses) return '사용 횟수를 모두 소진한 할인코드예요.'
  if (row.type !== 'PERCENT' && row.type !== 'FIXED') return '사용할 수 없는 할인코드예요.'
  if (!Number.isFinite(row.value) || row.value <= 0) return '사용할 수 없는 할인코드예요.'
  return null
}

export function toQuoteDiscountCode(row: DiscountCodeRow): { type: 'PERCENT' | 'FIXED'; value: number } {
  return { type: row.type === 'FIXED' ? 'FIXED' : 'PERCENT', value: row.value }
}
