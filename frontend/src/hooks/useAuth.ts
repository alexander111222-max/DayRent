import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { UserLoginRequest, UserRegisterRequest } from '@/types'

export function useAuth() {
  const queryClient = useQueryClient()
  const { user, isAuthenticated, isLoading, fetchProfile, logout, setUser } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: (data: UserLoginRequest) => authApi.login(data),
    onSuccess: async () => {
      await fetchProfile()
      queryClient.invalidateQueries()
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: UserRegisterRequest) => authApi.register(data),
  })

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear()
    },
  })

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    setUser,
    fetchProfile,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
  }
}
