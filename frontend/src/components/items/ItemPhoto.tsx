import { useState } from 'react'

interface ItemPhotoProps {
  url?: string | null
  alt: string
  className?: string
  placeholderClassName?: string
  placeholderIconClassName?: string
  onError?: () => void
}

export function ItemPhoto({
  url,
  alt,
  className,
  placeholderClassName,
  placeholderIconClassName,
  onError,
}: ItemPhotoProps) {
  const [failed, setFailed] = useState(false)
  const showPlaceholder = !url || failed

  if (showPlaceholder) {
    return (
      <div
        className={
          placeholderClassName ??
          'flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700'
        }
      >
        <span className={placeholderIconClassName ?? 'text-4xl'}>📦</span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      onError={() => {
        setFailed(true)
        onError?.()
      }}
      className={className ?? 'h-full w-full object-cover'}
    />
  )
}
