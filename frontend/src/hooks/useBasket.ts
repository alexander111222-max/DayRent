import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { basketsApi } from '@/api'

export function useBasket() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['basket'],
    queryFn: basketsApi.getAll,
  })

  const addMutation = useMutation({
    mutationFn: (itemId: number) => basketsApi.add(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['basket'] }),
  })

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => basketsApi.remove(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['basket'] }),
  })

  return {
    basket: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addToBasket: addMutation.mutateAsync,
    removeFromBasket: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  }
}
