import { useMemo, useState, type MouseEvent } from 'react'
import type { BookingWithRenter } from '@/types'
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge'
import { getRenterColor } from '@/components/bookings/bookingColors'
import {
  addMonths,
  diffDays,
  formatDayMonth,
  formatMonthTitle,
  getMonthWeeks,
  getOccupiedRange,
  isSameDay,
  parseDay,
} from '@/utils/calendar'
import { formatPrice, pluralizeDays } from '@/utils/format'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Геометрия строки недели (px)
const DAY_HEADER_HEIGHT = 34
const LANE_HEIGHT = 26
const ROW_PADDING_BOTTOM = 8
const MIN_ROW_HEIGHT = 92

interface BookingsCalendarProps {
  bookings: BookingWithRenter[]
  month: Date
  onMonthChange: (month: Date) => void
  selectedId: number | null
  onSelect: (bookingId: number) => void
}

interface WeekSegment {
  booking: BookingWithRenter
  colStart: number
  colEnd: number
  lane: number
  continuesLeft: boolean
  continuesRight: boolean
}

interface HoverState {
  booking: BookingWithRenter
  x: number
  y: number
}

function getWeekSegments(week: Date[], bookings: BookingWithRenter[]): WeekSegment[] {
  const weekStart = week[0]
  const weekEnd = week[6]

  const segments = bookings
    .map((booking) => {
      const { start, last } = getOccupiedRange(booking.date_from, booking.date_to)
      if (start > weekEnd || last < weekStart) return null

      return {
        booking,
        colStart: Math.max(0, diffDays(start, weekStart)),
        colEnd: Math.min(6, diffDays(last, weekStart)),
        lane: 0,
        continuesLeft: start < weekStart,
        continuesRight: last > weekEnd,
      }
    })
    .filter((s): s is WeekSegment => s !== null)
    .sort((a, b) => a.colStart - b.colStart || b.colEnd - a.colEnd)

  // Жадно раскладываем по дорожкам, чтобы пересекающиеся брони не налезали друг на друга
  const laneEnds: number[] = []
  for (const segment of segments) {
    const lane = laneEnds.findIndex((end) => end < segment.colStart)
    segment.lane = lane === -1 ? laneEnds.length : lane
    laneEnds[segment.lane] = segment.colEnd
  }

  return segments
}

