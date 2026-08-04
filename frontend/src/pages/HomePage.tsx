import { Link } from 'react-router-dom'
import { Button, Loader } from '@/components/ui'
import { ItemGrid } from '@/components/items/ItemGrid'
import { useSearch } from '@/hooks'
import { ROUTES, HOME_ITEMS_PREVIEW } from '@/utils/constants'

export function HomePage() {
  const { data, isLoading } = useSearch({ page: 1, per_page: HOME_ITEMS_PREVIEW })

  return (
    <div className="page-container">
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-12 text-white sm:px-10 sm:py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-100">
          Маркетплейс посуточной аренды
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold sm:text-5xl">
          Арендуй вещи на день — быстро, удобно, рядом с тобой
        </h1>
        <p className="mt-4 max-w-xl text-brand-50">
          DayRent — платформа для аренды и сдачи вещей. Ищите, бронируйте, добавляйте в избранное и управляйте своими объявлениями.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={ROUTES.search}>
            <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50">
              Смотреть объявления
            </Button>
          </Link>
          <Link to={ROUTES.itemCreate}>
            <Button size="lg" variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              Сдать вещь
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { title: 'Поиск', text: 'Elasticsearch, фильтры, геопоиск рядом с вами' },
          { title: 'Бронирование', text: 'Выбор дат, проверка доступности, статусы брони' },
          { title: 'Профиль', text: 'Ваши вещи, избранное, активные и завершённые аренды' },
        ].map((block) => (
          <div key={block.title} className="card">
            <h2 className="font-semibold text-slate-900">{block.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{block.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Свежие объявления</h2>
          <Link to={ROUTES.search} className="text-sm font-medium text-brand-700 hover:underline">
            Все объявления
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
