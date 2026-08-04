import { APP_NAME } from '@/utils/constants'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="page-container flex flex-col gap-2 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {APP_NAME}. Аренда вещей на каждый день.</p>
        <p>Backend API + React frontend</p>
      </div>
    </footer>
  )
}
