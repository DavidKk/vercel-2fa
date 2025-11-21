'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

import { decryptECDHToken } from './decryptECDHToken'
import { useOAuth } from './hooks/useOAuth'
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
  const authWindowRef = useRef<Window | null>(null)
  const privateKeyRef = useRef<string | null>(null)
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

  // Shared token processing function
  // Note: State validation is already done in the hooks, this function only handles decryption and verification
  const processToken = useCallback(
    async (encryptedToken: string, state: string, clientPrivateKey: string) => {
      if (processedRef.current) {
        return
      }

      processedRef.current = true
      setStatus('verifying')
      setError(null)
      setVerifyResult(null)

      try {
        if (!serverPublicKey) {
          throw new Error('Server public key not loaded')
        }

        // Decrypt token
        const decryptedPayload = await decryptECDHToken(encryptedToken, clientPrivateKey, serverPublicKey)

        if (!decryptedPayload || typeof decryptedPayload !== 'object' || typeof (decryptedPayload as Record<string, unknown>).token !== 'string') {
          throw new Error('Decrypted payload does not contain a valid JWT token.')
        }

        // Verify with server
        const verification = await verifyWithServer((decryptedPayload as Record<string, unknown>).token as string)

        setVerifyResult({ decryptedPayload, verification })
        setStatus('idle')
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to process token')
      }
    },
    [serverPublicKey]
  )

  const handleLaunch = async (callbackUrl: string, publicKey: string, mode: 'popup' | 'redirect') => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const origin = window.location.origin
      const newState = crypto.randomUUID()
      sessionStorage.setItem(STATE_STORAGE, newState)

      // Store private key in memory (not sessionStorage) for popup mode
      const privateKey = sessionStorage.getItem(CLIENT_PRIVATE_KEY_STORAGE)
      if (!privateKey) {
        throw new Error('Private key not found. Please generate a key pair first.')
      }

      if (mode === 'popup') {
        privateKeyRef.current = privateKey
      }

      const login = new URL('/oauth', origin)
      login.searchParams.set('redirectUrl', encodeURIComponent(callbackUrl))
      login.searchParams.set('state', newState)
      login.searchParams.set('clientPublicKey', publicKey)

      // The auth window's origin (2FA service origin)
      const authOrigin = login.origin

      setStatus('redirecting')
      setError(null)
      setVerifyResult(null)
      processedRef.current = false
      // Clear previous state to prevent conflicts
      setCurrentState(null)
      setCurrentAuthOrigin(null)

      if (mode === 'popup') {
        // Popup mode: use window.open + postMessage
        login.searchParams.set('callbackOrigin', origin)

        const authWindow = window.open(login.toString(), 'oauth-login', 'width=600,height=700')
        if (!authWindow) {
          throw new Error('Failed to open login window. Please allow popups for this site.')
        }
        authWindowRef.current = authWindow

        // Set up postMessage handler
        setCurrentState(newState)
        setCurrentAuthOrigin(authOrigin)
      } else {
        // Redirect mode: use window.location with hash
        // Don't set callbackOrigin, so OAuthLoginForm will use redirect
        window.location.href = login.toString()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to launch OAuth login')
      setStatus('error')
    }
  }

  // State for OAuth hook
  const [currentState, setCurrentState] = useState<string | null>(null)
  const [currentAuthOrigin, setCurrentAuthOrigin] = useState<string | null>(null)

  // Handle token received callback (unified for both postMessage and URL)
  const handleTokenReceived = useCallback(
    async (encryptedToken: string, state: string) => {
      // eslint-disable-next-line no-console
      console.log('[OAuthPlayground] handleTokenReceived called', { hasToken: !!encryptedToken, state })

      // Prevent duplicate processing
      if (processedRef.current) {
        // eslint-disable-next-line no-console
        console.log('[OAuthPlayground] handleTokenReceived: already processed, skipping')
        return
      }

      // Get private key: for postMessage use memory, for URL use sessionStorage
      // This is handled by getPrivateKey function passed to useOAuth
      const clientPrivateKey = privateKeyRef.current || sessionStorage.getItem(CLIENT_PRIVATE_KEY_STORAGE)
      if (!clientPrivateKey) {
        throw new Error('Client private key not found. Please start a new OAuth login.')
      }

      // Clear private key from memory after use (if it was in memory)
      if (privateKeyRef.current) {
        privateKeyRef.current = null
      }

      // eslint-disable-next-line no-console
      console.log('[OAuthPlayground] Calling processToken')
      await processToken(encryptedToken, state, clientPrivateKey)
      // eslint-disable-next-line no-console
      console.log('[OAuthPlayground] processToken completed')
    },
    [processToken]
  )

  // Function to get private key (prefer memory for postMessage, fallback to sessionStorage)
  const getPrivateKey = useCallback(() => {
    return privateKeyRef.current || sessionStorage.getItem(CLIENT_PRIVATE_KEY_STORAGE)
  }, [])

  // Use unified OAuth hook
  const {
    isProcessing,
    isListening,
    error: oauthError,
    source,
  } = useOAuth({
    serverPublicKey,
    publicKeyStatus,
    onTokenReceived: handleTokenReceived,
    onError: (err) => {
      setError(err)
      setStatus('error')
    },
    enabled: publicKeyStatus === 'ready',
    source: 'auto', // Auto-detect postMessage or URL
    authWindow: authWindowRef.current,
    authOrigin: currentAuthOrigin || undefined,
    expectedState: currentState || undefined,
    getPrivateKey, // Provide function to get private key from memory or sessionStorage
  })

  // Debug logging
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[OAuthPlayground] Hook state:', {
      isProcessing,
      isListening,
      source,
      oauthError,
      publicKeyStatus,
      hasServerPublicKey: !!serverPublicKey,
    })
  }, [isProcessing, isListening, source, oauthError, publicKeyStatus, serverPublicKey])

  const handleBack = () => {
    setVerifyResult(null)
    setError(null)
    setStatus('idle')
    processedRef.current = false
    setCurrentState(null)
    setCurrentAuthOrigin(null)
    privateKeyRef.current = null
    authWindowRef.current = null
    // Clear state from sessionStorage when going back
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STATE_STORAGE)
    }
    // Clear URL parameters and navigate to clean state
    router.replace('/oauth/test')
  }

  // Update error state from hook
  useEffect(() => {
    if (oauthError) {
      setError(oauthError)
      setStatus('error')
    }
  }, [oauthError])

  // Update status based on processing state
  useEffect(() => {
    if (isProcessing) {
      setStatus('verifying')
    }
  }, [isProcessing])

  const hasToken = !!urlToken
  const hasResult = !!verifyResult || status === 'verifying' || (status === 'error' && error)
  const shouldShowResult = hasToken || hasResult

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 w-full flex flex-col gap-4 justify-center min-h-[60vh]">
        {publicKeyStatus === 'loading' && <div className="text-sm text-indigo-600 text-center">Fetching server public key...</div>}
        {publicKeyStatus === 'error' && (
          <div className="text-sm text-red-600 text-center">{publicKeyError || 'Unable to load server public key. Refresh the page to try again.'}</div>
        )}
        {!shouldShowResult && <OAuthCallbackPlayground onLaunch={handleLaunch} status={status} />}

        {shouldShowResult && <VerificationOutput token={urlToken || ''} verifyResult={verifyResult} status={status} error={error} onBack={handleBack} />}
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
