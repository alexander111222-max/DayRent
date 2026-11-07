import { Link } from 'react-router-dom'
import type { Booking } from '@/types'
import { Button, Card } from '@/components/ui'
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge'
import { ROUTES } from '@/utils/constants'
import { diffDays, parseDay } from '@/utils/calendar'
import { formatDateShort, formatPrice, pluralizeDays } from '@/utils/format'

function formatStartsIn(dateFrom: string): string {
  const now = new Date()
  const days = diffDays(parseDay(dateFrom), new Date(now.getFullYear(), now.getMonth(), now.getDate()))
  if (days <= 0) return 'начинается сегодня'
  if (days === 1) return 'начнётся завтра'
  return `через ${pluralizeDays(days)}`
}

interface BookingCardProps {
  booking: Booking
  onCancel?: (bookingId: number) => void
  isCancelling?: boolean
  // Режим владельца: подтвердить / отклонить входящую бронь
  onConfirm?: (bookingId: number) => void
  onDecline?: (bookingId: number) => void
  isConfirming?: boolean
  isDeclining?: boolean
}

export function BookingCard({
  booking,
  onCancel,
  isCancelling,
  onConfirm,
  onDecline,
  isConfirming,
  isDeclining,
}: BookingCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Бронь #{booking.id} ·{' '}
            <Link to={ROUTES.item(booking.item_id)} className="text-brand-700 hover:underline">
              вещь #{booking.item_id}
            </Link>
          </p>
          <p className="font-medium text-slate-900">
            {formatDateShort(booking.date_from)} — {formatDateShort(booking.date_to)}
          </p>
          <p className="text-sm text-slate-600">
            {formatPrice(booking.price)}/день · итого {formatPrice(booking.total_cost)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {booking.status === 'confirmed' && (
            <span className="rounded-full bg-linear-to-r from-amber-400 to-orange-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm shadow-orange-500/30">
              🚀 {formatStartsIn(booking.date_from)}
            </span>
          )}
          <BookingStatusBadge status={booking.status} />
          {onConfirm && (
            <Button
              size="sm"
              onClick={() => onConfirm(booking.id)}
              isLoading={isConfirming}
              disabled={isDeclining}
            >
              Подтвердить
            </Button>
          )}
          {onDecline && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onDecline(booking.id)}
              isLoading={isDeclining}
              disabled={isConfirming}
            >
              Отклонить
            </Button>
          )}
          {onCancel && booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <button
              type="button"
              onClick={() => onCancel(booking.id)}
              disabled={isCancelling}
              className="text-sm text-red-600 hover:underline disabled:opacity-50"
            >
              Отменить
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
