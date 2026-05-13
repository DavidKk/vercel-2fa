import { appUi } from './app-tokens'

interface ToolPageSkeletonProps {
  label: string
  title: string
  fields?: number
  showSectionLabel?: boolean
}

export function ToolPageSkeleton(props: ToolPageSkeletonProps) {
  const { label, title, fields = 0, showSectionLabel = true } = props

  return (
    <div className={appUi.pageShell}>
      <div className={`${appUi.card} flex w-full max-w-lg flex-col items-center px-5 py-8 text-center sm:px-8 sm:py-10`}>
        <div className={`${appUi.iconBox} mb-5 animate-pulse`} />
        {showSectionLabel ? <div className="mb-2 h-3 w-24 animate-pulse rounded bg-[var(--nav-link-active-bg)]" aria-hidden /> : null}
        <p className="sr-only">{label}</p>
        <div className="mb-3 h-7 w-56 max-w-full animate-pulse rounded bg-[var(--nav-link-active-bg)]" aria-hidden />
        <h1 className="sr-only">{title}</h1>
        <div className="mb-8 h-4 w-full max-w-sm animate-pulse rounded bg-[var(--nav-link-active-bg)]" aria-hidden />
        {fields > 0 ? (
          <div className="mb-6 flex w-full flex-col gap-4">
            {Array.from({ length: fields }, (_, index) => (
              <div key={index} className="space-y-1.5">
                <div className="h-3 w-24 animate-pulse rounded bg-[var(--nav-link-active-bg)]" aria-hidden />
                <div className="h-11 w-full animate-pulse rounded-lg border border-[var(--app-header-border)] bg-[var(--background)]" aria-hidden />
              </div>
            ))}
          </div>
        ) : null}
        <div className="h-11 w-full animate-pulse rounded-lg bg-[var(--app-primary)]" aria-hidden />
      </div>
    </div>
  )
}
