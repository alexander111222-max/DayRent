import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, ErrorMessage, Input, Loader } from '@/components/ui'
import { useProfile } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { getErrorMessage } from '@/utils/format'
import type { UserPatchRequest } from '@/types'

export function ProfilePage() {
  const { profile, isLoading, isError, error, updateProfile, isUpdating } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<UserPatchRequest>({})
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.user) {
      const { user } = profile
      setForm({
        username: user.username,
        surname: user.surname,
        age: user.age,
        phone: user.phone,
        email: user.email,
        city: user.city,
        address: user.address,
      })
    }
  }, [profile])

  if (isLoading) {
    return <Loader fullScreen label="Загружаем профиль..." />
  }

  if (isError || !profile) {
    return (
      <div className="page-container">
        <ErrorMessage message={getErrorMessage(error, 'Не удалось загрузить профиль')} />
      </div>
    )
  }

  const { user, items } = profile

  const updateField = (field: keyof UserPatchRequest, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaveError(null)

    try {
      await updateProfile(form)
      setIsEditing(false)
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Не удалось сохранить профиль'))
    }
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Профиль</h1>
          <p className="page-subtitle">Данные аккаунта и быстрый доступ к вашим объявлениям</p>
        </div>
        {!isEditing && (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Редактировать
          </Button>
        )}
      </div>

      {saveError && <ErrorMessage message={saveError} />}

      <Card>
        {isEditing ? (
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <Input label="Имя" value={form.username ?? ''} onChange={(e) => updateField('username', e.target.value)} />
            <Input label="Фамилия" value={form.surname ?? ''} onChange={(e) => updateField('surname', e.target.value)} />
            <Input label="Возраст" type="number" min={18} value={form.age ?? ''} onChange={(e) => updateField('age', Number(e.target.value))} />
            <Input label="Телефон" value={form.phone ?? ''} onChange={(e) => updateField('phone', e.target.value)} />
            <Input label="Email" type="email" value={form.email ?? ''} onChange={(e) => updateField('email', e.target.value)} />
            <Input label="Город" value={form.city ?? ''} onChange={(e) => updateField('city', e.target.value)} />
            <div className="sm:col-span-2">
              <Input label="Адрес" value={form.address ?? ''} onChange={(e) => updateField('address', e.target.value)} />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" isLoading={isUpdating}>Сохранить</Button>
              <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                Отмена
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Имя</p>
              <p className="font-medium">{user.username} {user.surname}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Город</p>
              <p className="font-medium">{user.city}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Адрес</p>
              <p className="font-medium">{user.address}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Телефон</p>
              <p className="font-medium">{user.phone}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Координаты</p>
              <p className="font-medium">{user.lat ?? '—'}, {user.lon ?? '—'}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">Мои объявления ({items.length})</h2>
          <p className="mt-1 text-sm text-slate-600">Управление вещами и создание новых объявлений</p>
        </div>
        <Link to={ROUTES.myItems}>
          <Button variant="secondary">Открыть список</Button>
        </Link>
      </Card>
    </div>
  )
}
