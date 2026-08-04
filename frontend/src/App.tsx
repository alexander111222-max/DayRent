import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from '@/routes'
import { useAuthStore } from '@/store/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppBootstrap() {
  const checkSession = useAuthStore((state) => state.checkSession)
  const reset = useAuthStore((state) => state.reset)

  useEffect(() => {
    checkSession()

    const handleAuthExpired = () => reset()
    window.addEventListener('auth:expired', handleAuthExpired)

    return () => window.removeEventListener('auth:expired', handleAuthExpired)
  }, [checkSession, reset])

  return <RouterProvider router={router} />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppBootstrap />
    </QueryClientProvider>
  )
}
