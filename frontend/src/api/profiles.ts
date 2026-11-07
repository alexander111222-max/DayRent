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

  // Мои брони, которые владелец подтвердил, но аренда ещё не началась
  getConfirmedBookings: () =>
    apiClient.get<Booking[]>('/profile/confirmed').then((r) => r.data),

  // Брони на вещи пользователя, которые он как владелец должен подтвердить
  getOwnerPendingBookings: () =>
    apiClient.get<Booking[]>('/profile/pending_owners').then((r) => r.data),

  // Подтверждённые брони на вещи пользователя, которые скоро начнутся
  getOwnerConfirmedBookings: () =>
    apiClient.get<Booking[]>('/profile/confirmed_owners').then((r) => r.data),
}
