import { useQuery } from '@tanstack/react-query'
import { itemsApi } from '@/api'

export function useItemBookings(itemId: number) {
  return useQuery({
    queryKey: ['item-bookings', itemId],
    queryFn: () => itemsApi.getBookings(itemId),
    enabled: itemId > 0,
  })
}
