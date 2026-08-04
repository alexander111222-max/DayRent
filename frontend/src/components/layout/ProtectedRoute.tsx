import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/utils/constants'

export function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isLoading, sessionChecked } = useAuthStore()

  if (!sessionChecked || isLoading) {
    return <Loader fullScreen label="Проверяем авторизацию..." />
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
