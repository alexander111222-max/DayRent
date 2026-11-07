import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profilesApi } from '@/api'
import { profileQueryOptions } from '@/api/queryClient'
import type { UserPatchRequest } from '@/types'

export function useProfile() {
  const queryClient = useQueryClient()

  const query = useQuery(profileQueryOptions)

  const updateMutation = useMutation({
    mutationFn: (data: UserPatchRequest) => profilesApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}
