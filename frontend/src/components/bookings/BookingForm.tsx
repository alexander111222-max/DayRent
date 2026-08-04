import { useMemo, useState } from 'react'
import { Button, ErrorMessage, Input } from '@/components/ui'
import { formatPrice, getErrorMessage, pluralizeDays } from '@/utils/format'
import type { Item } from '@/types'

interface BookingFormProps {
  item: Item
  onSubmit: (payload: { date_from: string; date_to: string; price: number; item_id: number; owner_id: number }) => Promise<void>
  isSubmitting?: boolean
}

export function BookingForm({ item, onSubmit, isSubmitting }: BookingFormProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [error, setError] = useState<string | null>(null)

  const days = useMemo(() => {
    const from = new Date(dateFrom)
    const to = new Date(dateTo)
    const diff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }, [dateFrom, dateTo])

  const total = days * item.price

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (dateFrom > dateTo) {
      setError('Дата начала не может быть позже даты окончания')
      return
    }

    try {
      await onSubmit({
        date_from: dateFrom,
        date_to: dateTo,
        price: item.price,
        item_id: item.id,
        owner_id: item.user_id,
      })
      setDateFrom(today)
      setDateTo(today)
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось создать бронь'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage message={error} />}

      <Input
        label="Дата начала"
        type="date"
        min={today}
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        required
      />
      <Input
        label="Дата окончания"
        type="date"
        min={dateFrom}
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        required
      />

      <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
        <p>{formatPrice(item.price)}/день</p>
        <p className="mt-1">
          {days > 0 ? `${pluralizeDays(days)} · ${formatPrice(total)}` : 'Выберите корректные даты'}
        </p>
      </div>

      <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={days <= 0}>
        Забронировать
      </Button>
    </form>
  )
}
