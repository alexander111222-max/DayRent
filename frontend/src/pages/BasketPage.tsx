import { Link } from 'react-router-dom'
import { ItemCard } from '@/components/items/ItemCard'
import { Button, EmptyState, ErrorMessage, Loader } from '@/components/ui'
import { useBasket, useResolvedItems } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { getErrorMessage } from '@/utils/format'

export function BasketPage() {
  const { basket, isLoading, isError, error, removeFromBasket, isRemoving } = useBasket()
  const itemIds = basket.map((entry) => entry.item_id)
  const { data: items = [], isLoading: itemsLoading } = useResolvedItems(itemIds)

  if (isLoading || itemsLoading) {
    return <Loader fullScreen label="Загружаем избранное..." />
  }

  if (isError) {
    return (
      <div className="page-container">
        <ErrorMessage message={getErrorMessage(error, 'Не удалось загрузить избранное')} />
      </div>
    )
  }

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="page-title">Избранное</h1>
        <p className="page-subtitle">Сохранённые объявления для быстрого доступа</p>
      </div>

      {basket.length === 0 ? (
        <EmptyState
          title="Избранное пусто"
          description="Добавляйте понравившиеся вещи с карточки объявления"
          action={
            <Link to={ROUTES.search}>
              <Button>Перейти к поиску</Button>
            </Link>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Не удалось загрузить карточки"
          description="Объявления могли быть удалены или ещё не попали в поисковый индекс"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="space-y-2">
              <ItemCard item={item} />
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => removeFromBasket(item.id)}
                isLoading={isRemoving}
              >
                Убрать из избранного
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
