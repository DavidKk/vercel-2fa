'use client'

import { Spinner } from '@/components/Spinner'
import { useOAuthFlowContext } from '@/services/oauth/client'

import { OAuthCallbackPlayground } from './OAuthCallbackPlayground'
import { VerificationOutput } from './VerificationOutput'

interface OAuthPlaygroundProps {
  /** Whether this is a result page (determined by SSR) */
  isResultPage?: boolean
  /** Default callback URL from SSR */
  defaultCallbackUrl?: string | null
}

/** Loading state component for server public key */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Spinner color="text-indigo-600" size="h-8 w-8" />
      <div className="text-sm text-indigo-600 font-medium">Fetching server public key...</div>
    </div>
  )
}

/** Error state component for server public key loading failure */
function ErrorState({ error }: { error: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-semibold text-red-800">Load Failed</span>
      </div>
      <p className="text-sm text-red-700 text-center">{error || 'Unable to load server public key. Refresh the page to try again.'}</p>
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
  const { publicKeyStatus, publicKeyError } = useOAuthFlowContext()

  // If public key is loading or has error, show only status message without any functional components
  let content: React.ReactNode
  if (publicKeyStatus === 'loading') {
    content = <LoadingState />
  } else if (publicKeyStatus === 'error') {
    content = <ErrorState error={publicKeyError} />
  } else {
    content = <PlaygroundContent isResultPage={isResultPage} defaultCallbackUrl={defaultCallbackUrl} />
  }

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 w-full flex flex-col gap-4 justify-center min-h-[60vh]">{content}</div>
    </div>
  )
}
