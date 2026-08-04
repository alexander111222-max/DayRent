import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookingForm } from '@/components/bookings/BookingForm'
import { Button, Card, ErrorMessage, Loader } from '@/components/ui'
import { useAuth, useBasket, useBookings, useItem } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { formatPrice, getErrorMessage } from '@/utils/format'
import { parsePositiveIntId } from '@/utils/validation'

export function ItemDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const itemId = parsePositiveIntId(id)
  const { data: item, isLoading, isError } = useItem(itemId ?? 0)
  const { isAuthenticated, user } = useAuth()
  const { createBooking, isCreating } = useBookings()
  const { basket, addToBasket, removeFromBasket, isAdding, isRemoving } = useBasket()
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const isOwner = user?.id === item?.user_id
  const inBasket = itemId ? basket.some((entry) => entry.item_id === itemId) : false

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

  const handleBasketToggle = async () => {
    if (!itemId) return

    setActionError(null)

    try {
      if (inBasket) {
        await removeFromBasket(itemId)
      } else {
        await addToBasket(itemId)
      }
    } catch (err) {
      setActionError(getErrorMessage(err, 'Не удалось обновить избранное'))
    }
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
        <div className="mb-6 flex h-64 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 text-6xl">
          📦
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{item.title}</h1>
        <p className="mt-2 text-slate-600">{item.description}</p>
        <p className="mt-4 text-sm text-slate-500">
          {item.city}, {item.address}
        </p>
        {isOwner && (
          <Link to={ROUTES.itemEdit(item.id)} className="mt-4 inline-block">
            <Button variant="secondary" size="sm">
              Редактировать
            </Button>
          </Link>
        )}
      </Card>

      <Card className="h-fit space-y-4">
        <div>
          <p className="text-sm text-slate-500">Цена за день</p>
          <p className="text-3xl font-bold text-brand-700">{formatPrice(item.price)}</p>
        </div>

        {actionError && <ErrorMessage message={actionError} />}
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
            , чтобы забронировать или добавить в избранное.
          </p>
        )}

        {isAuthenticated && !isOwner && (
          <>
            <BookingForm item={item} onSubmit={handleBooking} isSubmitting={isCreating} />
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleBasketToggle}
              isLoading={isAdding || isRemoving}
            >
              {inBasket ? 'Убрать из избранного' : 'В избранное'}
            </Button>
          </>
        )}

        {isOwner && (
          <p className="text-sm text-slate-500">Это ваше объявление — бронировать его нельзя.</p>
        )}
      </Card>
    </div>
  )
}
