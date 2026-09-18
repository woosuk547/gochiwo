export interface GuestReview {
  /** 후기 본문 (1~2문장) */
  quote: string
  /** 예: '4인 가족 · 2박' */
  guestLabel: string
  /** 예: '2026년 8월' */
  stayedAt: string
}

/**
 * 실제 투숙 후기 원문. 본인 동의를 받은 후기만 추가한다.
 * 비어 있으면 홈페이지 후기 섹션을 통째로 숨긴다.
 */
export const guestReviews: GuestReview[] = []
