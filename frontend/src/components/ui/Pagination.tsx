interface PaginationProps {
  page: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, total, perPage, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
      >
        Назад
      </button>
      <span className="text-sm text-slate-600">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
      >
        Вперёд
      </button>
    </div>
  )
}
