'use client'

import { useEffect, useMemo, useState } from 'react'

import { Spinner } from '@/components/Spinner'
import { Switch } from '@/components/Switch'
import { exportPrivateKey, exportPublicKey, generateECDHKeyPair } from '@/utils/ecdh-client'

const CLIENT_PUBLIC_KEY_STORAGE = 'oauth_client_public_key'
const CLIENT_PRIVATE_KEY_STORAGE = 'oauth_client_private_key'

export type OAuthLaunchMode = 'popup' | 'redirect'

export interface OAuthCallbackPlaygroundProps {
  onLaunch: (callbackUrl: string, publicKey: string, mode: OAuthLaunchMode) => void
  status: 'idle' | 'redirecting' | 'verifying' | 'error'
}

export function OAuthCallbackPlayground(props: OAuthCallbackPlaygroundProps) {
  const { onLaunch, status } = props
  const [origin, setOrigin] = useState('')
  const [editableCallbackUrl, setEditableCallbackUrl] = useState('')
  const [editableLoginUrl, setEditableLoginUrl] = useState('')
  const [temporaryPublicKey, setTemporaryPublicKey] = useState<string | null>(null)
  const [temporaryPrivateKey, setTemporaryPrivateKey] = useState<string | null>(null)
  const [generatingKeys, setGeneratingKeys] = useState(false)
  const [launchMode, setLaunchMode] = useState<OAuthLaunchMode>('popup')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const url = new URL(window.location.href)
    url.search = ''
    setOrigin(url.origin)
    const defaultCallbackUrl = url.toString()
    setEditableCallbackUrl(defaultCallbackUrl)

    const defaultLoginUrl = (() => {
      try {
        const loginUrl = new URL('/oauth', url.origin)
        loginUrl.searchParams.set('redirectUrl', encodeURIComponent(defaultCallbackUrl))
        loginUrl.searchParams.set('state', '<generated-on-click>')
        return loginUrl.toString()
      } catch {
        return ''
      }
    })()
    setEditableLoginUrl(defaultLoginUrl)

    const existingPublicKey = sessionStorage.getItem(CLIENT_PUBLIC_KEY_STORAGE)
    const existingPrivateKey = sessionStorage.getItem(CLIENT_PRIVATE_KEY_STORAGE)

    if (existingPublicKey && existingPrivateKey) {
      setTemporaryPublicKey(existingPublicKey)
      setTemporaryPrivateKey(existingPrivateKey)
    }
  }, [])

  const computedLoginUrl = useMemo(() => {
    if (!origin || !editableCallbackUrl) {
      return ''
    }
    try {
      const url = new URL('/oauth', origin)
      url.searchParams.set('redirectUrl', encodeURIComponent(editableCallbackUrl))
      url.searchParams.set('state', '<generated-on-click>')
      return url.toString()
    } catch {
      return ''
    }
  }, [origin, editableCallbackUrl])

  // Auto-update Login URL when Callback URL changes (only if Login URL is empty or matches previous computed value)
  useEffect(() => {
    if (computedLoginUrl && !editableLoginUrl) {
      setEditableLoginUrl(computedLoginUrl)
    }
  }, [computedLoginUrl, editableLoginUrl])

  const ensureKeyPair = async () => {
    const existingPublicKey = sessionStorage.getItem(CLIENT_PUBLIC_KEY_STORAGE)
    if (existingPublicKey) {
      return existingPublicKey
    }

    const keyPair = await generateECDHKeyPair()
    const publicKeyBase64 = await exportPublicKey(keyPair)
    const privateKeyBase64 = await exportPrivateKey(keyPair)
    sessionStorage.setItem(CLIENT_PUBLIC_KEY_STORAGE, publicKeyBase64)
    sessionStorage.setItem(CLIENT_PRIVATE_KEY_STORAGE, privateKeyBase64)
    setTemporaryPublicKey(publicKeyBase64)
    setTemporaryPrivateKey(privateKeyBase64)
    return publicKeyBase64
  }

  const handleGenerateKeys = async () => {
    setGeneratingKeys(true)
    try {
      const keyPair = await generateECDHKeyPair()
      const publicKeyBase64 = await exportPublicKey(keyPair)
      const privateKeyBase64 = await exportPrivateKey(keyPair)
      sessionStorage.setItem(CLIENT_PUBLIC_KEY_STORAGE, publicKeyBase64)
      sessionStorage.setItem(CLIENT_PRIVATE_KEY_STORAGE, privateKeyBase64)
      setTemporaryPublicKey(publicKeyBase64)
      setTemporaryPrivateKey(privateKeyBase64)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to generate temporary key pair', err)
    } finally {
      setGeneratingKeys(false)
    }
  }

  const handleLaunch = async () => {
    if (!origin || !editableCallbackUrl) {
      return
    }

    try {
      const publicKeyBase64 = await ensureKeyPair()
      onLaunch(editableCallbackUrl, publicKeyBase64, launchMode)
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
        <label className="text-base font-semibold text-gray-700">Login URL</label>
        <textarea
          value={editableLoginUrl || computedLoginUrl}
          onChange={(e) => setEditableLoginUrl(e.target.value)}
          rows={2}
          className="w-full overflow-y-scroll text-sm border rounded-md box-border px-3 py-2 font-mono resize-y focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-base font-semibold text-gray-700">Public Key</label>
        <pre className="rounded-md bg-gray-900 text-gray-100 px-3 py-2 text-sm overflow-x-scroll overflow-y-auto break-all max-h-24 min-h-[2.5rem]">
          {temporaryPublicKey || 'Not generated'}
        </pre>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-base font-semibold text-gray-700">Private Key</label>
        <pre className="rounded-md bg-gray-900 text-gray-100 px-3 py-2 text-sm overflow-x-scroll overflow-y-auto break-all max-h-24 min-h-[2.5rem]">
          {temporaryPrivateKey || 'Not generated'}
        </pre>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <label className="text-base font-semibold text-gray-700">Launch Mode</label>
            <p className="text-xs text-gray-500">
              {launchMode === 'popup' ? 'Popup Window (postMessage) - More secure, uses window.open' : 'Redirect (URL Hash) - Uses window.location with hash parameters'}
            </p>
          </div>
          <Switch checked={launchMode === 'popup'} onChange={(checked) => setLaunchMode(checked ? 'popup' : 'redirect')} size="md" variant="primary" />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleLaunch}
          disabled={!editableCallbackUrl || !origin || status === 'redirecting'}
          className="flex-1 flex items-center justify-center gap-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'redirecting' ? <Spinner /> : 'Start OAuth Login'}
        </button>
        <button
          type="button"
          onClick={handleGenerateKeys}
          disabled={generatingKeys}
          className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generatingKeys ? 'Generating...' : 'Generate Key Pair'}
        </button>
      </div>
    </section>
  )
}
