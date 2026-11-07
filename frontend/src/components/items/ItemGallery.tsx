import { useState } from 'react'
import { ItemPhoto } from '@/components/items/ItemPhoto'
import type { ItemPhotoWithUrl } from '@/types'

interface ItemGalleryProps {
  photos: ItemPhotoWithUrl[]
  alt: string
}

// Главное фото первым, дальше по position, при равенстве — по порядку загрузки
function sortPhotos(photos: ItemPhotoWithUrl[]) {
  return [...photos].sort(
    (a, b) => Number(b.is_main) - Number(a.is_main) || a.position - b.position || a.id - b.id,
  )
}

export function ItemGallery({ photos, alt }: ItemGalleryProps) {
  // Фото, которые не загрузились (нет файла в S3, истекла ссылка), из галереи убираем
  const [failedIds, setFailedIds] = useState<Set<number>>(() => new Set())
  const [activeIndex, setActiveIndex] = useState(0)

  const visible = sortPhotos(photos).filter((photo) => photo.url && !failedIds.has(photo.id))
  const safeIndex = visible.length > 0 ? Math.min(activeIndex, visible.length - 1) : 0
  const current = visible[safeIndex]
  const hasMany = visible.length > 1

  const markFailed = (photoId: number) => {
    setFailedIds((prev) => (prev.has(photoId) ? prev : new Set(prev).add(photoId)))
  }

  const showPrev = () => setActiveIndex((safeIndex - 1 + visible.length) % visible.length)
  const showNext = () => setActiveIndex((safeIndex + 1) % visible.length)

  return (
    <div className="mb-6 space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
        <ItemPhoto
          key={current?.id ?? 'empty'}
          url={current?.url}
          alt={alt}
          onError={current ? () => markFailed(current.id) : undefined}
          className="h-full w-full object-contain"
          placeholderClassName="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700"
          placeholderIconClassName="text-6xl"
        />

        {hasMany && (
          <>
            <button
              type="button"
              onClick={showPrev}
              aria-label="Предыдущее фото"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-xl text-slate-800 shadow transition hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Следующее фото"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-xl text-slate-800 shadow transition hover:bg-white"
            >
              ›
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
              {safeIndex + 1} / {visible.length}
            </span>
          </>
        )}
      </div>

      {hasMany && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {visible.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Фото ${index + 1}`}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-20 sm:w-24 ${
                index === safeIndex ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <ItemPhoto
                url={photo.url}
                alt={`${alt} — фото ${index + 1}`}
                onError={() => markFailed(photo.id)}
                placeholderIconClassName="text-xl"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
