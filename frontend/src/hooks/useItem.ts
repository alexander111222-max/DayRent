import { useQuery } from '@tanstack/react-query'
import { profilesApi, searchApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { Item } from '@/types'

async function findItemById(itemId: number, isAuthenticated: boolean): Promise<Item | null> {
  if (isAuthenticated) {
    try {
      const profile = await profilesApi.get()
      const fromProfile = profile.items.find((item) => item.id === itemId)
      if (fromProfile) {
        return fromProfile
      }
    } catch {
      // fall through to search
    }
  }

  let page = 1
  const perPage = 30

  while (page <= 10) {
    const { total, items } = await searchApi.search({ page, per_page: perPage })
    const found = items.find((item) => item.id === itemId)
    if (found) {
      return found
    }
    if (page * perPage >= total) {
      break
    }
    page += 1
  }

  return null
}

export function useItem(itemId: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['item', itemId, isAuthenticated],
    queryFn: () => findItemById(itemId, isAuthenticated),
    enabled: itemId > 0,
  })
}
