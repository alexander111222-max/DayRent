import { Link, NavLink } from 'react-router-dom'
import { useAuth, useBasket, useOwnerBookings } from '@/hooks'
import { APP_NAME, ROUTES } from '@/utils/constants'
import { Button } from '@/components/ui'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
    isActive
      ? 'bg-linear-to-r from-violet-600 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/25'
      : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
  }`

export function Header() {
  const { isAuthenticated, isLoading, user, logout, isLogoutPending } = useAuth()
  const { basket } = useBasket()
  const { ownerPendingBookings } = useOwnerBookings()

  return (
    <header className="sticky top-0 z-50 bg-white/80 shadow-sm backdrop-blur-md">
      <div className="h-1 bg-linear-to-r from-violet-600 via-fuchsia-500 to-orange-400" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to={ROUTES.home} className="flex items-center gap-2 text-xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-violet-600 via-fuchsia-500 to-orange-400 text-base text-white shadow-md shadow-fuchsia-500/30">
            D
          </span>
          <span className="bg-linear-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to={ROUTES.search} className={navLinkClass}>
            Поиск
          </NavLink>
          {!isLoading && isAuthenticated && (
            <>
              <NavLink to={ROUTES.myItems} className={navLinkClass}>
                Мои вещи
              </NavLink>
              <NavLink to={ROUTES.basket} className={navLinkClass}>
                Корзина{basket.length > 0 && ` (${basket.length})`}
              </NavLink>
              <NavLink to={ROUTES.bookings} className={navLinkClass}>
                Брони{ownerPendingBookings.length > 0 && ` (${ownerPendingBookings.length})`}
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
              <span className="hidden items-center gap-2 text-sm font-medium text-slate-700 sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
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
                <Button variant="accent" size="sm">
                  Регистрация
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
