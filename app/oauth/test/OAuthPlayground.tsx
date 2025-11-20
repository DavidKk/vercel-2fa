'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

import { decryptECDHToken } from './decryptECDHToken'
import { OAuthCallbackPlayground } from './OAuthCallbackPlayground'
import { VerificationOutput } from './VerificationOutput'

interface VerifyResult {
  decryptedPayload?: Record<string, unknown>
  verification?: Record<string, unknown>
}

const STATE_STORAGE = 'oauth_state'
const CLIENT_PUBLIC_KEY_STORAGE = 'oauth_client_public_key'
const CLIENT_PRIVATE_KEY_STORAGE = 'oauth_client_private_key'

function OAuthPlaygroundContent() {
  const router = useRouter()
  const params = useSearchParams()
  const urlToken = params.get('token') || ''
  const [status, setStatus] = useState<'idle' | 'redirecting' | 'verifying' | 'error'>('idle')
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [serverPublicKey, setServerPublicKey] = useState<string | null>(null)
  const [publicKeyStatus, setPublicKeyStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [publicKeyError, setPublicKeyError] = useState<string | null>(null)
  const processedRef = useRef(false)
  useEffect(() => {
    let cancelled = false

    async function fetchPublicKey() {
      try {
        setPublicKeyStatus('loading')
        setPublicKeyError(null)

        const response = await fetch('/api/oauth/public-key', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const body = await response.json()

        if (!response.ok || !body || typeof body !== 'object') {
          throw new Error('Failed to load server public key.')
        }

        if (body.code !== 0 || !body.data?.key) {
          throw new Error(body.message || 'Server public key is not available.')
        }

        if (cancelled) {
          return
        }

        setServerPublicKey(body.data.key as string)
        setPublicKeyStatus('ready')
      } catch (err) {
        if (cancelled) {
          return
        }
        setServerPublicKey(null)
        setPublicKeyStatus('error')
        const message = err instanceof Error ? err.message : 'Failed to load server public key.'
        setPublicKeyError(message)
      }
    }

    fetchPublicKey()

    return () => {
      cancelled = true
    }
  }, [])

  const handleLaunch = async (callbackUrl: string, publicKey: string) => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const origin = window.location.origin
      const newState = crypto.randomUUID()
      sessionStorage.setItem(STATE_STORAGE, newState)

      const login = new URL('/oauth', origin)
      login.searchParams.set('redirectUrl', encodeURIComponent(callbackUrl))
      login.searchParams.set('state', newState)
      login.searchParams.set('clientPublicKey', publicKey)

      setStatus('redirecting')
      window.location.href = login.toString()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to launch OAuth login')
      setStatus('error')
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (publicKeyStatus !== 'ready' || !serverPublicKey) {
      return
    }

    const returnedState = params.get('state')
    let queryToken = urlToken

    // Only process if we have a token and haven't already processed it
    if (!queryToken || processedRef.current) {
      return
    }

    processedRef.current = true

    // URL decode the token if needed (it might be URL-encoded)
    try {
      queryToken = decodeURIComponent(queryToken)
    } catch {
      // If decoding fails, use the original token
    }

    setStatus('verifying')
    setError(null)
    setVerifyResult(null)

    const storedState = sessionStorage.getItem(STATE_STORAGE)
    if (!returnedState) {
      setStatus('error')
      setError('State parameter is missing from the callback URL. Please start a new OAuth login.')
      return
    }
    if (!storedState) {
      setStatus('error')
      setError('State not found in session storage. This may happen if you refreshed the page or opened the callback in a new tab. Please start a new OAuth login.')
      return
    }
    if (storedState !== returnedState) {
      setStatus('error')
      setError(`State validation failed. Expected: ${storedState.substring(0, 8)}..., Got: ${returnedState.substring(0, 8)}... Please start over.`)
      return
    }

    // Only remove state after successful validation
    sessionStorage.removeItem(STATE_STORAGE)

    // Only support ECDH flow - check required keys
    const clientPublicKey = sessionStorage.getItem(CLIENT_PUBLIC_KEY_STORAGE)
    const clientPrivateKey = sessionStorage.getItem(CLIENT_PRIVATE_KEY_STORAGE)

    // Validate ECDH requirements
    if (!clientPublicKey) {
      setStatus('error')
      setError('Client public key not found. Please start a new OAuth login.')
      return
    }

    if (!clientPrivateKey) {
      setStatus('error')
      setError('Client private key not found. Please start a new OAuth login.')
      return
    }

    // ECDH flow: decrypt the token
    const processToken = async () => {
      try {
        const decryptedPayload = await decryptECDHToken(queryToken, clientPrivateKey, serverPublicKey)

        if (!decryptedPayload || typeof decryptedPayload !== 'object' || typeof (decryptedPayload as Record<string, unknown>).token !== 'string') {
          throw new Error('Decrypted payload does not contain a valid JWT token.')
        }

        const verification = await verifyWithServer((decryptedPayload as Record<string, unknown>).token as string)

        setVerifyResult({ decryptedPayload, verification })
        setStatus('idle')
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to process token')
      }
    }

    processToken()
  }, [publicKeyStatus, router, serverPublicKey, urlToken, params])

  const handleBack = () => {
    setVerifyResult(null)
    setError(null)
    setStatus('idle')
    processedRef.current = false
    // Clear state from sessionStorage when going back
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STATE_STORAGE)
    }
    // Clear URL parameters and navigate to clean state
    router.replace('/oauth/test')
  }

  const hasToken = !!urlToken

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 w-full flex flex-col gap-4 justify-center min-h-[60vh]">
        {publicKeyStatus === 'loading' && <div className="text-sm text-indigo-600 text-center">Fetching server public key...</div>}
        {publicKeyStatus === 'error' && (
          <div className="text-sm text-red-600 text-center">{publicKeyError || 'Unable to load server public key. Refresh the page to try again.'}</div>
        )}
        {!hasToken && <OAuthCallbackPlayground onLaunch={handleLaunch} status={status} />}

        {hasToken && <VerificationOutput token={urlToken} verifyResult={verifyResult} status={status} error={error} onBack={handleBack} />}
      </div>
    </div>
  )
}

async function verifyWithServer(token: string) {
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  const result = await response.json()

  if (!response.ok || !result || typeof result !== 'object') {
    throw new Error('Failed to verify token with /api/auth/verify.')
  }

  if (result.code !== 0) {
    throw new Error(result.message || 'Token verification failed.')
  }

  return result.data as Record<string, unknown>
}

export function OAuthPlayground() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]">Loading...</div>}>
      <OAuthPlaygroundContent />
    </Suspense>
  )
}
