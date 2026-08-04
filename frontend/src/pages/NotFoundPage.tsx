import { Link } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { ROUTES } from '@/utils/constants'

export function NotFoundPage() {
  return (
    <div className="page-container flex justify-center">
      <Card className="max-w-lg text-center">
        <p className="text-5xl">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Страница не найдена</h1>
        <p className="mt-2 text-slate-600">Такого маршрута в DayRent пока нет.</p>
        <Link to={ROUTES.home} className="mt-6 inline-block">
          <Button>На главную</Button>
        </Link>
      </Card>
    </div>
  )
}
