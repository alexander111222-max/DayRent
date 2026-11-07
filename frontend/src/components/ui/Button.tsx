import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-linear-to-r from-brand-500 to-teal-500 text-white shadow-md shadow-teal-500/25 hover:brightness-110 hover:shadow-lg focus-visible:ring-brand-500',
  accent:
    'bg-linear-to-r from-violet-600 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/25 hover:brightness-110 hover:shadow-lg focus-visible:ring-fuchsia-500',
  secondary:
    'border border-violet-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700',
  ghost: 'text-slate-600 hover:bg-violet-50 hover:text-violet-700',
  danger:
    'bg-linear-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25 hover:brightness-110 focus-visible:ring-red-500',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Загрузка...' : children}
    </button>
  )
}
