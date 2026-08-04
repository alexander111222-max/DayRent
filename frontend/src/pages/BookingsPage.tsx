import { BookingCard } from '@/components/bookings/BookingCard'

import { Loader, EmptyState } from '@/components/ui'

import { useBookings } from '@/hooks'



export function BookingsPage() {

  const {

    pendingBookings,

    activeBookings,

    completedBookings,

    isLoading,

    cancelBooking,

    isCancelling,

  } = useBookings()



  if (isLoading) {

    return <Loader fullScreen label="Загружаем бронирования..." />

  }



  return (

    <div className="page-container space-y-8">

      <div>

        <h1 className="page-title">Мои бронирования</h1>

        <p className="page-subtitle">Ожидающие, активные и завершённые аренды</p>

      </div>



      <section className="space-y-4">

        <h2 className="text-lg font-semibold text-slate-900">Ожидают подтверждения</h2>

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


