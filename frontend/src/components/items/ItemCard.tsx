import { Link } from 'react-router-dom'
import { Card } from '@/components/ui'
import { formatPrice } from '@/utils/format'
import { ROUTES } from '@/utils/constants'
import type { Item } from '@/types'

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link to={ROUTES.item(item.id)}>
      <Card className="h-full overflow-hidden p-0">
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700">
          <span className="text-4xl">📦</span>
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-1 font-semibold text-slate-900">{item.title}</h3>
          <p className="line-clamp-2 text-sm text-slate-600">{item.description}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="font-semibold text-brand-700">{formatPrice(item.price)}/день</span>
            <span className="text-xs text-slate-500">{item.city}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
