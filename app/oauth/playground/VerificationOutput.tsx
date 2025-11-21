'use client'

import { useRouter } from 'next/navigation'

import { useOAuthFlowContext } from '@/services/oauth/client'

export function VerificationOutput() {
  const router = useRouter()
  const { result, status, error, reset } = useOAuthFlowContext()

  const handleBack = () => {
    reset()
    router.replace('/oauth/playground')
  }

  const hasError = status === 'error' && error
  const decryptedPayload = result?.decryptedPayload
  const verification = result?.verification ? (result.verification as unknown as Record<string, unknown>) : undefined
  const token = typeof decryptedPayload?.token === 'string' ? (decryptedPayload.token as string) : ''

  return (
    <section className="bg-white p-6 rounded-md shadow-md flex flex-col gap-4">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold">OAuth Callback Playground</h1>
        <p className="text-sm text-gray-500">Decrypted payload and verification response from the OAuth callback.</p>
      </div>

      <div className="flex flex-col gap-2">
        {token && (
          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-gray-700">Token</label>
            <pre className="rounded-md bg-gray-900 text-gray-100 px-3 py-2 text-sm overflow-auto break-all max-h-24">{token}</pre>
          </div>
        )}
        {hasError ? (
          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-gray-700">Error</label>
            <p className="text-red-600">{error}</p>
          </div>
        ) : decryptedPayload ? (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-base font-semibold text-gray-700">Decrypted Payload</label>
              <pre className="rounded-md bg-gray-900 text-gray-100 px-3 py-2 text-sm overflow-auto break-all max-h-64">{JSON.stringify(decryptedPayload, null, 2)}</pre>
            </div>
            {verification && (
              <div className="flex flex-col gap-1">
                <label className="text-base font-semibold text-gray-700">/api/auth/verify Response</label>
                <pre className="rounded-md bg-gray-900 text-gray-100 px-3 py-2 text-sm overflow-auto break-all max-h-64">{JSON.stringify(verification, null, 2)}</pre>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-gray-700">Status</label>
            <p className="text-gray-600">{status === 'verifying' ? 'Verifying token...' : status === 'waiting' ? 'Waiting for OAuth callback...' : 'Awaiting verification...'}</p>
          </div>
        )}
      </div>

      <button type="button" onClick={handleBack} className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
        Back
      </button>
    </section>
  )
}
