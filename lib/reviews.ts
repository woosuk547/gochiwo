export interface GuestReview {
  id: string
  quote: string
  guestLabel: string
  stayedAt: string
  published?: boolean
}

export function serializeGuestReview(row: {
  id: string
  quote: string
  guestLabel: string
  stayedAt: string
  published: boolean
}): GuestReview {
  return {
    id: row.id,
    quote: row.quote,
    guestLabel: row.guestLabel,
    stayedAt: row.stayedAt,
    published: row.published,
  }
}

export function validateGuestReviewInput(input: {
  quote: string
  guestLabel: string
  stayedAt: string
}): string | null {
  if (input.quote.length < 8 || input.quote.length > 400) return '후기는 8~400자로 적어 주세요.'
  if (input.guestLabel.length < 2 || input.guestLabel.length > 40) return '손님 표시는 2~40자로 적어 주세요.'
  if (input.stayedAt.length < 4 || input.stayedAt.length > 24) return '머문 시기를 확인해 주세요. 예: 2026년 8월'
  return null
}
