import { apiClient } from '@/api/client'
import type {
  Item,
  ItemCreateRequest,
  ItemCreateResponse,
  ItemEditRequest,
} from '@/types'

export const itemsApi = {
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
      .post<{ status: string }>(`/items/${itemId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
