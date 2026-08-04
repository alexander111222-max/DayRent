import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { APP_NAME, ROUTES } from '@/utils/constants'
import { Button } from '@/components/ui'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition ${isActive ? 'text-brand-700' : 'text-slate-600 hover:text-slate-900'}`

export function Header() {
  const { isAuthenticated, isLoading, user, logout, isLogoutPending } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to={ROUTES.home} className="text-xl font-bold text-brand-700">
          {APP_NAME}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to={ROUTES.search} className={navLinkClass}>
            Поиск
          </NavLink>
          {!isLoading && isAuthenticated && (
            <>
              <NavLink to={ROUTES.myItems} className={navLinkClass}>
                Мои вещи
              </NavLink>
              <NavLink to={ROUTES.basket} className={navLinkClass}>
                Избранное
              </NavLink>
              <NavLink to={ROUTES.bookings} className={navLinkClass}>
                Брони
              </NavLink>
              <NavLink to={ROUTES.profile} className={navLinkClass}>
                Профиль
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="text-sm text-slate-400">...</span>
          ) : isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">
                {user?.username}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => logout()}
                isLoading={isLogoutPending}
              >
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link to={ROUTES.login}>
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link to={ROUTES.register}>
                <Button size="sm">Регистрация</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
