import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { itemsApi } from '@/api'

const PHOTOS_POLL_INTERVAL_MS = 2000
const PHOTOS_POLL_TIMEOUT_MS = 60_000

// Состояние навигации после загрузки фото: фото обрабатываются в Celery асинхронно,
// поэтому страница вещи ждёт, пока их станет expectedPhotos
export interface PendingPhotosState {
  pendingPhotos?: {
    expected: number
    startedAt: number
  }
}

export function useItem(itemId: number, pendingPhotos?: PendingPhotosState['pendingPhotos']) {
  const queryClient = useQueryClient()

  const isWaiting = (photosCount: number | undefined) =>
    Boolean(pendingPhotos) &&
    (photosCount ?? 0) < pendingPhotos!.expected &&
    Date.now() - pendingPhotos!.startedAt < PHOTOS_POLL_TIMEOUT_MS

  const query = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => itemsApi.get(itemId),
    enabled: itemId > 0,
    refetchInterval: (q) =>
      isWaiting(q.state.data?.photos_urls?.length) ? PHOTOS_POLL_INTERVAL_MS : false,
  })

  const photosCount = query.data?.photos_urls?.length
  const isPhotosProcessing = query.isSuccess && isWaiting(photosCount)

  // Когда фото доехали — обновляем списки, где показывается главное фото
  const wasProcessing = useRef(false)
  useEffect(() => {
    if (isPhotosProcessing) {
      wasProcessing.current = true
    } else if (wasProcessing.current) {
      wasProcessing.current = false
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['search'] })
    }
  }, [isPhotosProcessing, queryClient])

  return { ...query, isPhotosProcessing }
}
