import { Link } from 'react-router-dom'
import { Button, Loader } from '@/components/ui'
import { ItemGrid } from '@/components/items/ItemGrid'
import { useSearch } from '@/hooks'
import { ROUTES, HOME_ITEMS_PREVIEW } from '@/utils/constants'

export function HomePage() {
  const { data, isLoading } = useSearch({ page: 1, per_page: HOME_ITEMS_PREVIEW })

  return (
    <div className="page-container">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-violet-600 via-fuchsia-500 to-orange-400 px-6 py-12 text-white shadow-2xl shadow-fuchsia-500/30 sm:px-10 sm:py-16">
        {/* Декоративные пятна */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-amber-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-10 hidden rotate-12 text-8xl opacity-90 drop-shadow-xl lg:block">
          🎒
        </div>
        <div className="pointer-events-none absolute bottom-8 right-40 hidden -rotate-12 text-6xl opacity-90 drop-shadow-xl lg:block">
          🚲
        </div>

        <div className="relative">
          <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
            ✨ Маркетплейс посуточной аренды
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight drop-shadow-sm sm:text-5xl">
            Арендуй вещи на день — быстро, удобно, рядом с тобой
          </h1>
          <p className="mt-4 max-w-xl text-white/90">
            DayRent — платформа для аренды и сдачи вещей. Ищите, бронируйте, добавляйте в корзину и управляйте своими объявлениями.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={ROUTES.search}>
              <Button size="lg" variant="secondary" className="border-transparent text-violet-700 shadow-lg hover:bg-white hover:text-fuchsia-600">
                Смотреть объявления
              </Button>
            </Link>
            <Link to={ROUTES.itemCreate}>
              <Button size="lg" variant="secondary" className="border-white/40 bg-white/10 text-white hover:border-white hover:bg-white/25 hover:text-white">
                Сдать вещь
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: '🔎',
            title: 'Поиск',
            text: 'Elasticsearch, фильтры, геопоиск рядом с вами',
            color: 'from-sky-500 to-cyan-400 shadow-sky-500/30',
            tint: 'from-sky-50',
          },
          {
            icon: '📅',
            title: 'Бронирование',
            text: 'Выбор дат, проверка доступности, статусы брони',
            color: 'from-violet-500 to-fuchsia-500 shadow-fuchsia-500/30',
            tint: 'from-fuchsia-50',
          },
          {
            icon: '🎁',
            title: 'Профиль',
            text: 'Ваши вещи, корзина, активные и завершённые аренды',
            color: 'from-amber-400 to-orange-500 shadow-orange-500/30',
            tint: 'from-amber-50',
          },
        ].map((block) => (
          <div
            key={block.title}
            className={`card bg-linear-to-br ${block.tint} to-white transition hover:-translate-y-1 hover:shadow-xl`}
          >
            <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br text-2xl shadow-lg ${block.color}`}>
              {block.icon}
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">{block.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{block.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-slate-900">
            Свежие объявления <span className="inline-block animate-bounce">🔥</span>
          </h2>
          <Link to={ROUTES.search} className="rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700 transition hover:bg-violet-100">
            Все объявления →
          </Link>
        </div>

        {isLoading ? (
          <Loader label="Загружаем объявления..." />
        ) : (
          <ItemGrid
            items={data?.items ?? []}
            emptyTitle="Пока нет объявлений"
            emptyDescription="Создайте первое объявление или проверьте, что бэкенд и Elasticsearch запущены"
          />
        )}
      </section>
    </div>
  )
}
