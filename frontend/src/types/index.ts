export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'

export interface User {
  id: number
  username: string
  surname: string
  age: number
  phone: string
  email: string
  city: string
  address: string
  lat: string | null
  lon: string | null
  is_verified?: boolean
}

export interface UserRegisterRequest {
  username: string
  surname: string
  age: number
  phone: string
  email: string
  city: string
  address: string
  password: string
  password_confirm: string
}

export interface UserLoginRequest {
  email: string
  password: string
}

export interface UserPatchRequest {
  username?: string
  surname?: string
  age?: number
  phone?: string
  email?: string
  city?: string
  address?: string
}

export interface Item {
  id: number
  title: string
  price: number
  description: string
  city: string
  address: string
  lat: string | null
  lon: string | null
  user_id: number
  category_id: number
  created_at: string
  main_photo_url?: string | null
}

export interface ItemPhotoWithUrl {
  id: number
  item_id: number
  position: number
  is_main: boolean
  url: string | null
}

export interface ItemWithPhotos extends Item {
  photos_urls: ItemPhotoWithUrl[]
}

export interface ItemCreateRequest {
  title: string
  price: number
  description: string
  city: string
  address: string
  category_id: number
}

export interface ItemEditRequest {
  title?: string
  price?: number
  description?: string
  city?: string
  address?: string
  category_id?: number
}

export interface Category {
  id: number
  title: string
}

export interface CategoryCreateRequest {
  title: string
}

export interface BasketItem {
  id: number
  user_id: number
  item_id: number
}

export interface Booking {
  id: number
  date_from: string
  date_to: string
  status: BookingStatus
  price: number
  item_id: number
  owner_id: number
  rent_id: number
  total_cost: number
}

export interface Renter {
  username: string
  surname: string
  phone: string
  email: string
}

export interface BookingWithRenter extends Booking {
  renter: Renter
}

export interface BookingCreateRequest {
  date_from: string
  date_to: string
  price: number
  item_id: number
  owner_id: number
}

export interface SearchHit {
  id: string
  score: number
  title: string
  description: string
  city: string
  price: number
  created_at: string
}

export interface SearchParams {
  query?: string
  price_from?: number
  price_to?: number
  city?: string
  category_id?: number
  nearby?: boolean
  page?: number
  per_page?: number
}

export interface ProfileResponse {
  user: User
  items: Item[]
}

export interface ApiError {
  detail: string | ValidationErrorDetail[] | { msg: string; type: string; loc?: (string | number)[] }[]
}

export interface ValidationErrorDetail {
  type: string
  loc: (string | number)[]
  msg: string
  input?: unknown
}

export interface PaginationMeta {
  page: number
  perPage: number
}

export interface AuthStatus {
  status: 'ok'
}

export interface RegisterResponse {
  added_user: User
}

export interface ItemCreateResponse {
  added_item: Item
}

export interface LogoutResponse {
  Logout: string
}

export interface ResendCodeRequest {
  email: string
}

export interface ResendCodeResponse {
  success: boolean
}

export interface VerifyEmailRequest {
  email: string
  code: number
}

export interface VerifyEmailResponse {
  verify: boolean
}

export interface SearchResponse {
  total: number
  items: Item[]
}
