import { BookingCard } from '@/components/bookings/BookingCard'
import { OwnerBookingRequests } from '@/components/bookings/OwnerBookingRequests'
import { Loader, EmptyState } from '@/components/ui'
import { useBookings, useOwnerBookings } from '@/hooks'

export function BookingsPage() {
  const {
    pendingBookings,
    confirmedBookings,
    activeBookings,
    completedBookings,
    isLoading,
    cancelBooking,
    isCancelling,
  } = useBookings()
  const { ownerConfirmedBookings } = useOwnerBookings()

  if (isLoading) {
    return <Loader fullScreen label="Загружаем бронирования..." />
  }

  return (
    <div className="page-container space-y-8">
      <div>
        <h1 className="page-title">Бронирования</h1>
        <p className="page-subtitle">Запросы на ваши вещи и ваши аренды</p>
      </div>

      <OwnerBookingRequests />

      {ownerConfirmedBookings.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Подтверждённые брони на ваши вещи ({ownerConfirmedBookings.length})
          </h2>
          {ownerConfirmedBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Мои брони: ждут подтверждения владельца</h2>
        {pendingBookings.length === 0 ? (
          <EmptyState title="Нет ожидающих броней" />
        ) : (
          pendingBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={cancelBooking}
              isCancelling={isCancelling}
            />
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Мои брони: скоро начнутся</h2>
        {confirmedBookings.length === 0 ? (
          <EmptyState title="Нет подтверждённых броней" description="Когда владелец подтвердит вашу бронь, она появится здесь" />
        ) : (
          confirmedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={cancelBooking}
              isCancelling={isCancelling}
            />
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Активные</h2>
        {activeBookings.length === 0 ? (
          <EmptyState title="Нет активных броней" />
        ) : (
          activeBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={cancelBooking}
              isCancelling={isCancelling}
            />
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Завершённые</h2>
        {completedBookings.length === 0 ? (
          <EmptyState title="История пока пуста" />
        ) : (
          completedBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </section>
    </div>
  )
}
