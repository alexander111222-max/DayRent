import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, ErrorMessage } from '@/components/ui'
import { useAuth } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { getErrorMessage } from '@/utils/format'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isRegisterPending } = useAuth()
  const [form, setForm] = useState({
    username: '',
    surname: '',
    age: 18,
    phone: '',
    email: '',
    city: '',
    address: '',
    password: '',
    password_confirm: '',
  })
  const [error, setError] = useState<string | null>(null)

  const updateField = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    try {
      const response = await register(form)
      const { email } = response.added_user

      navigate(`${ROUTES.verifyEmail}?email=${encodeURIComponent(email)}`, {
        replace: true,
        state: {
          from: ROUTES.home,
          password: form.password,
          email,
        },
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось зарегистрироваться'))
    }
  }

  return (
    <div className="page-container flex justify-center">
      <form onSubmit={handleSubmit} className="card w-full max-w-2xl space-y-4">
        <div>
          <h1 className="page-title">Регистрация</h1>
          <p className="page-subtitle">
            Создайте аккаунт — после регистрации отправим код подтверждения на email
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Имя" value={form.username} onChange={(e) => updateField('username', e.target.value)} required />
          <Input label="Фамилия" value={form.surname} onChange={(e) => updateField('surname', e.target.value)} required />
          <Input label="Возраст" type="number" min={18} value={form.age} onChange={(e) => updateField('age', Number(e.target.value))} required />
          <Input label="Телефон" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
          <Input label="Город" value={form.city} onChange={(e) => updateField('city', e.target.value)} required />
        </div>

        <Input label="Адрес" value={form.address} onChange={(e) => updateField('address', e.target.value)} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Пароль" type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
          <Input label="Подтверждение пароля" type="password" value={form.password_confirm} onChange={(e) => updateField('password_confirm', e.target.value)} required />
        </div>

        <Button type="submit" className="w-full" isLoading={isRegisterPending}>
          Зарегистрироваться
        </Button>

        <p className="text-center text-sm text-slate-600">
          Уже есть аккаунт?{' '}
          <Link to={ROUTES.login} className="font-medium text-brand-700 hover:underline">
            Войти
          </Link>
        </p>
      </form>
    </div>
  )
}
