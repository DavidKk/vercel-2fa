'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

import { decryptECDHToken } from './decryptECDHToken'
import { OAuthCallbackPlayground } from './OAuthCallbackPlayground'
import { VerificationOutput } from './VerificationOutput'

interface VerifyResult {
  payload?: Record<string, unknown>
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
  const processedRef = useRef(false)
  // Get server public key from environment variable
  const serverPublicKey = process.env.NEXT_PUBLIC_ECDH_SERVER_PUBLIC_KEY || null

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
    const storedServerPublicKey = serverPublicKey || null

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

    if (!storedServerPublicKey) {
      setStatus('error')
      setError('Server public key not found. NEXT_PUBLIC_ECDH_SERVER_PUBLIC_KEY environment variable is not set.')
      return
    }

    // ECDH flow: decrypt the token
    decryptECDHToken(queryToken, clientPrivateKey, storedServerPublicKey)
      .then((decryptedPayload) => {
        setVerifyResult({ payload: decryptedPayload })
      })
      .catch((err: Error) => {
        setStatus('error')
        setError(err.message || 'Failed to decrypt token')
      })
  }, [router, serverPublicKey, urlToken, params])

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
        {!hasToken && <OAuthCallbackPlayground onLaunch={handleLaunch} status={status} />}

        {hasToken && <VerificationOutput token={urlToken} verifyResult={verifyResult} status={status} error={error} onBack={handleBack} />}
      </div>
    </div>
  )
}

export function OAuthPlayground() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]">Loading...</div>}>
      <OAuthPlaygroundContent />
    </Suspense>
  )
}
