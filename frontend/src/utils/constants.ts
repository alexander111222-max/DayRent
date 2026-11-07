export const APP_NAME = 'DayRent'

export const ROUTES = {
  home: '/',
  search: '/search',
  item: (id: number | string) => `/items/${id}`,
  itemCreate: '/items/new',
  itemEdit: (id: number | string) => `/items/${id}/edit`,
  itemBookings: (id: number | string) => `/items/${id}/bookings`,
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
  confirmed: 'Подтверждена',
  active: 'Активна',
  completed: 'Завершена',
  cancelled: 'Отменена',
}

// Цвет бейджа статуса брони
export const BOOKING_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  confirmed: 'bg-sky-100 text-sky-800 ring-sky-200',
  active: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  completed: 'bg-slate-100 text-slate-700 ring-slate-200',
  cancelled: 'bg-rose-100 text-rose-700 ring-rose-200',
}
