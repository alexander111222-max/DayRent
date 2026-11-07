import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { BookingForm } from '@/components/bookings/BookingForm'
import { ItemGallery } from '@/components/items/ItemGallery'
import { BasketButton } from '@/components/items/BasketButton'
import { Button, Card, Loader } from '@/components/ui'
import { useAuth, useBookings, useItem } from '@/hooks'
import type { PendingPhotosState } from '@/hooks/useItem'
import { ROUTES } from '@/utils/constants'
import { formatPrice } from '@/utils/format'
import { parsePositiveIntId } from '@/utils/validation'

export function ItemDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const itemId = parsePositiveIntId(id)
  const location = useLocation()
  const pendingPhotos = (location.state as PendingPhotosState | null)?.pendingPhotos
  const { data: item, isLoading, isError, isPhotosProcessing } = useItem(itemId ?? 0, pendingPhotos)
  const { isAuthenticated, user } = useAuth()
  const { createBooking, isCreating } = useBookings()
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const isOwner = user?.id === item?.user_id

  const handleBooking = async (payload: {
    date_from: string
    date_to: string
    price: number
    item_id: number
    owner_id: number
  }) => {
    await createBooking(payload)
    setBookingSuccess(true)
    navigate(ROUTES.bookings)
  }

  if (!itemId) {
    return (
      <div className="page-container">
        <Card>
          <h1 className="page-title">Объявление не найдено</h1>
          <p className="page-subtitle">Некорректный id объявления.</p>
          <Link to={ROUTES.search} className="mt-4 inline-block">
            <Button variant="secondary">Вернуться к поиску</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return <Loader fullScreen label="Загружаем объявление..." />
  }

  if (isError || !item) {
    return (
      <div className="page-container">
        <Card>
          <h1 className="page-title">Объявление не найдено</h1>
          <p className="page-subtitle">
            Объявление не найдено или удалено.
          </p>
          <Link to={ROUTES.search} className="mt-4 inline-block">
            <Button variant="secondary">Вернуться к поиску</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card>
        <ItemGallery photos={item.photos_urls ?? []} alt={item.title} />
        {isPhotosProcessing && (
          <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
            Фото обрабатываются, появятся через несколько секунд...
          </p>
        )}
        <h1 className="text-2xl font-bold text-slate-900">{item.title}</h1>
        <p className="mt-2 text-slate-600">{item.description}</p>
        <p className="mt-4 text-sm text-slate-500">
          {item.city}, {item.address}
        </p>
        {isOwner && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={ROUTES.itemBookings(item.id)}>
              <Button variant="accent" size="sm">
                📅 Календарь броней
              </Button>
            </Link>
            <Link to={ROUTES.itemEdit(item.id)}>
              <Button variant="secondary" size="sm">
                Редактировать
              </Button>
            </Link>
          </div>
        )}
      </Card>

      <Card className="h-fit space-y-4">
        <div>
          <p className="text-sm text-slate-500">Цена за день</p>
          <p className="text-3xl font-bold text-brand-700">{formatPrice(item.price)}</p>
        </div>

        {bookingSuccess && (
          <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
            Бронь создана. Перенаправляем...
          </p>
        )}

        {!isAuthenticated && (
          <p className="text-sm text-slate-600">
            <Link to={ROUTES.login} className="font-medium text-brand-700 hover:underline">
              Войдите
            </Link>
            , чтобы забронировать или добавить в корзину.
          </p>
        )}

        {isAuthenticated && !isOwner && (
          <>
            <BookingForm item={item} onSubmit={handleBooking} isSubmitting={isCreating} />
            <BasketButton item={item} size="md" />
          </>
        )}

        {isOwner && (
          <p className="text-sm text-slate-500">Это ваше объявление — бронировать его нельзя.</p>
        )}
      </Card>
    </div>
  )
}
