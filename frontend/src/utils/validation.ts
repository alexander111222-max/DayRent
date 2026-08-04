import type { SearchParams } from '@/types'

const MAX_INT = 2147483647

export function normalizeSearchQuery(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? String(trimmed) : undefined
}

export function parsePositiveIntId(value: string | undefined): number | null {
  if (!value) return null

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_INT) {
    return null
  }

  return parsed
}

export function validateSearchParams(params: SearchParams): string | null {
  if (params.query !== undefined && params.query !== '' && typeof params.query !== 'string') {
    return 'Поисковый запрос должен быть строкой'
  }

  if (params.price_from !== undefined) {
    if (!Number.isInteger(params.price_from) || params.price_from < 1 || params.price_from > MAX_INT) {
      return 'Цена «от» должна быть целым числом от 1'
    }
  }

  if (params.price_to !== undefined) {
    if (!Number.isInteger(params.price_to) || params.price_to < 1 || params.price_to > MAX_INT) {
      return 'Цена «до» должна быть целым числом от 1'
    }
  }

  if (
    params.price_from !== undefined &&
    params.price_to !== undefined &&
    params.price_from > params.price_to
  ) {
    return 'Цена «от» не может быть больше цены «до»'
  }

  if (params.category_id !== undefined) {
    if (!Number.isInteger(params.category_id) || params.category_id < 1 || params.category_id > MAX_INT) {
      return 'Выберите корректную категорию'
    }
  }

  if (params.page !== undefined && (!Number.isInteger(params.page) || params.page < 1)) {
    return 'Некорректная страница'
  }

  if (params.per_page !== undefined && (!Number.isInteger(params.per_page) || params.per_page < 1 || params.per_page > 30)) {
    return 'Размер страницы должен быть от 1 до 30'
  }

  return null
}

export function validateItemPrice(price: number): string | null {
  if (!Number.isInteger(price) || price < 1 || price > MAX_INT) {
    return 'Цена должна быть целым числом от 1'
  }

  return null
}
