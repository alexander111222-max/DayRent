// Цвет закреплён за арендатором (rent_id): брони одного человека одного цвета.
// Классы прописаны целиком, чтобы Tailwind их увидел при сборке
export interface BookingColor {
  bar: string
  soft: string
  text: string
  dot: string
  ring: string
}

const PALETTE: BookingColor[] = [
  {
    bar: 'bg-linear-to-r from-violet-500 to-fuchsia-500 shadow-fuchsia-500/30',
    soft: 'bg-violet-50',
    text: 'text-violet-700',
    dot: 'bg-linear-to-br from-violet-500 to-fuchsia-500',
    ring: 'ring-violet-300',
  },
  {
    bar: 'bg-linear-to-r from-sky-500 to-cyan-400 shadow-sky-500/30',
    soft: 'bg-sky-50',
    text: 'text-sky-700',
    dot: 'bg-linear-to-br from-sky-500 to-cyan-400',
    ring: 'ring-sky-300',
  },
  {
    bar: 'bg-linear-to-r from-amber-400 to-orange-500 shadow-orange-500/30',
    soft: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-linear-to-br from-amber-400 to-orange-500',
    ring: 'ring-amber-300',
  },
  {
    bar: 'bg-linear-to-r from-pink-500 to-rose-500 shadow-rose-500/30',
    soft: 'bg-pink-50',
    text: 'text-pink-700',
    dot: 'bg-linear-to-br from-pink-500 to-rose-500',
    ring: 'ring-pink-300',
  },
  {
    bar: 'bg-linear-to-r from-emerald-500 to-teal-400 shadow-emerald-500/30',
    soft: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-linear-to-br from-emerald-500 to-teal-400',
    ring: 'ring-emerald-300',
  },
  {
    bar: 'bg-linear-to-r from-indigo-500 to-blue-500 shadow-indigo-500/30',
    soft: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-linear-to-br from-indigo-500 to-blue-500',
    ring: 'ring-indigo-300',
  },
]

export function getRenterColor(renterId: number): BookingColor {
  return PALETTE[Math.abs(renterId) % PALETTE.length]
}
