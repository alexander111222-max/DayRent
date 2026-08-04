import { apiClient } from '@/api/client'
import type { Category, CategoryCreateRequest } from '@/types'

export const categoriesApi = {
  getAll: () => apiClient.get<Category[]>('/categories/').then((r) => r.data),

  getById: (categoryId: number) =>
    apiClient.get<Category>(`/categories/${categoryId}`).then((r) => r.data),

  create: (data: CategoryCreateRequest) =>
    apiClient.post<Category>('/categories/', data).then((r) => r.data),

  delete: (categoryId: number) =>
    apiClient.delete<Category>(`/categories/${categoryId}`).then((r) => r.data),
}
