import { useCallback, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { EmailVerificationForm } from '@/components/auth/EmailVerificationForm'
import { Button, Card, ErrorMessage } from '@/components/ui'
import { useAuth } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { getErrorMessage } from '@/utils/format'

interface VerifyEmailLocationState {
  from?: string
  password?: string
  email?: string
}

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as VerifyEmailLocationState | null
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  const email = searchParams.get('email')?.trim() || locationState?.email || ''
  const redirectTo = locationState?.from ?? ROUTES.home
  const savedPassword = locationState?.password

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subtitle = useMemo(() => {
    if (!email) return 'Подтвердите email, чтобы войти в DayRent'
    return `Подтверждение аккаунта ${email}`
  }, [email])

  const finishVerification = useCallback(async () => {
    if (savedPassword) {
      try {
        await login({ email, password: savedPassword })
        navigate(redirectTo, { replace: true })
        return
      } catch (err) {
        setError(getErrorMessage(err, 'Email подтверждён, но войти не удалось'))
        navigate(ROUTES.login, {
          replace: true,
          state: { email, verified: true, from: redirectTo },
        })
        return
      }
    }

    navigate(ROUTES.login, {
      replace: true,
      state: { email, verified: true, from: redirectTo },
    })
  }, [email, login, navigate, redirectTo, savedPassword])

  const handleSuccess = useCallback(() => {
    setSuccess(true)
    setError(null)

    window.setTimeout(() => {
      void finishVerification()
    }, 1200)
  }, [finishVerification])

  if (!email) {
    return (
      <div className="page-container flex justify-center">
        <Card className="w-full max-w-lg space-y-4 text-center">
          <h1 className="page-title">Подтверждение email</h1>
          <p className="page-subtitle">Email не указан. Войдите или зарегистрируйтесь заново.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to={ROUTES.register}>
              <Button>Регистрация</Button>
            </Link>
            <Link to={ROUTES.login}>
              <Button variant="secondary">Вход</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container flex justify-center">
      <Card className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-2xl">
            ✉️
          </div>
          <h1 className="page-title">Подтвердите email</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>

        {error && <ErrorMessage message={error} />}

        {success ? (
          <div className="rounded-xl bg-brand-50 px-4 py-6 text-center">
            <p className="text-lg font-semibold text-brand-800">Email подтверждён</p>
            <p className="mt-2 text-sm text-brand-700">
              {savedPassword
                ? 'Входим и возвращаем вас обратно...'
                : 'Перенаправляем на страницу входа...'}
            </p>
          </div>
        ) : (
          <EmailVerificationForm email={email} onSuccess={handleSuccess} />
        )}

        <p className="text-center text-sm text-slate-600">
          Уже подтвердили?{' '}
          <Link to={ROUTES.login} className="font-medium text-brand-700 hover:underline">
            Войти
          </Link>
        </p>
      </Card>
    </div>
  )
}
