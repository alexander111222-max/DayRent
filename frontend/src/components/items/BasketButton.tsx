import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useAuth, useBasket } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { getErrorMessage } from '@/utils/format'
import type { Item } from '@/types'

interface BasketButtonProps {
  item: Pick<Item, 'id' | 'user_id'>
  size?: 'sm' | 'md'
  className?: string
}

export function BasketButton({ item, size = 'sm', className = 'w-full' }: BasketButtonProps) {
  const { isAuthenticated, user } = useAuth()
  const { basket, addToBasket, removeFromBasket, isAdding, isRemoving } = useBasket()
  const [error, setError] = useState<string | null>(null)

  // Свою вещь в корзину не кладём
  if (user?.id === item.user_id) return null

  if (!isAuthenticated) {
    return (
      <div className={className}>
        <Link to={ROUTES.login} className="block">
          <Button variant="secondary" size={size} className="w-full">
            В корзину
          </Button>
        </Link>
      </div>
    )
  }

  const inBasket = basket.some((entry) => entry.item_id === item.id)

  const handleClick = async () => {
    setError(null)
    try {
      if (inBasket) {
        await removeFromBasket(item.id)
      } else {
        await addToBasket(item.id)
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось обновить корзину'))
    }
  }

  return (
    <div className={className}>
      <Button
        variant={inBasket ? 'secondary' : 'primary'}
        size={size}
        className="w-full"
        onClick={handleClick}
        isLoading={isAdding || isRemoving}
      >
        {inBasket ? 'Убрать из корзины' : 'В корзину'}
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
