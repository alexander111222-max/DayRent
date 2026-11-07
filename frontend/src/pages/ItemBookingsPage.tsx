import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookingsCalendar } from '@/components/bookings/BookingsCalendar'
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge'
import { getRenterColor } from '@/components/bookings/bookingColors'
import { ItemPhoto } from '@/components/items/ItemPhoto'
import { Button, Card, ErrorMessage, Loader } from '@/components/ui'
import { useItem, useItemBookings } from '@/hooks'
import type { BookingWithRenter } from '@/types'
import {
  addDays,
  countDaysInMonth,
  diffDays,
  endOfMonth,
  formatDayMonth,
  getOccupiedRange,
  parseDay,
  startOfMonth,
  toDayKey,
} from '@/utils/calendar'
import { ROUTES } from '@/utils/constants'
import { formatPrice, getErrorMessage, pluralizeDays } from '@/utils/format'
import { parsePositiveIntId } from '@/utils/validation'

export function ItemBookingsPage() {
  const { id } = useParams()
  const itemId = parsePositiveIntId(id) ?? 0
  const { data: item } = useItem(itemId)
  const { data: bookings = [], isLoading, isError, error, refetch } = useItemBookings(itemId)

  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => a.date_from.localeCompare(b.date_from)),
    [bookings],
  )

  const monthBookings = useMemo(
    () => sortedBookings.filter((b) => countDaysInMonth(b.date_from, b.date_to, month) > 0),
    [sortedBookings, month],
  )

  const stats = useMemo(() => {
    const monthDays = endOfMonth(month).getDate()
    // Дни могут пересекаться у разных броней — считаем уникальные
    const busyDays = new Set<string>()
    let income = 0

    for (const booking of monthBookings) {
      const { start, last } = getOccupiedRange(booking.date_from, booking.date_to)
      for (let d = start; d <= last; d = addDays(d, 1)) {
        if (d.getMonth() === month.getMonth()) busyDays.add(toDayKey(d))
      }
      income += booking.price * countDaysInMonth(booking.date_from, booking.date_to, month)
    }

    return {
      count: monthBookings.length,
      busy: busyDays.size,
      occupancy: Math.round((busyDays.size / monthDays) * 100),
      income,
    }
  }, [monthBookings, month])

  const todayKey = toDayKey(new Date())
  const nextBooking = sortedBookings.find((b) => b.date_to > todayKey)
  const selected = bookings.find((b) => b.id === selectedId) ?? null

  const selectBooking = (booking: BookingWithRenter) => {
    setSelectedId((current) => (current === booking.id ? null : booking.id))
    setMonth(startOfMonth(parseDay(booking.date_from)))
  }

  if (!itemId) {
    return (
      <div className="page-container">
        <ErrorMessage message="Некорректный id вещи" />
      </div>
    )
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-violet-100 shadow-md ring-2 ring-white">
            <ItemPhoto url={item?.photos_urls?.find((p) => p.is_main)?.url ?? item?.main_photo_url} alt={item?.title ?? ''} />
          </div>
          <div>
            <Link to={ROUTES.myItems} className="text-sm font-medium text-violet-600 hover:text-fuchsia-600">
              ← Мои вещи
            </Link>
            <h1 className="page-title">Календарь броней</h1>
            {item && <p className="text-slate-600">{item.title}</p>}
          </div>
        </div>
        <Link to={ROUTES.item(itemId)}>
          <Button variant="secondary">Открыть объявление</Button>
        </Link>
      </div>

      {isLoading ? (
        <Loader fullScreen label="Загружаем брони..." />
      ) : isError ? (
        <ErrorMessage message={getErrorMessage(error, 'Не удалось загрузить брони')} onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="📅"
              label="Броней в месяце"
              value={String(stats.count)}
              className="from-violet-500 to-fuchsia-500 shadow-fuchsia-500/25"
            />
            <StatCard
              icon="🔥"
              label="Занято дней"
              value={`${stats.busy}`}
              hint={`загрузка ${stats.occupancy}%`}
              progress={stats.occupancy}
              className="from-sky-500 to-cyan-400 shadow-sky-500/25"
            />
            <StatCard
              icon="💰"
              label="Доход за месяц"
              value={formatPrice(stats.income)}
              className="from-emerald-500 to-teal-400 shadow-emerald-500/25"
            />
            <StatCard
              icon="⏭️"
              label="Ближайшая бронь"
              value={nextBooking ? formatDayMonth(parseDay(nextBooking.date_from)) : '—'}
              hint={nextBooking ? `${nextBooking.renter.username} ${nextBooking.renter.surname}` : 'броней нет'}
              onClick={nextBooking ? () => selectBooking(nextBooking) : undefined}
              className="from-amber-400 to-orange-500 shadow-orange-500/25"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <BookingsCalendar
              bookings={sortedBookings}
              month={month}
              onMonthChange={setMonth}
              selectedId={selectedId}
              onSelect={(bookingId) => setSelectedId((current) => (current === bookingId ? null : bookingId))}
            />

            <div className="space-y-4">
              {selected ? (
                <SelectedBooking booking={selected} onClose={() => setSelectedId(null)} />
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-5 text-center text-sm text-violet-700">
                  <p className="text-2xl">👆</p>
                  <p className="mt-2 font-medium">Наведите на бронь, чтобы увидеть контакты</p>
                  <p className="mt-1 text-violet-500">Нажмите — и карточка закрепится здесь</p>
                </div>
              )}

              <Card className="p-4">
                <h3 className="mb-3 font-semibold text-slate-900">Брони в этом месяце</h3>
                {monthBookings.length === 0 ? (
                  <p className="text-sm text-slate-500">В этом месяце броней нет 🌤️</p>
                ) : (
                  <ul className="space-y-2">
                    {monthBookings.map((booking) => {
                      const color = getRenterColor(booking.rent_id)
                      return (
                        <li key={booking.id}>
                          <button
                            type="button"
                            onClick={() => selectBooking(booking)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-50 ${
                              booking.id === selectedId ? `${color.soft} ring-1 ${color.ring}` : ''
                            }`}
                          >
                            <span className={`h-3 w-3 shrink-0 rounded-full ${color.dot}`} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-slate-900">
                                {booking.renter.username} {booking.renter.surname}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatDayMonth(parseDay(booking.date_from))} → {formatDayMonth(parseDay(booking.date_to))}
                              </span>
                            </span>
                            <BookingStatusBadge status={booking.status} />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: string
  label: string
  value: string
  hint?: string
  progress?: number
  className: string
  onClick?: () => void
}

function StatCard({ icon, label, value, hint, progress, className, onClick }: StatCardProps) {
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-linear-to-br p-4 text-left text-white shadow-lg ${onClick ? 'transition hover:-translate-y-0.5 hover:shadow-xl' : ''} ${className}`}
    >
      <span className="absolute -right-3 -top-3 text-6xl opacity-20">{icon}</span>
      <p className="text-sm font-medium text-white/85">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 truncate text-xs text-white/80">{hint}</p>}
      {progress !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      )}
    </Tag>
  )
}

function SelectedBooking({ booking, onClose }: { booking: BookingWithRenter; onClose: () => void }) {
  const color = getRenterColor(booking.rent_id)
  const { renter } = booking
  const days = Math.max(1, diffDays(parseDay(booking.date_to), parseDay(booking.date_from)))

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
      <div className={`flex items-start justify-between gap-3 p-4 text-white ${color.bar}`}>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white/25 text-lg font-bold">
            {renter.username.charAt(0).toUpperCase()}
            {renter.surname.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">
              {renter.username} {renter.surname}
            </p>
            <p className="text-sm text-white/85">Бронь #{booking.id}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-xl leading-none text-white/80 hover:text-white" aria-label="Закрыть">
          ×
        </button>
      </div>

      <div className="space-y-3 p-4">
        <BookingStatusBadge status={booking.status} />

        <a href={`mailto:${renter.email}`} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:brightness-95 ${color.soft}`}>
          <span>✉️</span>
          <span className={`truncate font-medium ${color.text}`}>{renter.email}</span>
        </a>
        <a href={`tel:${renter.phone}`} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:brightness-95 ${color.soft}`}>
          <span>📞</span>
          <span className={`font-medium ${color.text}`}>{renter.phone}</span>
        </a>

        <dl className="grid grid-cols-2 gap-2 pt-1 text-sm">
          <div className="rounded-xl bg-slate-50 p-2.5">
            <dt className="text-xs text-slate-500">Начало</dt>
            <dd className="font-semibold text-slate-900">{formatDayMonth(parseDay(booking.date_from))}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5">
            <dt className="text-xs text-slate-500">Возврат</dt>
            <dd className="font-semibold text-slate-900">{formatDayMonth(parseDay(booking.date_to))}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5">
            <dt className="text-xs text-slate-500">Срок</dt>
            <dd className="font-semibold text-slate-900">{pluralizeDays(days)}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5">
            <dt className="text-xs text-slate-500">Итого</dt>
            <dd className="font-semibold text-slate-900">{formatPrice(booking.total_cost)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
