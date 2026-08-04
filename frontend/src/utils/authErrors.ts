import { getErrorMessage } from '@/utils/format'

function getResponse(error: unknown) {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return null
  }

  return (error as { response?: { status?: number; data?: Record<string, unknown> } }).response
}

export function isEmailNotVerifiedError(error: unknown): boolean {
  const response = getResponse(error)
  if (response?.status !== 403) {
    return false
  }

  const detail = response.data?.detail
  if (typeof detail === 'string') {
    const normalized = detail.toLowerCase()
    return normalized.includes('не подтверж') || normalized.includes('not verified')
  }

  return false
}

export function getLoginErrorMessage(error: unknown): string {
  if (isEmailNotVerifiedError(error)) {
    return 'Email не подтверждён. Подтвердите почту, чтобы войти.'
  }

  return getErrorMessage(error, 'Не удалось войти')
}
