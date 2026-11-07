import { Link } from 'react-router-dom'
import { BasketButton } from '@/components/items/BasketButton'
import { ItemPhoto } from '@/components/items/ItemPhoto'
import { Card } from '@/components/ui'
import { formatPrice } from '@/utils/format'
import { ROUTES } from '@/utils/constants'
import type { Item } from '@/types'

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/15">
      <Link to={ROUTES.item(item.id)} className="flex-1">
        <div className="h-40 overflow-hidden bg-linear-to-br from-violet-100 to-orange-100 [&_img]:transition [&_img]:duration-300 group-hover:[&_img]:scale-105">
          <ItemPhoto url={item.main_photo_url} alt={item.title} />
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-1 font-semibold text-slate-900">{item.title}</h3>
          <p className="line-clamp-2 text-sm text-slate-600">{item.description}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="rounded-full bg-linear-to-r from-brand-500 to-teal-500 px-2.5 py-0.5 text-sm font-bold text-white shadow-sm">
              {formatPrice(item.price)}/день
            </span>
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">📍 {item.city}</span>
          </div>
        </div>
      </Link>
      {/* Кнопка вне Link: иначе клик по ней уводил бы на страницу вещи */}
      <BasketButton item={item} className="px-4 pb-4" />
    </Card>
  )
}
