import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/api'
import type { Item } from '@/types'

async function resolveItemsByIds(itemIds: number[]): Promise<Item[]> {
  if (itemIds.length === 0) {
    return []
  }

  const uniqueIds = [...new Set(itemIds)]
  const found = new Map<number, Item>()
  let page = 1
  const perPage = 30

  while (page <= 10 && found.size < uniqueIds.length) {
    const { total, items } = await searchApi.search({ page, per_page: perPage })

    for (const item of items) {
      if (uniqueIds.includes(item.id)) {
        found.set(item.id, item)
      }
    }

    if (page * perPage >= total) {
      break
    }
    page += 1
  }

  return uniqueIds
    .map((id) => found.get(id))
    .filter((item): item is Item => Boolean(item))
}

export function useResolvedItems(itemIds: number[]) {
  const key = itemIds.slice().sort((a, b) => a - b).join(',')

  return useQuery({
    queryKey: ['resolved-items', key],
    queryFn: () => resolveItemsByIds(itemIds),
    enabled: itemIds.length > 0,
  })
}
