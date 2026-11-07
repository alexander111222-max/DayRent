import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, profilesApi } from '@/api'
import { useAuthStore } from '@/store/authStore'

// Брони на вещи текущего пользователя, ожидающие его подтверждения как владельца
export function useOwnerBookings() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const query = useQuery({
    queryKey: ['bookings', 'owner-pending'],
    queryFn: profilesApi.getOwnerPendingBookings,
    enabled: isAuthenticated,
  })

  const confirmedQuery = useQuery({
    queryKey: ['bookings', 'owner-confirmed'],
    queryFn: profilesApi.getOwnerConfirmedBookings,
    enabled: isAuthenticated,
  })

  const confirmMutation = useMutation({
    mutationFn: (bookingId: number) => bookingsApi.confirm(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })

  // Владелец отклоняет бронь тем же эндпоинтом отмены
  const declineMutation = useMutation({
    mutationFn: (bookingId: number) => bookingsApi.cancel(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })

  return {
    ownerPendingBookings: query.data ?? [],
    ownerConfirmedBookings: [...(confirmedQuery.data ?? [])].sort((a, b) => a.date_from.localeCompare(b.date_from)),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    confirmBooking: confirmMutation.mutateAsync,
    declineBooking: declineMutation.mutateAsync,
    confirmingId: confirmMutation.isPending ? confirmMutation.variables : undefined,
    decliningId: declineMutation.isPending ? declineMutation.variables : undefined,
  }
}
