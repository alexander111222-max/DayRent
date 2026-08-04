import type { Booking } from '@/types'
import { Card } from '@/components/ui'
import { BOOKING_STATUS_LABELS } from '@/utils/constants'
import { formatDateShort, formatPrice } from '@/utils/format'

interface BookingCardProps {
  booking: Booking
  onCancel?: (bookingId: number) => void
  isCancelling?: boolean
}

export function BookingCard({ booking, onCancel, isCancelling }: BookingCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Бронь #{booking.id}</p>
          <p className="font-medium text-slate-900">
            {formatDateShort(booking.date_from)} — {formatDateShort(booking.date_to)}
          </p>
          <p className="text-sm text-slate-600">
            {formatPrice(booking.price)}/день · итого {formatPrice(booking.total_cost)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-800">
            {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
          </span>
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
