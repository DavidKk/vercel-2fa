'use client'

import { useRouter } from 'next/navigation'

import { useOAuthFlowContext } from '@/services/oauth/client'

import { OAuthCallbackPlayground } from './OAuthCallbackPlayground'
import { VerificationOutput } from './VerificationOutput'

export function OAuthPlayground() {
  const router = useRouter()
  const { status, error, result, reset, publicKeyStatus, publicKeyError } = useOAuthFlowContext()

  const shouldShowResult = status === 'verifying' || status === 'success' || status === 'error'

  const handleBack = () => {
    reset()

    router.replace('/oauth/playground')
  }

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 w-full flex flex-col gap-4 justify-center min-h-[60vh]">
        {publicKeyStatus === 'loading' && <div className="text-sm text-indigo-600 text-center">Fetching server public key...</div>}
        {publicKeyStatus === 'error' && (
          <div className="text-sm text-red-600 text-center">{publicKeyError || 'Unable to load server public key. Refresh the page to try again.'}</div>
        )}
        {!shouldShowResult && <OAuthCallbackPlayground />}
        {shouldShowResult && <VerificationOutput result={result} status={status} error={error} onBack={handleBack} />}
      </div>
    </div>
  )
}
