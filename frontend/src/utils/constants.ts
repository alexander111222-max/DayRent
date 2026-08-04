export const APP_NAME = 'DayRent'

export const ROUTES = {
  home: '/',
  search: '/search',
  item: (id: number | string) => `/items/${id}`,
  itemCreate: '/items/new',
  itemEdit: (id: number | string) => `/items/${id}/edit`,
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  profile: '/profile',
  myItems: '/profile/items',
  basket: '/basket',
  bookings: '/bookings',
} as const

export const DEFAULT_PAGE_SIZE = 12
export const HOME_ITEMS_PREVIEW = 12

export const VERIFY_CODE_LENGTH = 6
export const VERIFY_CODE_TTL_SECONDS = 600
export const RESEND_COOLDOWN_SECONDS = 60

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает',
  active: 'Активна',
  completed: 'Завершена',
  cancelled: 'Отменена',
}
