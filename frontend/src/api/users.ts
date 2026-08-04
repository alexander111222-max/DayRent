import { apiClient } from '@/api/client'
import type { User } from '@/types'

export const usersApi = {
  getById: (userId: number) =>
    apiClient.get<User>(`/user/${userId}`).then((r) => r.data),

  delete: (userId: number) =>
    apiClient.delete<User>(`/user/${userId}`).then((r) => r.data),
}
