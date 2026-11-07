import { useMutation, useQueryClient } from '@tanstack/react-query'
import { itemsApi } from '@/api'
import type { ItemCreateRequest, ItemEditRequest } from '@/types'

export function useItems() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: ItemCreateRequest) => itemsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['search'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: ItemEditRequest }) =>
      itemsApi.update(itemId, data),
    onSuccess: (_data, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['search'] })
      queryClient.invalidateQueries({ queryKey: ['item', itemId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (itemId: number) => itemsApi.delete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['search'] })
    },
  })

  const uploadPhotosMutation = useMutation({
    mutationFn: ({ itemId, files }: { itemId: number; files: File[] }) =>
      itemsApi.uploadPhotos(itemId, files),
    onSuccess: (_data, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['item', itemId] })
      queryClient.invalidateQueries({ queryKey: ['search'] })
    },
  })

  return {
    createItem: createMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    deleteItem: deleteMutation.mutateAsync,
    uploadPhotos: uploadPhotosMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUploadingPhotos: uploadPhotosMutation.isPending,
  }
}
