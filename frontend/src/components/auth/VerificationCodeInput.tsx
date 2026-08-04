import { useRef } from 'react'
import { VERIFY_CODE_LENGTH } from '@/utils/constants'

interface VerificationCodeInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function VerificationCodeInput({ value, onChange, disabled }: VerificationCodeInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const digits = Array.from({ length: VERIFY_CODE_LENGTH }, (_, index) => value[index] ?? '')

  const updateValue = (nextDigits: string[]) => {
    onChange(nextDigits.join('').slice(0, VERIFY_CODE_LENGTH))
  }

  const handleChange = (index: number, nextChar: string) => {
    const sanitized = nextChar.replace(/\D/g, '').slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = sanitized
    updateValue(nextDigits)

    if (sanitized && index < VERIFY_CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, VERIFY_CODE_LENGTH)
    if (!pasted) return

    onChange(pasted)

    const focusIndex = Math.min(pasted.length, VERIFY_CODE_LENGTH - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="h-12 w-10 rounded-xl border border-slate-300 bg-white text-center text-lg font-semibold text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:w-12 sm:text-xl"
        />
      ))}
    </div>
  )
}
