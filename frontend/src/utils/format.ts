interface ValidationErrorItem {
  msg?: string
  loc?: (string | number)[]
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(date))
}

function formatValidationDetail(detail: unknown): string | null {
  if (typeof detail === 'string') {
    return detail
  }

  if (!Array.isArray(detail)) {
    return null
  }

  const messages = detail
    .map((item: unknown) => {
      if (typeof item === 'string') {
        return item
      }

      if (item && typeof item === 'object' && 'msg' in item) {
        const errorItem = item as ValidationErrorItem
        const field = errorItem.loc
          ?.filter((part) => typeof part === 'string' && part !== 'body')
          .join('.')

        return field ? `${field}: ${errorItem.msg}` : errorItem.msg ?? null
      }

      return null
    })
    .filter((message): message is string => Boolean(message))

  return messages.length > 0 ? messages.join('; ') : null
}

export function getErrorMessage(error: unknown, fallback = 'Произошла ошибка'): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: { detail?: unknown } } }).response
    const detailMessage = formatValidationDetail(response?.data?.detail)

    if (detailMessage) {
      return detailMessage
    }

    switch (response?.status) {
      case 400:
        return 'Некорректный запрос'
      case 401:
        return 'Требуется авторизация'
      case 403:
        return 'Доступ запрещён'
      case 404:
        return 'Ресурс не найден'
      case 409:
        return 'Конфликт данных'
      case 422:
        return 'Некорректные параметры запроса'
      case 500:
        return 'Ошибка сервера. Попробуйте позже'
      default:
        break
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function pluralizeDays(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod100 >= 11 && mod100 <= 19) return `${count} дней`
  if (mod10 === 1) return `${count} день`
  if (mod10 >= 2 && mod10 <= 4) return `${count} дня`
  return `${count} дней`
}

/** ES total может быть больше, чем items из БД — показываем реальное число. */
export function getSearchDisplayTotal(
  indexTotal: number,
  itemsCount: number,
  page: number,
  perPage: number,
): number {
  if (page === 1 && itemsCount < indexTotal && itemsCount < perPage) {
    return itemsCount
  }

  return indexTotal
}
