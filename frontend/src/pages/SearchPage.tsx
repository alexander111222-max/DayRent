import { useState } from 'react'

import { SearchFilters } from '@/components/search/SearchFilters'

import { ItemGrid } from '@/components/items/ItemGrid'

import { Loader, ErrorMessage, Pagination } from '@/components/ui'

import { useCategories, useSearch } from '@/hooks'

import { DEFAULT_PAGE_SIZE } from '@/utils/constants'

import type { SearchParams } from '@/types'

import { getErrorMessage, getSearchDisplayTotal } from '@/utils/format'

import { normalizeSearchQuery, validateSearchParams } from '@/utils/validation'



export function SearchPage() {

  const [filters, setFilters] = useState<SearchParams>({ page: 1, per_page: DEFAULT_PAGE_SIZE })

  const [appliedFilters, setAppliedFilters] = useState(filters)

  const [validationError, setValidationError] = useState<string | null>(null)

  const { data: categories = [] } = useCategories()

  const { data, isLoading, isError, error, refetch } = useSearch(appliedFilters)



  const page = appliedFilters.page ?? 1

  const perPage = appliedFilters.per_page ?? DEFAULT_PAGE_SIZE

  const displayTotal = data ? getSearchDisplayTotal(data.total, data.items.length, page, perPage) : 0

  const indexOutOfSync = data ? data.items.length < data.total : false



  const handleApplyFilters = () => {

    const normalizedFilters: SearchParams = {

      ...filters,

      query: normalizeSearchQuery(filters.query),

      city: filters.city?.trim() || undefined,

    }



    const nextValidationError = validateSearchParams(normalizedFilters)

    if (nextValidationError) {

      setValidationError(nextValidationError)

      return

    }



    setValidationError(null)

    setFilters(normalizedFilters)

    setAppliedFilters({ ...normalizedFilters, page: 1 })

  }



  return (

    <div className="page-container space-y-6">

      <div>

        <h1 className="page-title">Поиск вещей</h1>

        <p className="page-subtitle">Фильтры подключены к `/search/` вашего бэкенда</p>

      </div>



      <SearchFilters

        filters={filters}

        categories={categories}

        onChange={setFilters}

        onSubmit={handleApplyFilters}

        isLoading={isLoading}

      />



      {validationError && <ErrorMessage message={validationError} />}

      {isLoading && <Loader label="Ищем объявления..." />}

      {isError && (

        <ErrorMessage message={getErrorMessage(error)} onRetry={() => refetch()} />

      )}



      {!isLoading && !isError && data && (

        <>

          <p className="text-sm text-slate-600">

            Найдено: {displayTotal}

            {indexOutOfSync && page === 1 && (

              <span className="text-slate-500">

                {' '}

                · в Elasticsearch {data.total}, часть уже удалена из БД

              </span>

            )}

          </p>

          <ItemGrid items={data.items} />

          <Pagination

            page={page}

            total={displayTotal}

            perPage={perPage}

            onPageChange={(nextPage) => setAppliedFilters({ ...appliedFilters, page: nextPage })}

          />

        </>

      )}

    </div>

  )

}


