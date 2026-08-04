import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/api'
import type { SearchParams } from '@/types'

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => searchApi.search(params),
  })
}
