import type { BookingStatus } from '@/types'
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_STYLES } from '@/utils/constants'

interface BookingStatusBadgeProps {
  status: BookingStatus
  className?: string
}

export function BookingStatusBadge({ status, className = '' }: BookingStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${BOOKING_STATUS_STYLES[status] ?? BOOKING_STATUS_STYLES.completed} ${className}`}
    >
      {status === 'active' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />}
      {BOOKING_STATUS_LABELS[status] ?? status}
    </span>
  )
}
