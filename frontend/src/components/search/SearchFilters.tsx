import type { SearchParams } from '@/types'
import { Input, Select, Button } from '@/components/ui'
import type { Category } from '@/types'

interface SearchFiltersProps {
  filters: SearchParams
  categories: Category[]
  onChange: (filters: SearchParams) => void
  onSubmit: () => void
  isLoading?: boolean
}

export function SearchFilters({
  filters,
  categories,
  onChange,
  onSubmit,
  isLoading,
}: SearchFiltersProps) {
  return (
    <form
      className="card grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <Input
        label="Поиск"
        type="text"
        inputMode="search"
        placeholder="Название или описание"
        value={filters.query ?? ''}
        onChange={(e) => onChange({ ...filters, query: e.target.value || undefined })}
      />
      <Input
        label="Город"
        placeholder="Москва"
        value={filters.city ?? ''}
        onChange={(e) => onChange({ ...filters, city: e.target.value || undefined })}
      />
      <Select
        label="Категория"
        placeholder="Все категории"
        value={filters.category_id ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            category_id: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        options={categories.map((c) => ({ value: c.id, label: c.title }))}
      />
      <Input
        label="Цена от"
        type="number"
        min={1}
        value={filters.price_from ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            price_from: e.target.value ? Number(e.target.value) : undefined,
          })
        }
      />
      <Input
        label="Цена до"
        type="number"
        min={1}
        value={filters.price_to ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            price_to: e.target.value ? Number(e.target.value) : undefined,
          })
        }
      />
      <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={Boolean(filters.nearby)}
          onChange={(e) => onChange({ ...filters, nearby: e.target.checked || undefined })}
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        Рядом со мной
      </label>
      <div className="md:col-span-2 lg:col-span-3">
        <Button type="submit" isLoading={isLoading}>
          Найти
        </Button>
      </div>
    </form>
  )
}
