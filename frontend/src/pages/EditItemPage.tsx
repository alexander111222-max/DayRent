import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Card, ErrorMessage, Loader } from '@/components/ui'
import {
  ItemForm,
  toItemEditPayload,
  type ItemFormValues,
} from '@/components/items/ItemForm'
import { useCategories, useItem, useItems, useProfile } from '@/hooks'
import type { PendingPhotosState } from '@/hooks/useItem'
import { ROUTES } from '@/utils/constants'
import { getErrorMessage } from '@/utils/format'
import { parsePositiveIntId, validateItemPrice } from '@/utils/validation'

export function EditItemPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const itemId = parsePositiveIntId(id)
  const { profile, isLoading: profileLoading } = useProfile()
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { updateItem, deleteItem, uploadPhotos, isUpdating, isDeleting, isUploadingPhotos } = useItems()
  // Нужен текущий счётчик фото, чтобы после загрузки знать, сколько их ждать на странице вещи
  const { data: itemWithPhotos } = useItem(itemId ?? 0)
  const [values, setValues] = useState<ItemFormValues | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const item = itemId ? profile?.items.find((entry) => entry.id === itemId) : undefined

  useEffect(() => {
    if (item) {
      setValues({
        title: item.title,
        price: item.price,
        description: item.description,
        city: item.city,
        address: item.address,
        category_id: item.category_id,
      })
    }
  }, [item])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!values) return

    setError(null)

    const priceError = validateItemPrice(values.price)
    if (priceError) {
      setError(priceError)
      return
    }

    if (!itemId) return

    try {
      await updateItem({ itemId, data: toItemEditPayload(values) })

      if (photos.length > 0) {
        const currentPhotosCount = itemWithPhotos?.photos_urls?.length ?? 0
        await uploadPhotos({ itemId, files: photos })
        const state: PendingPhotosState = {
          pendingPhotos: { expected: currentPhotosCount + photos.length, startedAt: Date.now() },
        }
        navigate(ROUTES.item(itemId), { state })
        return
      }

      navigate(ROUTES.item(itemId))
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось сохранить изменения'))
    }
  }

  const handleDelete = async () => {
    if (!itemId || !window.confirm('Удалить объявление?')) return

    try {
      await deleteItem(itemId)
      navigate(ROUTES.myItems)
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось удалить объявление'))
    }
  }

  if (profileLoading || categoriesLoading) {
    return <Loader fullScreen label="Загружаем объявление..." />
  }

  if (!itemId || !item || !values) {
    return (
      <div className="page-container">
        <Card>
          <h1 className="page-title">Объявление не найдено</h1>
          <p className="page-subtitle">
            Некорректный id или объявление удалено. Можно редактировать только существующие свои вещи.
          </p>
          <Link to={ROUTES.myItems} className="mt-4 inline-block">
            <Button variant="secondary">К моим вещам</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container">
      <Card className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="page-title">Редактировать вещь</h1>
          <p className="page-subtitle">{item.title}</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <ItemForm
            values={values}
            categories={categories}
            onChange={setValues}
            idPrefix="edit-item"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="edit-photos">
              Добавить фото
            </label>
            <input
              id="edit-photos"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={isUpdating || isUploadingPhotos}>
              Сохранить
            </Button>
            <Link to={ROUTES.item(itemId)}>
              <Button type="button" variant="secondary">
                Отмена
              </Button>
            </Link>
            <Button type="button" variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Удалить
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
