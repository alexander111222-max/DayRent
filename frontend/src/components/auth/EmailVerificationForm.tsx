import { useCallback, useEffect, useRef, useState } from 'react'
import { VerificationCodeInput } from '@/components/auth/VerificationCodeInput'
import { Button, ErrorMessage } from '@/components/ui'
import { useEmailVerification } from '@/hooks'
import {
  RESEND_COOLDOWN_SECONDS,
  VERIFY_CODE_LENGTH,
  VERIFY_CODE_TTL_SECONDS,
} from '@/utils/constants'
import { getErrorMessage } from '@/utils/format'

function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${rest.toString().padStart(2, '0')}`
}

interface EmailVerificationFormProps {
  email: string
  onSuccess: () => void
  autoSend?: boolean
}

export function EmailVerificationForm({
  email,
  onSuccess,
  autoSend = true,
}: EmailVerificationFormProps) {
  const { resendCode, verifyEmail, isResending, isVerifying } = useEmailVerification()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [codeSent, setCodeSent] = useState(false)
  const [expiresIn, setExpiresIn] = useState(VERIFY_CODE_TTL_SECONDS)
  const [resendIn, setResendIn] = useState(0)

  const canSubmit = code.length === VERIFY_CODE_LENGTH

  useEffect(() => {
    if (!codeSent) return

    const timer = window.setInterval(() => {
      setExpiresIn((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [codeSent])

  useEffect(() => {
    if (resendIn <= 0) return

    const timer = window.setInterval(() => {
      setResendIn((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendIn])

  const handleSendCode = useCallback(async () => {
    setError(null)

    try {
      await resendCode(email)
      setCodeSent(true)
      setCode('')
      setExpiresIn(VERIFY_CODE_TTL_SECONDS)
      setResendIn(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось отправить код'))
    }
  }, [email, resendCode])

  // Каждый вызов /resend_code генерирует новый код и перезаписывает старый в Redis,
  // поэтому авто-отправка должна сработать ровно один раз (StrictMode вызывает эффекты дважды)
  const autoSentRef = useRef(false)

  useEffect(() => {
    if (!autoSend || autoSentRef.current) return
    autoSentRef.current = true
    void handleSendCode()
  }, [autoSend, handleSendCode])

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    setError(null)

    try {
      await verifyEmail({ email, code: Number(code) })
      onSuccess()
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось подтвердить email'))
    }
  }

  return (
    <form onSubmit={handleVerify} className="space-y-5">
      <p className="text-center text-sm text-slate-600">
        Код отправлен на <span className="font-medium text-slate-900">{email}</span>
      </p>

      {error && <ErrorMessage message={error} />}

      <div className="space-y-3">
        <p className="text-center text-sm font-medium text-slate-700">Введите 6-значный код</p>
        <VerificationCodeInput value={code} onChange={setCode} disabled={isVerifying} />
      </div>

      <div className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
        {codeSent ? (
          expiresIn > 0 ? (
            <span>Код действует ещё {formatTimer(expiresIn)}</span>
          ) : (
            <span className="text-amber-700">Срок действия кода истёк — запросите новый</span>
          )
        ) : (
          <span>Отправляем код...</span>
        )}
      </div>

      <Button type="submit" className="w-full" isLoading={isVerifying} disabled={!canSubmit}>
        Подтвердить
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={handleSendCode}
          disabled={isResending || resendIn > 0}
          isLoading={isResending}
        >
          {resendIn > 0 ? `Отправить снова через ${resendIn}с` : 'Отправить код повторно'}
        </Button>
      </div>
    </form>
  )
}
