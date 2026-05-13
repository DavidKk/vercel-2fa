'use client'

import { useEffect, useState } from 'react'
import { FiKey, FiLoader, FiPlayCircle, FiRefreshCw } from 'react-icons/fi'

import { Switch } from '@/components/Switch'
import { appUi } from '@/components/ui/app-tokens'
import { useOAuthFlowContext } from '@/services/oauth/client'

interface OAuthCallbackPlaygroundProps {
  /** Default callback URL from SSR */
  defaultCallbackUrl?: string | null
}

export function OAuthCallbackPlayground({ defaultCallbackUrl }: OAuthCallbackPlaygroundProps = {} as OAuthCallbackPlaygroundProps) {
  const { mode, setMode, status, keyPair, startLogin, publicKeyStatus, publicKeyError } = useOAuthFlowContext()
  const [editableCallbackUrl, setEditableCallbackUrl] = useState(defaultCallbackUrl || '')
  const isServerKeyReady = publicKeyStatus === 'ready'

  useEffect(() => {
    // If defaultCallbackUrl is provided from SSR, use it; otherwise generate from current URL
    if (defaultCallbackUrl) {
      setEditableCallbackUrl(defaultCallbackUrl)
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    const url = new URL(window.location.href)
    url.search = ''
    url.hash = ''
    // Add resultPage parameter to identify this as result page
    url.searchParams.set('resultPage', 'true')

    const generatedCallbackUrl = url.toString()
    setEditableCallbackUrl(generatedCallbackUrl)
  }, [defaultCallbackUrl])

  const handleGenerateKeys = async () => {
    try {
      await keyPair.generate()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to generate temporary key pair', err)
    }
  }

  const handleLaunch = async () => {
    if (!editableCallbackUrl) {
      return
    }

    try {
      await startLogin({ redirectUrl: editableCallbackUrl })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to generate key pair', err)
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <header className={`${appUi.cardCompact} flex flex-col gap-4 sm:flex-row sm:items-start`}>
        <div className={appUi.iconBox}>
          <FiPlayCircle size={18} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`${appUi.sectionLabel} mb-1.5`}>OAuth sandbox</p>
          <h1 className={`${appUi.pageTitle} mb-2`}>Callback playground</h1>
          <p className={`${appUi.lead} max-w-3xl`}>Simulate a third-party login flow with ECDH-encrypted token return and local callback verification.</p>
        </div>
      </header>

      <div className={`${appUi.cardCompact} flex flex-col gap-5`}>
        <div className="space-y-1.5">
          <label htmlFor="oauth-callback-url" className={appUi.fieldLabel}>
            Callback URL
          </label>
          <textarea
            id="oauth-callback-url"
            value={editableCallbackUrl}
            onChange={(e) => setEditableCallbackUrl(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            rows={2}
            className={`${appUi.control} min-h-16 resize-y font-mono text-xs leading-relaxed`}
          />
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <label className={appUi.fieldLabel}>Public key</label>
              {keyPair.error && <span className="text-xs text-red-600 dark:text-red-400">{keyPair.error}</span>}
            </div>
            <textarea
              readOnly
              value={keyPair.loading ? 'Generating...' : keyPair.publicKey || 'Not generated'}
              rows={4}
              className={`${appUi.control} min-h-24 flex-1 resize-y font-mono text-xs leading-relaxed`}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <label className={appUi.fieldLabel}>Private key</label>
            <textarea
              readOnly
              value={keyPair.loading ? 'Generating...' : keyPair.privateKey || 'Not generated'}
              rows={4}
              className={`${appUi.control} min-h-24 flex-1 resize-y font-mono text-xs leading-relaxed`}
            />
          </div>
        </div>
      </div>

      <div className={`${appUi.cardCompact} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex flex-col gap-1">
          <span className={appUi.fieldLabel}>Launch mode</span>
          <p className={appUi.muted}>{mode === 'popup' ? 'Popup window using postMessage handoff.' : 'Full redirect using URL hash callback data.'}</p>
          {publicKeyStatus === 'loading' && <p className={appUi.muted}>Preparing server public key in the background...</p>}
          {publicKeyStatus === 'error' && <p className="text-xs leading-relaxed text-red-600 dark:text-red-400">{publicKeyError || 'Server public key failed to load.'}</p>}
        </div>
        <Switch
          checked={mode === 'popup'}
          onChange={(checked) => {
            setMode(checked ? 'popup' : 'redirect')
          }}
          size="md"
          variant="primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleLaunch}
          disabled={!editableCallbackUrl || status === 'launching' || !isServerKeyReady || (mode === 'redirect' && !keyPair.publicKey)}
          className={appUi.btnPrimary}
        >
          {status === 'launching' ? (
            <>
              <FiLoader size={16} className="animate-spin" aria-hidden />
              Starting...
            </>
          ) : (
            <>
              <FiPlayCircle size={16} aria-hidden />
              Start OAuth login
            </>
          )}
        </button>
        <button type="button" onClick={handleGenerateKeys} disabled={keyPair.loading} className={appUi.btnSecondary}>
          {keyPair.loading ? (
            <>
              <FiLoader size={16} className="animate-spin" aria-hidden />
              Generating...
            </>
          ) : keyPair.publicKey ? (
            <>
              <FiRefreshCw size={16} aria-hidden />
              Regenerate key pair
            </>
          ) : (
            <>
              <FiKey size={16} aria-hidden />
              Generate key pair
            </>
          )}
        </button>
      </div>
    </section>
  )
}
