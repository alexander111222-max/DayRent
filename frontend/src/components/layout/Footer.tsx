import { APP_NAME } from '@/utils/constants'

export function Footer() {
  return (
    <footer className="mt-auto bg-linear-to-r from-violet-950 via-fuchsia-950 to-slate-900 text-white">
      <div className="page-container flex flex-col gap-2 py-6 text-sm text-violet-200 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {APP_NAME}. Аренда вещей на каждый день.</p>
        <p>Сделано с 💜 для тех, кто делится вещами</p>
      </div>
    </footer>
  )
}
