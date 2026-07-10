/** 앱 공개 URL — 결제 리다이렉트·메일 링크용 */
export function getAppUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (process.env.NODE_ENV === 'production') return 'https://repause.co.kr'
  return 'http://localhost:3000'
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_DIGITS_RE = /^01[016789]\d{7,8}$|^0\d{1,2}\d{7,8}$/

export function isValidEmail(value: string) {
  return EMAIL_RE.test(value.trim().toLowerCase())
}

/** 하이픈 제거 후 국내 휴대/유선 형식 */
export function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return PHONE_DIGITS_RE.test(digits)
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, '')
}
