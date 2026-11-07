import { apiClient } from '@/api/client'
import { normalizeSearchQuery } from '@/utils/validation'
import type { SearchParams, SearchResponse } from '@/types'

function buildSearchQueryParams(params: SearchParams) {
  const query = normalizeSearchQuery(params.query)

  return {
    ...(query !== undefined && { query }),
    ...(params.price_from !== undefined && { price_from: params.price_from }),
    ...(params.price_to !== undefined && { price_to: params.price_to }),
    ...(params.city?.trim() && { city: params.city.trim() }),
    ...(params.category_id !== undefined && { category_id: params.category_id }),
    ...(params.nearby !== undefined && { nearby: params.nearby }),
    ...(params.page !== undefined && { page: params.page }),
    ...(params.per_page !== undefined && { per_page: params.per_page }),
  }
}

export const searchApi = {
  search: (params: SearchParams) =>
    apiClient
      .get<SearchResponse>('/search/', {
        params: buildSearchQueryParams(params),
        paramsSerializer: {
          serialize: (rawParams) => {
            const searchParams = new URLSearchParams()

            Object.entries(rawParams).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, String(value))
              }
            })

            return searchParams.toString()
          },
        },
      })
      .then((r) => r.data),
}
