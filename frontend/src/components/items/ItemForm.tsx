import { Input, Select, Textarea } from '@/components/ui'
import type { Category, ItemCreateRequest, ItemEditRequest } from '@/types'

export interface ItemFormValues {
  title: string
  price: number
  description: string
  city: string
  address: string
  category_id: number
}

interface ItemFormProps {
  values: ItemFormValues
  categories: Category[]
  onChange: (values: ItemFormValues) => void
  idPrefix?: string
}

export function ItemForm({ values, categories, onChange, idPrefix = 'item' }: ItemFormProps) {
  const updateField = <K extends keyof ItemFormValues>(field: K, value: ItemFormValues[K]) => {
    onChange({ ...values, [field]: value })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        label="Название"
        value={values.title}
        onChange={(e) => updateField('title', e.target.value)}
        required
      />
      <Input
        label="Цена за день (₽)"
        type="number"
        min={1}
        value={values.price}
        onChange={(e) => updateField('price', Number(e.target.value))}
        required
      />
      <Select
        label="Категория"
        placeholder="Выберите категорию"
        value={values.category_id || ''}
        onChange={(e) => updateField('category_id', Number(e.target.value))}
        options={categories.map((category) => ({ value: category.id, label: category.title }))}
        required
      />
      <Input
        label="Город"
        value={values.city}
        onChange={(e) => updateField('city', e.target.value)}
        required
      />
      <div className="sm:col-span-2">
        <Input
          label="Адрес"
          value={values.address}
          onChange={(e) => updateField('address', e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Textarea
          id={`${idPrefix}-description`}
          label="Описание"
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          required
        />
      </div>
    </div>
  )
}

export function toItemCreatePayload(values: ItemFormValues): ItemCreateRequest {
  return {
    title: values.title.trim(),
    price: values.price,
    description: values.description.trim(),
    city: values.city.trim(),
    address: values.address.trim(),
    category_id: values.category_id,
  }
}

export function toItemEditPayload(values: ItemFormValues): ItemEditRequest {
  return toItemCreatePayload(values)
}

export const emptyItemFormValues = (): ItemFormValues => ({
  title: '',
  price: 500,
  description: '',
  city: '',
  address: '',
  category_id: 0,
})
