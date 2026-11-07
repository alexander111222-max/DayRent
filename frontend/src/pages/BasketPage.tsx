import { Link } from 'react-router-dom'
import { ItemCard } from '@/components/items/ItemCard'
import { Button, EmptyState, ErrorMessage, Loader } from '@/components/ui'
import { useBasket, useResolvedItems } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { getErrorMessage } from '@/utils/format'

export function BasketPage() {
  const { basket, isLoading, isError, error } = useBasket()
  const itemIds = basket.map((entry) => entry.item_id)
  const { data: items = [], isLoading: itemsLoading } = useResolvedItems(itemIds)

  if (isLoading || itemsLoading) {
    return <Loader fullScreen label="Загружаем корзину..." />
  }

  if (isError) {
    return (
      <div className="page-container">
        <ErrorMessage message={getErrorMessage(error, 'Не удалось загрузить корзину')} />
      </div>
    )
  }

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="page-title">Корзина</h1>
        <p className="page-subtitle">Вещи, которые вы присмотрели для аренды</p>
      </div>

      {basket.length === 0 ? (
        <EmptyState
          title="Корзина пуста"
          description="Добавляйте вещи кнопкой «В корзину» в поиске или на странице объявления"
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
          {/* Кнопка «Убрать из корзины» встроена в ItemCard */}
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
