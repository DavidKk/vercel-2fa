'use client'

import { appUi } from '@/components/ui/app-tokens'
import { useOAuthFlowContext } from '@/services/oauth/client'

import { OAuthCallbackPlayground } from './OAuthCallbackPlayground'
import { VerificationOutput } from './VerificationOutput'

interface OAuthPlaygroundProps {
  /** Whether this is a result page (determined by SSR) */
  isResultPage?: boolean
  /** Default callback URL from SSR */
  defaultCallbackUrl?: string | null
}

export function OAuthPlaygroundSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-label="Loading OAuth playground">
      <div className={`${appUi.cardCompact} flex flex-col gap-4 sm:flex-row sm:items-start`}>
        <div className={`${appUi.iconBox} animate-pulse`} />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-3 w-28 animate-pulse rounded bg-[var(--nav-link-active-bg)]" />
          <div className="h-7 w-64 max-w-full animate-pulse rounded bg-[var(--nav-link-active-bg)]" />
          <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-[var(--nav-link-active-bg)]" />
        </div>
      </div>
      <div className={`${appUi.cardCompact} flex flex-col gap-5`}>
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-[var(--nav-link-active-bg)]" />
          <div className="h-16 animate-pulse rounded-lg border border-[var(--app-header-border)] bg-[var(--background)]" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-[var(--nav-link-active-bg)]" />
            <div className="h-24 animate-pulse rounded-lg border border-[var(--app-header-border)] bg-[var(--background)]" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-[var(--nav-link-active-bg)]" />
            <div className="h-24 animate-pulse rounded-lg border border-[var(--app-header-border)] bg-[var(--background)]" />
          </div>
        </div>
      </div>
      <div className={`${appUi.cardCompact} h-20 animate-pulse`} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="h-11 animate-pulse rounded-lg bg-[var(--app-primary)]" />
        <div className="h-11 animate-pulse rounded-lg border border-[var(--app-header-border)] bg-[var(--app-header-bg)]" />
      </div>
    </div>
  )
}

/**
 * Main content component that renders either callback playground or verification output
 * @param isResultPage - If true, always show result page (result readiness is handled by result page UI)
 *                       Otherwise, determine based on status
 * @param defaultCallbackUrl - Default callback URL from SSR
 */
function PlaygroundContent({ isResultPage, defaultCallbackUrl }: { isResultPage: boolean; defaultCallbackUrl?: string | null }) {
  const { status } = useOAuthFlowContext()

  const shouldShowResult = isResultPage ? true : status === 'verifying' || status === 'success' || status === 'error'

  if (shouldShowResult) {
    return <VerificationOutput />
  }

  return <OAuthCallbackPlayground defaultCallbackUrl={defaultCallbackUrl} />
}

/**
 * OAuth playground layout component
 * Handles public key loading states and renders appropriate content
 */
export function OAuthPlayground({ isResultPage = false, defaultCallbackUrl }: OAuthPlaygroundProps) {
  return (
    <div className={appUi.pageShellTop}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <PlaygroundContent isResultPage={isResultPage} defaultCallbackUrl={defaultCallbackUrl} />
      </div>
    </div>
  )
}
