import { apiClient } from '@/api/client'
import type { Booking, BookingCreateRequest } from '@/types'

export const bookingsApi = {
  create: (data: BookingCreateRequest) =>
    apiClient.post<Booking>('/bookings/', data).then((r) => r.data),

  cancel: (bookingId: number) =>
    apiClient.post<Booking>('/bookings/cancel', null, { params: { booking_id: bookingId } }).then((r) => r.data),

  confirm: (bookingId: number) =>
    apiClient.post<{ status: string }>(`/bookings/confirm/${bookingId}`).then((r) => r.data),
}
