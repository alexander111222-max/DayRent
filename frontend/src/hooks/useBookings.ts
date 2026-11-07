import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { bookingsApi, profilesApi } from '@/api'

import type { BookingCreateRequest } from '@/types'



export function useBookings() {

  const queryClient = useQueryClient()



  const pendingQuery = useQuery({

    queryKey: ['bookings', 'pending'],

    queryFn: profilesApi.getPendingBookings,

  })



  const activeQuery = useQuery({

    queryKey: ['bookings', 'active'],

    queryFn: profilesApi.getActiveBookings,

  })



  // Ручки /profile/confirmed может ещё не быть на бэке — тогда 404 и секция просто пустая
  const confirmedQuery = useQuery({

    queryKey: ['bookings', 'confirmed'],

    queryFn: profilesApi.getConfirmedBookings,

    retry: false,

  })



  const completedQuery = useQuery({

    queryKey: ['bookings', 'completed'],

    queryFn: profilesApi.getCompletedBookings,

  })



  const createMutation = useMutation({

    mutationFn: (data: BookingCreateRequest) => bookingsApi.create(data),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['bookings'] })

    },

  })



  const cancelMutation = useMutation({

    mutationFn: (bookingId: number) => bookingsApi.cancel(bookingId),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['bookings'] })

    },

  })



  return {

    pendingBookings: pendingQuery.data ?? [],

    confirmedBookings: [...(confirmedQuery.data ?? [])].sort((a, b) => a.date_from.localeCompare(b.date_from)),

    activeBookings: activeQuery.data ?? [],

    completedBookings: completedQuery.data ?? [],

    isLoading: pendingQuery.isLoading || activeQuery.isLoading || completedQuery.isLoading,

    createBooking: createMutation.mutateAsync,

    cancelBooking: cancelMutation.mutateAsync,

    isCreating: createMutation.isPending,

    isCancelling: cancelMutation.isPending,

  }

}


