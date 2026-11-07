import { Link } from 'react-router-dom'
import { OwnerBookingRequests } from '@/components/bookings/OwnerBookingRequests'
import { Button, Loader, ErrorMessage } from '@/components/ui'
import { ItemGrid } from '@/components/items/ItemGrid'
import { useProfile } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { getErrorMessage } from '@/utils/format'

export function MyItemsPage() {
  const { profile, isLoading, isError, error } = useProfile()

  if (isLoading) {
    return <Loader fullScreen label="Загружаем ваши вещи..." />
  }

  if (isError || !profile) {
    return (
      <div className="page-container">
        <ErrorMessage message={getErrorMessage(error, 'Не удалось загрузить вещи')} />
      </div>
    )
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Мои вещи</h1>
          <p className="page-subtitle">Управляйте своими объявлениями</p>
        </div>
        <Link to={ROUTES.itemCreate}>
          <Button>Добавить вещь</Button>
        </Link>
      </div>

      <OwnerBookingRequests hideWhenEmpty />

      <ItemGrid
        items={profile.items}
        emptyTitle="У вас пока нет объявлений"
        emptyDescription="Создайте первое объявление, чтобы сдавать вещи в аренду"
      />

      {profile.items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profile.items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-violet-100 bg-white p-3 shadow-sm">
              <p className="mb-2 truncate text-sm font-semibold text-slate-800">{item.title}</p>
              <div className="flex gap-2">
                <Link to={ROUTES.itemBookings(item.id)} className="flex-1">
                  <Button variant="accent" className="w-full" size="sm">
                    📅 Брони
                  </Button>
                </Link>
                <Link to={ROUTES.itemEdit(item.id)} className="flex-1">
                  <Button variant="secondary" className="w-full" size="sm">
                    Изменить
                  </Button>
                </Link>
                <Link to={ROUTES.item(item.id)}>
                  <Button variant="ghost" size="sm">
                    Открыть
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
