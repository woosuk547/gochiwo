import { expandDateKeys, formatDateKey, parseDateInput } from '@/lib/booking'

export const weekLabels = ['일', '월', '화', '수', '목', '금', '토']

/**
 * 해당 연/월의 달력 셀 배열을 만든다. 앞쪽 빈칸은 null, 마지막 줄도 7칸으로 채운다.
 */
export function getMonthMatrix(year: number, month: number): Array<Date | null> {
  const firstDay = new Date(Date.UTC(year, month, 1))
  const lastDate = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const leadingGap = firstDay.getUTCDay()
  const cells: Array<Date | null> = []

  for (let i = 0; i < leadingGap; i++) cells.push(null)
  for (let day = 1; day <= lastDate; day++) cells.push(new Date(Date.UTC(year, month, day)))
  while (cells.length % 7 !== 0) cells.push(null)

  return cells
}

export function addDays(dateKey: string, delta: number): string {
  const date = parseDateInput(dateKey)
  if (!date) return dateKey
  date.setUTCDate(date.getUTCDate() + delta)
  return formatDateKey(date)
}

/**
 * 날짜 범위 선택 클릭 로직. 모든 캘린더 컴포넌트가 동일한 규칙을 사용하도록 단일화한다.
 *
 * 규칙:
 * - 시작 전이거나 이미 범위가 완성된 상태면 새 체크인으로 리셋한다.
 * - 클릭한 날짜가 체크인 이전/같으면 그 날짜를 새 체크인으로 본다.
 * - 체크인~체크아웃 사이의 숙박일(체크아웃 당일 제외)에 차단/예약일이 끼면 무효 처리해 새 체크인으로 리셋한다.
 *   (체크아웃 당일은 다른 예약의 체크인일이 될 수 있으므로 점유로 보지 않는다.)
 */
export function selectDateRange(
  checkIn: string,
  checkOut: string,
  clickedKey: string,
  blockedKeys: Set<string>,
  reservedKeys: Set<string>,
): { checkIn: string; checkOut: string } {
  if (!checkIn || (checkIn && checkOut)) {
    return { checkIn: clickedKey, checkOut: '' }
  }

  const start = parseDateInput(checkIn)
  const end = parseDateInput(clickedKey)
  if (!start || !end || end <= start) {
    return { checkIn: clickedKey, checkOut: '' }
  }

  const spannedDates = expandDateKeys(checkIn, clickedKey)
  const hasOverlap = spannedDates.some((d) => blockedKeys.has(d) || reservedKeys.has(d))
  if (hasOverlap) {
    return { checkIn: clickedKey, checkOut: '' }
  }

  return { checkIn, checkOut: clickedKey }
}
