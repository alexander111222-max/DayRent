import { QueryClient, queryOptions } from '@tanstack/react-query'
import { profilesApi } from '@/api/profiles'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Общий запрос профиля: его используют и проверка сессии (authStore), и useProfile,
// поэтому /profile/ уходит один раз, а не дважды
export const profileQueryOptions = queryOptions({
  queryKey: ['profile'],
  queryFn: profilesApi.get,
  staleTime: 30_000,
})
