'use client'

import { useEffect, useState } from 'react'

import { Spinner } from '@/components/Spinner'
import { Switch } from '@/components/Switch'
import { useOAuthFlowContext } from '@/services/oauth/client'

interface OAuthCallbackPlaygroundProps {
  /** Default callback URL from SSR */
  defaultCallbackUrl?: string | null
}

export function OAuthCallbackPlayground({ defaultCallbackUrl }: OAuthCallbackPlaygroundProps = {} as OAuthCallbackPlaygroundProps) {
  const { mode, setMode, status, keyPair, startLogin } = useOAuthFlowContext()
  const [editableCallbackUrl, setEditableCallbackUrl] = useState(defaultCallbackUrl || '')

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
    <section className="bg-white p-6 rounded-md shadow-md flex flex-col gap-4">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold">OAuth Callback Playground</h1>
        <p className="text-sm text-gray-500">Simulate a full third-party login flow with ECDH-encrypted token decryption.</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-base font-semibold text-gray-700">Callback URL</label>
        <textarea
          value={editableCallbackUrl}
          onChange={(e) => setEditableCallbackUrl(e.target.value)}
          rows={1}
          className="w-full overflow-y-scroll text-sm border rounded-md box-border px-3 py-2 font-mono resize-y focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-base font-semibold text-gray-700">Public Key</label>
          {keyPair.error && <span className="text-xs text-red-600">{keyPair.error}</span>}
        </div>
        <pre className="rounded-md bg-gray-900 text-gray-100 px-3 py-2 text-sm overflow-x-scroll overflow-y-auto break-all max-h-24 min-h-[2.5rem]">
          {keyPair.loading ? 'Generating...' : keyPair.publicKey || 'Not generated'}
        </pre>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-base font-semibold text-gray-700">Private Key</label>
        <pre className="rounded-md bg-gray-900 text-gray-100 px-3 py-2 text-sm overflow-x-scroll overflow-y-auto break-all max-h-24 min-h-[2.5rem]">
          {keyPair.loading ? 'Generating...' : keyPair.privateKey || 'Not generated'}
        </pre>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-gray-700">Launch Mode</label>
            <p className="text-xs text-gray-500">
              {mode === 'popup' ? 'Popup Window (postMessage) - More secure, uses window.open' : 'Redirect (URL Hash) - Uses window.location with hash parameters'}
            </p>
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
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleLaunch}
          disabled={!editableCallbackUrl || status === 'launching' || (mode === 'redirect' && !keyPair.publicKey)}
          className="flex-1 flex items-center justify-center gap-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'launching' ? <Spinner /> : 'Start OAuth Login'}
        </button>
        <button
          type="button"
          onClick={handleGenerateKeys}
          disabled={keyPair.loading}
          className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {keyPair.loading ? 'Generating...' : 'Generate Key Pair'}
        </button>
      </div>
    </section>
  )
}
