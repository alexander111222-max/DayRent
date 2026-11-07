// Даты брони приходят как 'YYYY-MM-DD'. Парсим в локальную полночь,
// иначе new Date('2026-10-20') даёт UTC и в минусовых поясах съезжает на день
export function parseDay(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toDayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000)
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// Понедельник = 0
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

/** Недели месяца (с понедельника), включая хвосты соседних месяцев. */
export function getMonthWeeks(month: Date): Date[][] {
  const first = startOfMonth(month)
  const gridStart = addDays(first, -weekdayIndex(first))
  const weeksCount = Math.ceil((weekdayIndex(first) + endOfMonth(month).getDate()) / 7)

  return Array.from({ length: weeksCount }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)),
  )
}

/**
 * Занятые дни брони: date_to — день возврата (бэк проверяет пересечения
 * как date_from < to && date_to > from), поэтому последний занятый день — date_to - 1.
 */
export function getOccupiedRange(dateFrom: string, dateTo: string): { start: Date; last: Date } {
  const start = parseDay(dateFrom)
  const last = addDays(parseDay(dateTo), -1)
  return { start, last: last < start ? start : last }
}

export function formatMonthTitle(date: Date): string {
  const title = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(date)
  return title.charAt(0).toUpperCase() + title.slice(1).replace(' г.', '')
}

export function formatDayMonth(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date).replace('.', '')
}

/** Сколько занятых дней брони попадает в месяц. */
export function countDaysInMonth(dateFrom: string, dateTo: string, month: Date): number {
  const { start, last } = getOccupiedRange(dateFrom, dateTo)
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const from = start > monthStart ? start : monthStart
  const to = last < monthEnd ? last : monthEnd
  return to < from ? 0 : diffDays(to, from) + 1
}
