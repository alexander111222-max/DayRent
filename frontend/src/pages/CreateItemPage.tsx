import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, ErrorMessage, Loader } from '@/components/ui'
import {
  emptyItemFormValues,
  ItemForm,
  toItemCreatePayload,
  type ItemFormValues,
} from '@/components/items/ItemForm'
import { useCategories, useItems } from '@/hooks'
import type { PendingPhotosState } from '@/hooks/useItem'
import { ROUTES } from '@/utils/constants'
import { getErrorMessage } from '@/utils/format'
import { validateItemPrice } from '@/utils/validation'

export function CreateItemPage() {
  const navigate = useNavigate()
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { createItem, uploadPhotos, isCreating, isUploadingPhotos } = useItems()
  const [values, setValues] = useState<ItemFormValues>(() => ({
    ...emptyItemFormValues(),
    category_id: 0,
  }))
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!values.category_id) {
      setError('Выберите категорию')
      return
    }

    const priceError = validateItemPrice(values.price)
    if (priceError) {
      setError(priceError)
      return
    }

    try {
      const response = await createItem(toItemCreatePayload(values))
      const itemId = response.added_item.id

      if (photos.length > 0) {
        await uploadPhotos({ itemId, files: photos })
        const state: PendingPhotosState = {
          pendingPhotos: { expected: photos.length, startedAt: Date.now() },
        }
        navigate(ROUTES.item(itemId), { state })
        return
      }

      navigate(ROUTES.item(itemId))
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось создать объявление'))
    }
  }

  if (categoriesLoading) {
    return <Loader fullScreen label="Загружаем категории..." />
  }

  return (
    <div className="page-container">
      <Card className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="page-title">Добавить вещь</h1>
          <p className="page-subtitle">Создайте объявление и при желании сразу загрузите фото</p>
        </div>

        {categories.length === 0 && (
          <ErrorMessage message="Сначала создайте категории в админке бэкенда (/admin)." />
        )}

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <ItemForm
            values={values}
            categories={categories}
            onChange={setValues}
            idPrefix="create-item"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="photos">
              Фото (необязательно)
            </label>
            <input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700"
            />
            {photos.length > 0 && (
              <p className="text-sm text-slate-500">Выбрано файлов: {photos.length}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={isCreating || isUploadingPhotos}>
              Опубликовать
            </Button>
            <Link to={ROUTES.myItems}>
              <Button type="button" variant="secondary">
                Отмена
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
