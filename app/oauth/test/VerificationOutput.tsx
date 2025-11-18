'use client'

export interface VerificationOutputProps {
  token: string
  verifyResult: { payload?: Record<string, unknown> } | null
  status: 'idle' | 'redirecting' | 'verifying' | 'error'
  error: string | null
  onBack: () => void
}

export function VerificationOutput(props: VerificationOutputProps) {
  const { token, verifyResult, status, error, onBack } = props

  if (!token) {
    return null
  }

  const hasError = status === 'error' && error

  return (
    <section className="bg-white p-6 rounded-md shadow-md flex flex-col gap-4">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold">OAuth Callback Playground</h1>
        <p className="text-sm text-gray-500">Decrypted token and payload from OAuth callback.</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-base font-semibold text-gray-700">Token</label>
          <pre className="rounded-md bg-gray-900 text-gray-100 px-3 py-2 text-sm overflow-auto break-all max-h-24">{token}</pre>
        </div>
        {hasError ? (
          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-gray-700">Error</label>
            <p className="text-red-600">{error}</p>
          </div>
        ) : verifyResult ? (
          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-gray-700">Payload</label>
            <pre className="rounded-md bg-gray-900 text-gray-100 px-3 py-2 text-sm overflow-auto break-all max-h-64">
              {JSON.stringify(verifyResult.payload ?? verifyResult, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-gray-700">Status</label>
            <p className="text-gray-600">Awaiting verification...</p>
          </div>
        )}
      </div>

      <button type="button" onClick={onBack} className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
        Back
      </button>
    </section>
  )
}
