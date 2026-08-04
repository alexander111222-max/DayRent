import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Input, ErrorMessage } from '@/components/ui'
import { useAuth } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { getLoginErrorMessage, isEmailNotVerifiedError } from '@/utils/authErrors'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginState = location.state as {
    from?: string
    verified?: boolean
    email?: string
  } | null

  const from = loginState?.from ?? ROUTES.home
  const { login, isLoginPending } = useAuth()
  const [email, setEmail] = useState(loginState?.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(
    loginState?.verified ? 'Email подтверждён. Теперь можно войти.' : null,
  )

  useEffect(() => {
    if (loginState?.verified) {
      setSuccessMessage('Email подтверждён. Теперь можно войти.')
    }
  }, [loginState?.verified])

  const redirectToVerification = (targetEmail: string, targetPassword: string) => {
    const params = new URLSearchParams({ email: targetEmail })

    navigate(`${ROUTES.verifyEmail}?${params.toString()}`, {
      state: { from, password: targetPassword, email: targetEmail },
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      if (isEmailNotVerifiedError(err)) {
        redirectToVerification(email, password)
        return
      }

      setError(getLoginErrorMessage(err))
    }
  }

  return (
    <div className="page-container flex justify-center">
      <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">
        <div>
          <h1 className="page-title">Вход</h1>
          <p className="page-subtitle">Войдите в аккаунт с подтверждённым email</p>
        </div>

        {successMessage && (
          <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
            {successMessage}
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" isLoading={isLoginPending}>
          Войти
        </Button>

        <p className="text-center text-sm text-slate-600">
          Нет аккаунта?{' '}
          <Link to={ROUTES.register} className="font-medium text-brand-700 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  )
}
