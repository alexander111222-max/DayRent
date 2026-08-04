import { apiClient } from '@/api/client'
import type { BasketItem } from '@/types'

export const basketsApi = {
  getAll: () => apiClient.get<BasketItem[]>('/basket/').then((r) => r.data),

  add: (itemId: number) =>
    apiClient.post<BasketItem>('/basket/', null, { params: { item_id: itemId } }).then((r) => r.data),

  remove: (itemId: number) =>
    apiClient.delete<BasketItem>('/basket/', { params: { item_id: itemId } }).then((r) => r.data),
}