export function BookingsCalendar({ bookings, month, onMonthChange, selectedId, onSelect }: BookingsCalendarProps) {
  const [hover, setHover] = useState<HoverState | null>(null)
  const today = new Date()

  const weeks = useMemo(
    () => getMonthWeeks(month).map((days) => ({ days, segments: getWeekSegments(days, bookings) })),
    [month, bookings],
  )

  const handleHover = (booking: BookingWithRenter) => (e: MouseEvent) =>
    setHover({ booking, x: e.clientX, y: e.clientY })

  return (
    <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-lg shadow-violet-500/5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-linear-to-r from-violet-600 via-fuchsia-500 to-orange-400 px-5 py-4 text-white">
        <h2 className="text-xl font-bold tracking-tight drop-shadow-sm sm:text-2xl">{formatMonthTitle(month)}</h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, -1))}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-lg transition hover:bg-white/30"
            aria-label="Предыдущий месяц"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold transition hover:bg-white/30"
          >
            Сегодня
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-lg transition hover:bg-white/30"
            aria-label="Следующий месяц"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-violet-100 bg-violet-50/60">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`py-2 text-center text-xs font-bold uppercase tracking-wider ${i >= 5 ? 'text-rose-500' : 'text-violet-500'}`}
          >
            {day}
          </div>
        ))}
      </div>

      <div onMouseLeave={() => setHover(null)}>
        {weeks.map(({ days, segments }) => {
          const lanes = segments.reduce((max, s) => Math.max(max, s.lane + 1), 0)
          const height = Math.max(MIN_ROW_HEIGHT, DAY_HEADER_HEIGHT + lanes * LANE_HEIGHT + ROW_PADDING_BOTTOM)

          return (
            <div key={days[0].toISOString()} className="relative border-b border-slate-100 last:border-b-0" style={{ height }}>
              <div className="grid h-full grid-cols-7">
                {days.map((day, i) => {
                  const inMonth = day.getMonth() === month.getMonth()
                  const isToday = isSameDay(day, today)
                  const isWeekend = i >= 5

                  return (
                    <div
                      key={day.toISOString()}
                      className={`border-r border-slate-100 px-1.5 pt-1.5 last:border-r-0 ${
                        !inMonth ? 'bg-slate-50/80' : isWeekend ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                          isToday
                            ? 'bg-linear-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/40'
                            : !inMonth
                              ? 'text-slate-300'
                              : isWeekend
                                ? 'text-rose-500'
                                : 'text-slate-700'
                        }`}
                      >
                        {day.getDate()}
                      </span>
                    </div>
                  )
                })}
              </div>

              {segments.map((segment) => {
                const { booking } = segment
                const color = getRenterColor(booking.rent_id)
                const span = segment.colEnd - segment.colStart + 1
                const isSelected = booking.id === selectedId
                const isDimmed = selectedId !== null && !isSelected

                return (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => onSelect(booking.id)}
                    onMouseEnter={handleHover(booking)}
                    onMouseMove={handleHover(booking)}
                    onMouseLeave={() => setHover(null)}
                    className={`absolute flex items-center overflow-hidden px-2 text-left text-xs font-semibold text-white shadow-md transition hover:-translate-y-px hover:brightness-110 ${color.bar} ${
                      segment.continuesLeft ? 'rounded-l-none' : 'rounded-l-full'
                    } ${segment.continuesRight ? 'rounded-r-none' : 'rounded-r-full'} ${
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-violet-400' : ''
                    } ${isDimmed ? 'opacity-45' : ''}`}
                    style={{
                      top: DAY_HEADER_HEIGHT + segment.lane * LANE_HEIGHT,
                      height: LANE_HEIGHT - 4,
                      left: `calc(${(segment.colStart / 7) * 100}% + ${segment.continuesLeft ? 0 : 4}px)`,
                      width: `calc(${(span / 7) * 100}% - ${(segment.continuesLeft ? 0 : 4) + (segment.continuesRight ? 0 : 4)}px)`,
                    }}
                  >
                    <span className="truncate">
                      {segment.continuesLeft && '← '}
                      {booking.renter.username} {booking.renter.surname}
                    </span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

      {hover && <BookingTooltip {...hover} />}
    </div>
  )
}

function BookingTooltip({ booking, x, y }: HoverState) {
  const color = getRenterColor(booking.rent_id)
  const { renter } = booking
  const days = Math.max(1, diffDays(parseDay(booking.date_to), parseDay(booking.date_from)))

  // Держим карточку в пределах окна: если справа/снизу не влезает — переворачиваем
  const width = 280
  const left = x + 16 + width > window.innerWidth ? x - width - 16 : x + 16
  const top = y + 200 > window.innerHeight ? y - 190 : y + 16

  return (
    <div
      className="pointer-events-none fixed z-50 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-violet-900/20 ring-1 ring-slate-200"
      style={{ left: Math.max(8, left), top: Math.max(8, top), width }}
    >
      <div className={`h-1.5 ${color.bar}`} />
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white ${color.dot}`}>
            {renter.username.charAt(0).toUpperCase()}
            {renter.surname.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {renter.username} {renter.surname}
            </p>
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          <p className="flex items-center gap-2 text-slate-700">
            <span className={`grid h-6 w-6 place-items-center rounded-lg ${color.soft}`}>✉️</span>
            <span className="truncate">{renter.email}</span>
          </p>
          <p className="flex items-center gap-2 text-slate-700">
            <span className={`grid h-6 w-6 place-items-center rounded-lg ${color.soft}`}>📞</span>
            {renter.phone}
          </p>
        </div>

        <div className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${color.soft}`}>
          <span className={`font-medium ${color.text}`}>
            {formatDayMonth(parseDay(booking.date_from))} → {formatDayMonth(parseDay(booking.date_to))}
          </span>
          <span className="text-slate-600">{pluralizeDays(days)}</span>
        </div>
        <p className="flex justify-between text-sm">
          <span className="text-slate-500">Итого</span>
          <span className="font-bold text-slate-900">{formatPrice(booking.total_cost)}</span>
        </p>
      </div>
    </div>
  )
}

