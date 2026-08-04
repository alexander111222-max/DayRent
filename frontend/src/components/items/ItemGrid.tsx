import { ItemCard } from '@/components/items/ItemCard'
import { EmptyState } from '@/components/ui'
import type { Item } from '@/types'

interface ItemGridProps {
  items: Item[]
  emptyTitle?: string
  emptyDescription?: string
}

export function ItemGrid({
  items,
  emptyTitle = 'Ничего не найдено',
  emptyDescription = 'Попробуйте изменить фильтры поиска',
}: ItemGridProps) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
