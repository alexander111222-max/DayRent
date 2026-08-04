import { apiClient } from '@/api/client'
import type { Booking, ProfileResponse, User, UserPatchRequest } from '@/types'

export const profilesApi = {
  get: () => apiClient.get<ProfileResponse>('/profile/').then((r) => r.data),

  update: (data: UserPatchRequest) =>
    apiClient.patch<User>('/profile/modify', data).then((r) => r.data),

  getActiveBookings: () =>
    apiClient.get<Booking[]>('/profile/active').then((r) => r.data),

  getCompletedBookings: () =>
    apiClient.get<Booking[]>('/profile/completed').then((r) => r.data),

  getPendingBookings: () =>
    apiClient.get<Booking[]>('/profile/pending').then((r) => r.data),
}
