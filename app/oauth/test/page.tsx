'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { OAuthHelpSidebar } from '../OAuthHelpSidebar'

interface VerifyResult {
  valid: boolean
  payload?: Record<string, unknown>
}

const STATE_STORAGE = 'oauth_state'

export default function OAuthTestPage() {
  return (
    <>
      <OAuthHelpSidebar />
      <OAuthPlayground />
    </>
  )
}

function OAuthPlayground() {
  const router = useRouter()
  const [origin, setOrigin] = useState('')
  const [callbackUrl, setCallbackUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'redirecting' | 'verifying' | 'success' | 'error'>('idle')
  const [token, setToken] = useState('')
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const url = new URL(window.location.href)
    url.search = ''
    setOrigin(url.origin)
    setCallbackUrl(url.toString())
  }, [])

  const loginUrlPreview = useMemo(() => {
    if (!origin || !callbackUrl) {
      return ''
    }
    const url = new URL('/oauth', origin)
    url.searchParams.set('redirectUrl', encodeURIComponent(callbackUrl))
    url.searchParams.set('state', '<generated-on-click>')
    return url.toString()
  }, [origin, callbackUrl])

  const handleLaunch = () => {
    if (!origin || !callbackUrl) {
      return
    }

    const newState = crypto.randomUUID()
    sessionStorage.setItem(STATE_STORAGE, newState)

    const login = new URL('/oauth', origin)
    login.searchParams.set('redirectUrl', encodeURIComponent(callbackUrl))
    login.searchParams.set('state', newState)

    setStatus('redirecting')
    window.location.href = login.toString()
  }

  const handleClear = () => {
    setStatus('idle')
    setToken('')
    setVerifyResult(null)
    setError(null)
    sessionStorage.removeItem(STATE_STORAGE)
    if (typeof window !== 'undefined') {
      router.replace('/oauth/test')
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const params = new URLSearchParams(window.location.search)
    const queryToken = params.get('token')
    const returnedState = params.get('state')

    if (!queryToken) {
      return
    }

    setToken(queryToken)
    setStatus('verifying')
    setError(null)

    const storedState = sessionStorage.getItem(STATE_STORAGE)
    if (!storedState || storedState !== returnedState) {
      setStatus('error')
      setError('State validation failed. Please start over.')
      return
    }

    sessionStorage.removeItem(STATE_STORAGE)

    verifyToken(queryToken)
      .then((result) => {
        setVerifyResult(result)
        setStatus('success')
      })
      .catch((err: Error) => {
        setStatus('error')
        setError(err.message || 'Unknown error')
      })
      .finally(() => {
        router.replace('/oauth/test')
      })
  }, [router])

  const statusText = (() => {
    switch (status) {
      case 'redirecting':
        return 'Redirecting to OAuth login...'
      case 'verifying':
        return 'Verifying JWT payload...'
      case 'success':
        return 'Token verified successfully.'
      case 'error':
        return error || 'Verification failed.'
      default:
        return 'Ready to start OAuth login.'
    }
  })()

  return (
    <main className="container mx-auto max-w-4xl py-16 px-4 flex flex-col gap-10">
      <section className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-500 font-semibold">OAuth for Partners</p>
        <h1 className="text-4xl font-semibold text-gray-900">OAuth Callback Playground</h1>
        <p className="text-gray-600 leading-relaxed">
          Use this page to simulate a full third-party login. We redirect back here, read the token/state from the querystring, validate them, and call
          <code className="mx-1 rounded bg-gray-200 px-1 text-sm">/api/auth/verify</code> to decode the payload for you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <HighlightCard title="One Click Test">The callback URL automatically points to this page, so you only need to hit the button.</HighlightCard>
          <HighlightCard title="State Protection">State is generated per attempt and stored in sessionStorage to guard against replay.</HighlightCard>
          <HighlightCard title="Payload Preview">After verification we display the JWT payload so you can confirm the user info.</HighlightCard>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
        <header>
          <h2 className="text-2xl font-semibold text-gray-900">Test Flow</h2>
          <p className="text-gray-500 text-sm mt-1">
            Callback URL:
            <span className="ml-2 font-mono text-xs text-gray-800 break-all">{callbackUrl || 'Detecting current page...'}</span>
          </p>
          <p className="text-gray-500 text-sm">
            Login URL Preview:
            <span className="ml-2 font-mono text-xs text-gray-800 break-all">{loginUrlPreview || 'Waiting for origin...'}</span>
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={handleLaunch}
            disabled={!callbackUrl || !origin || status === 'redirecting'}
            className="flex-1 inline-flex justify-center items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium disabled:opacity-50"
          >
            Start OAuth Login
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 inline-flex justify-center items-center gap-2 rounded-lg border border-gray-300 text-gray-700 px-4 py-2 font-medium"
          >
            Clear Result
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700">Status</p>
          <p className="text-gray-800 mt-1">{statusText}</p>
        </div>
      </section>

      <section className="bg-indigo-50 rounded-2xl p-8 space-y-4">
        <h3 className="text-xl font-semibold text-indigo-900">Verification Output</h3>
        {token ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-indigo-900">Token</p>
              <p className="font-mono text-xs break-all text-indigo-100 bg-indigo-900 rounded-lg p-3 mt-1">{token}</p>
            </div>
            {verifyResult ? (
              <div>
                <p className="text-sm font-semibold text-indigo-900">Payload</p>
                <pre className="bg-indigo-900 text-indigo-100 rounded-lg p-4 text-xs overflow-auto">{JSON.stringify(verifyResult.payload ?? verifyResult, null, 2)}</pre>
              </div>
            ) : status === 'error' ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <p className="text-sm text-indigo-900">Awaiting verification...</p>
            )}
          </div>
        ) : (
          <p className="text-indigo-900/80 text-sm">Token details will appear here once the OAuth login completes.</p>
        )}
      </section>
    </main>
  )
}

function HighlightCard(props: { title: string; children: React.ReactNode }) {
  const { title, children } = props
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{children}</p>
    </div>
  )
}

async function verifyToken(token: string) {
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    throw new Error('Verification failed')
  }

  const data = (await response.json()) as { data: VerifyResult }
  return data.data ?? null
}
