'use client'

import { useRouter } from 'next/navigation'
import { FiAlertTriangle, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'

import { appUi } from '@/components/ui/app-tokens'
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
    <section className={`${appUi.card} flex flex-col gap-6`}>
      <div className="flex flex-col items-center text-center">
        <div className={`${appUi.iconBox} mb-5 ${hasError ? 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/60 dark:text-red-300' : ''}`}>
          {hasError ? <FiAlertTriangle size={18} aria-hidden /> : <FiCheckCircle size={18} aria-hidden />}
        </div>
        <p className={`${appUi.sectionLabel} mb-2`}>OAuth result</p>
        <h1 className={`${appUi.pageTitle} mb-3`}>Callback verification</h1>
        <p className={`${appUi.lead} max-w-2xl`}>Decrypted payload and verification response from the OAuth callback.</p>
      </div>

      <div className="flex flex-col gap-4">
        {token && (
          <div className="space-y-1.5">
            <label className={appUi.fieldLabel}>Token</label>
            <pre className={`${appUi.codeBlock} max-h-28`}>
              <code className="break-all whitespace-pre-wrap">{token}</code>
            </pre>
          </div>
        )}
        {hasError ? (
          <div className={`${appUi.calloutWarn} border-red-200 bg-red-500/10 dark:border-red-900/60 dark:bg-red-950/30`}>
            <label className="mb-1 block text-sm font-semibold text-red-700 dark:text-red-300">Error</label>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        ) : decryptedPayload ? (
          <>
            <div className="space-y-1.5">
              <label className={appUi.fieldLabel}>Decrypted payload</label>
              <pre className={appUi.codeBlock}>
                <code className="break-all whitespace-pre-wrap">{JSON.stringify(decryptedPayload, null, 2)}</code>
              </pre>
            </div>
            {verification && (
              <div className="space-y-1.5">
                <label className={appUi.fieldLabel}>/api/auth/verify response</label>
                <pre className={appUi.codeBlock}>
                  <code className="break-all whitespace-pre-wrap">{JSON.stringify(verification, null, 2)}</code>
                </pre>
              </div>
            )}
          </>
        ) : (
          <div className={appUi.calloutInfo}>
            <label className="mb-1 block text-sm font-semibold text-[var(--nav-brand-text)]">Status</label>
            <p className={appUi.lead}>{status === 'verifying' ? 'Verifying token...' : status === 'waiting' ? 'Waiting for OAuth callback...' : 'Awaiting verification...'}</p>
          </div>
        )}
      </div>

      <button type="button" onClick={handleBack} className={appUi.btnSecondary}>
        <FiArrowLeft size={16} aria-hidden />
        Back to playground
      </button>
    </section>
  )
}
