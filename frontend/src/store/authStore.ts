import { create } from 'zustand'
import { authApi } from '@/api'
import { profileQueryOptions, queryClient } from '@/api/queryClient'
import type { User } from '@/types'

// Профиль грузим через кэш react-query, чтобы useProfile не делал второй запрос.
// staleTime: 0 — проверка сессии всегда идёт на сервер (одновременные вызовы дедуплицируются)
const fetchProfileQuery = () =>
  queryClient.fetchQuery({ ...profileQueryOptions, staleTime: 0, retry: false })

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionChecked: boolean
  checkSession: () => Promise<void>
  fetchProfile: () => Promise<void>
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  reset: () => void
}

let sessionCheckPromise: Promise<void> | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sessionChecked: false,

  checkSession: async () => {
    if (sessionCheckPromise) {
      return sessionCheckPromise
    }

    sessionCheckPromise = (async () => {
      set({ isLoading: true })

      try {
        const profile = await fetchProfileQuery()
        set({
          user: profile.user,
          isAuthenticated: true,
          isLoading: false,
          sessionChecked: true,
        })
      } catch {
        try {
          await authApi.refresh()
          const profile = await fetchProfileQuery()
          set({
            user: profile.user,
            isAuthenticated: true,
            isLoading: false,
            sessionChecked: true,
          })
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            sessionChecked: true,
          })
        }
      }
    })().finally(() => {
      sessionCheckPromise = null
    })

    return sessionCheckPromise
  },

  fetchProfile: async () => {
    await get().checkSession()
  },

  setUser: (user) => set({ user, isAuthenticated: Boolean(user), sessionChecked: true }),

  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      set({ user: null, isAuthenticated: false, sessionChecked: true, isLoading: false })
    }
  },

  reset: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionChecked: true,
    }),
}))
