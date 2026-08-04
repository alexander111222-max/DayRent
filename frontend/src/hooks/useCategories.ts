import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/api'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })
}

export function useCategory(categoryId: number) {
  return useQuery({
    queryKey: ['categories', categoryId],
    queryFn: () => categoriesApi.getById(categoryId),
    enabled: categoryId > 0,
  })
}
