interface LoaderProps {
  label?: string
  fullScreen?: boolean
}

export function Loader({ label = 'Загрузка...', fullScreen = false }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center gap-3 text-slate-600">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-violet-100 border-t-fuchsia-500 border-r-violet-500" />
      <span className="text-sm">{label}</span>
    </div>
  )

  if (fullScreen) {
    return <div className="flex min-h-[40vh] items-center justify-center">{content}</div>
  }

  return <div className="flex justify-center py-8">{content}</div>
}
