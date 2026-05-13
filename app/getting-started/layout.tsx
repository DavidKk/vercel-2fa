import type { ReactNode } from 'react'

/**
 * Shared page chrome for all Getting Started guide routes.
 * @param children Tab-specific page content from `page.tsx` or `[tab]/page.tsx`
 * @returns Full-width layout wrapper
 */
export default function GettingStartedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] flex-1 flex-col bg-[var(--nav-link-hover-bg)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  )
}
