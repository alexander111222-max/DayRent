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

    activeBookings: activeQuery.data ?? [],

    completedBookings: completedQuery.data ?? [],

    isLoading: pendingQuery.isLoading || activeQuery.isLoading || completedQuery.isLoading,

    createBooking: createMutation.mutateAsync,

    cancelBooking: cancelMutation.mutateAsync,

    isCreating: createMutation.isPending,

    isCancelling: cancelMutation.isPending,

  }

}


