import { apiClient } from '@/api/client'
import type {
  Item,
  ItemCreateRequest,
  ItemCreateResponse,
  ItemEditRequest,
  ItemWithPhotos,
  BookingWithRenter,
} from '@/types'

export const itemsApi = {
  get: (itemId: number) =>
    apiClient.get<ItemWithPhotos>(`/items/${itemId}`).then((r) => r.data),

  getBookings: (itemId: number) =>
    apiClient.get<BookingWithRenter[]>(`/items/${itemId}/bookings`).then((r) => r.data),

  create: (data: ItemCreateRequest) =>
    apiClient.post<ItemCreateResponse>('/items/', data).then((r) => r.data),

  update: (itemId: number, data: ItemEditRequest) =>
    apiClient.patch<Item>('/items/', data, { params: { item_id: itemId } }).then((r) => r.data),

  delete: (itemId: number) =>
    apiClient.delete<Item>(`/items/${itemId}`).then((r) => r.data),

  uploadPhotos: (itemId: number, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    return apiClient
      .post<{ status: string }>(`/photos/${itemId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
