import { useState } from 'react'
import { BookingCard } from '@/components/bookings/BookingCard'
import { EmptyState, ErrorMessage, Loader } from '@/components/ui'
import { useOwnerBookings } from '@/hooks'
import { getErrorMessage } from '@/utils/format'

interface OwnerBookingRequestsProps {
  // Скрыть секцию целиком, если запросов нет (для «Моих вещей»)
  hideWhenEmpty?: boolean
}

// Брони на вещи пользователя, ожидающие его подтверждения как владельца
export function OwnerBookingRequests({ hideWhenEmpty = false }: OwnerBookingRequestsProps) {
  const {
    ownerPendingBookings,
    isLoading,
    isError,
    error,
    confirmBooking,
    declineBooking,
    confirmingId,
    decliningId,
  } = useOwnerBookings()
  const [actionError, setActionError] = useState<string | null>(null)

  const runAction = async (action: (id: number) => Promise<unknown>, bookingId: number, fallback: string) => {
    setActionError(null)
    try {
      await action(bookingId)
    } catch (err) {
      setActionError(getErrorMessage(err, fallback))
    }
  }

  if (hideWhenEmpty && !isError && ownerPendingBookings.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        Запросы на ваши вещи{ownerPendingBookings.length > 0 && ` (${ownerPendingBookings.length})`}
      </h2>
      {actionError && <ErrorMessage message={actionError} />}
      {isLoading ? (
        <Loader label="Загружаем запросы..." />
      ) : isError ? (
        <ErrorMessage message={getErrorMessage(error, 'Не удалось загрузить запросы на бронь')} />
      ) : ownerPendingBookings.length === 0 ? (
        <EmptyState title="Новых запросов нет" />
      ) : (
        ownerPendingBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onConfirm={(id) => runAction(confirmBooking, id, 'Не удалось подтвердить бронь')}
            onDecline={(id) => {
              if (window.confirm('Отклонить бронь?')) {
                runAction(declineBooking, id, 'Не удалось отклонить бронь')
              }
            }}
            isConfirming={confirmingId === booking.id}
            isDeclining={decliningId === booking.id}
          />
        ))
      )}
    </section>
  )
}
