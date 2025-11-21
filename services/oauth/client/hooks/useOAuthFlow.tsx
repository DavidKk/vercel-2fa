'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as oauthClientUtils from '@/services/oauth/client/utils'
import { exportPrivateKey, exportPublicKey, generateECDHKeyPair } from '@/utils/ecdh-client'

import { useECDHKeyPair } from './useECDHKeyPair'
import { useOAuth } from './useOAuth'

const { STORAGE_KEYS, decryptOAuthToken, fetchServerPublicKey, getStoredKeyPair, getStoredPrivateKey, storeOAuthSession, verifyOAuthToken } = oauthClientUtils

type VerifyTokenResult = oauthClientUtils.VerifyTokenResult

export type OAuthFlowMode = 'popup' | 'redirect'

export type OAuthFlowStatus = 'idle' | 'launching' | 'waiting' | 'verifying' | 'success' | 'error'

export interface OAuthFlowResult {
  status: OAuthFlowStatus
  mode: OAuthFlowMode
  setMode: (mode: OAuthFlowMode) => void
  error: string | null
  startLogin: (params: { redirectUrl: string }) => Promise<void>
  result: OAuthFlowVerifyResult | null
  reset: () => void
  isProcessing: boolean
  publicKeyStatus: 'loading' | 'ready' | 'error'
  publicKeyError: string | null
  keyPair: {
    publicKey: string | null
    privateKey: string | null
    loading: boolean
    error: string | null
    generate: () => Promise<void>
  }
}

export interface UseOAuthFlowOptions {
  providerUrl?: string
  defaultMode?: OAuthFlowMode
}

export interface OAuthFlowVerifyResult {
  decryptedPayload?: Record<string, unknown>
  verification?: VerifyTokenResult
}

interface MemoryKeyPair {
  publicKey: string
  privateKey: string
}

import { DEFAULT_FLOW_MODE, DEFAULT_PROVIDER_URL } from '../constants'

export function useOAuthFlow(options: UseOAuthFlowOptions = {}): OAuthFlowResult {
  const { providerUrl = DEFAULT_PROVIDER_URL, defaultMode = DEFAULT_FLOW_MODE } = options
  const [modeState, setModeState] = useState<OAuthFlowMode>(defaultMode)
  const modeRef = useRef<OAuthFlowMode>(defaultMode)
  const [status, setStatus] = useState<OAuthFlowStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<OAuthFlowVerifyResult | null>(null)
  const [serverPublicKey, setServerPublicKey] = useState<string | null>(null)
  const [publicKeyStatus, setPublicKeyStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [publicKeyError, setPublicKeyError] = useState<string | null>(null)
  const memoryKeyPairRef = useRef<MemoryKeyPair | null>(null)
  const memoryStateRef = useRef<string | null>(null)
  const authWindowRef = useRef<Window | null>(null)
  const authOriginRef = useRef<string | null>(null)
  const [callbackError, setCallbackError] = useState<string | null>(null)

  const {
    publicKey: storedPublicKey,
    privateKey: storedPrivateKey,
    loading: keyPairLoading,
    error: keyPairError,
    generate: generateStoredKeyPair,
  } = useECDHKeyPair({ autoLoad: true })

  const fetchPublicKey = useCallback(async () => {
    try {
      setPublicKeyStatus('loading')
      setPublicKeyError(null)
      const key = await fetchServerPublicKey()
      setServerPublicKey(key)
      setPublicKeyStatus('ready')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load server public key'
      setPublicKeyError(message)
      setPublicKeyStatus('error')
    }
  }, [])

  useEffect(() => {
    fetchPublicKey()
  }, [fetchPublicKey])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setResult(null)
    setCallbackError(null)
    memoryKeyPairRef.current = null
    memoryStateRef.current = null
    authWindowRef.current = null
    authOriginRef.current = null
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEYS.STATE)
    }
  }, [])

  const getCurrentPrivateKey = useCallback(() => {
    if (modeRef.current === 'popup') {
      return memoryKeyPairRef.current?.privateKey || null
    }
    return getStoredPrivateKey()
  }, [])

  const ensureRedirectKeyPair = useCallback(async () => {
    let current = getStoredKeyPair()
    if (!current.publicKey || !current.privateKey) {
      await generateStoredKeyPair()
      current = getStoredKeyPair()
    }
    return current
  }, [generateStoredKeyPair])

  const updateMode = useCallback((nextMode: OAuthFlowMode) => {
    modeRef.current = nextMode
    setModeState(nextMode)
  }, [])

  const buildProviderLoginUrl = useCallback(
    (redirectUrl: string, state: string) => {
      if (typeof window === 'undefined') {
        throw new Error('Provider login URL can only be built in the browser')
      }
      const isAbsolute = /^https?:\/\//i.test(providerUrl)
      const url = new URL(isAbsolute ? providerUrl : providerUrl.startsWith('/') ? providerUrl : `/${providerUrl}`, isAbsolute ? undefined : window.location.origin)
      url.searchParams.set('redirectUrl', encodeURIComponent(redirectUrl))
      url.searchParams.set('state', state)
      return url
    },
    [providerUrl]
  )

  const startLogin = useCallback(
    async ({ redirectUrl }: { redirectUrl: string }) => {
      if (typeof window === 'undefined') {
        throw new Error('OAuth login is only available in the browser')
      }
      setError(null)
      setCallbackError(null)
      setResult(null)
      setStatus('launching')
      modeRef.current = modeState
      const state = crypto.randomUUID()
      memoryStateRef.current = state

      try {
        // Add mode parameter to redirectUrl before building login URL
        const redirectUrlWithMode = new URL(redirectUrl, window.location.origin)
        redirectUrlWithMode.searchParams.set('mode', modeState)
        const finalRedirectUrl = redirectUrlWithMode.toString()

        const loginUrl = buildProviderLoginUrl(finalRedirectUrl, state)

        if (modeState === 'popup') {
          const keyPair = await generateECDHKeyPair()
          const publicKeyBase64 = await exportPublicKey(keyPair)
          const privateKeyBase64 = await exportPrivateKey(keyPair)
          memoryKeyPairRef.current = { publicKey: publicKeyBase64, privateKey: privateKeyBase64 }
          loginUrl.searchParams.set('clientPublicKey', publicKeyBase64)
          loginUrl.searchParams.set('callbackOrigin', window.location.origin)

          const popup = window.open(loginUrl.toString(), 'oauth-login', 'width=600,height=700')
          if (!popup) {
            throw new Error('Popup blocked. Please allow popups for this site.')
          }
          authWindowRef.current = popup
          authOriginRef.current = loginUrl.origin
          setStatus('waiting')
        } else {
          const keyPair = await ensureRedirectKeyPair()
          if (!keyPair.publicKey || !keyPair.privateKey) {
            throw new Error('Failed to prepare key pair')
          }
          storeOAuthSession({ state, clientPublicKey: keyPair.publicKey, clientPrivateKey: keyPair.privateKey })
          loginUrl.searchParams.set('clientPublicKey', keyPair.publicKey)
          window.location.href = loginUrl.toString()
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start OAuth login'
        setError(message)
        setStatus('error')
        throw err
      }
    },
    [buildProviderLoginUrl, ensureRedirectKeyPair, modeState]
  )

  const handleTokenReceived = useCallback(
    async (encryptedToken: string) => {
      if (!serverPublicKey) {
        throw new Error('Server public key is not loaded')
      }
      const privateKey = getCurrentPrivateKey()
      if (!privateKey) {
        throw new Error('Client private key not found. Please restart login.')
      }

      const decrypted = await decryptOAuthToken(encryptedToken, privateKey, serverPublicKey)
      if (!decrypted.token || typeof decrypted.token !== 'string') {
        throw new Error('Decrypted payload does not contain token.')
      }
      const verification = await verifyOAuthToken(decrypted.token)
      setResult({ decryptedPayload: decrypted as unknown as Record<string, unknown>, verification })
      setStatus('success')
      setError(null)
      setCallbackError(null)
      memoryKeyPairRef.current = null
      memoryStateRef.current = null
      authWindowRef.current = null
      authOriginRef.current = null
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEYS.STATE)
      }
    },
    [getCurrentPrivateKey, serverPublicKey]
  )

  const { isProcessing, error: oauthError } = useOAuth({
    serverPublicKey,
    publicKeyStatus,
    onTokenReceived: async (encryptedToken) => {
      setStatus('verifying')
      try {
        await handleTokenReceived(encryptedToken)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to process token'
        setError(message)
        setStatus('error')
        throw err
      }
    },
    onError: (err) => {
      setCallbackError(err)
      setStatus('error')
    },
    enabled: publicKeyStatus === 'ready',
    source: 'auto',
    authWindow: authWindowRef.current,
    authOrigin: authOriginRef.current ?? undefined,
    expectedState: memoryStateRef.current ?? undefined,
    getPrivateKey: () => getCurrentPrivateKey(),
  })

  useEffect(() => {
    if (isProcessing) {
      setStatus((prev) => (prev === 'waiting' ? 'verifying' : prev))
    }
  }, [isProcessing])

  useEffect(() => {
    if (oauthError) {
      setCallbackError(oauthError)
      setStatus('error')
    }
  }, [oauthError])

  const contextValue = useMemo<OAuthFlowResult>(
    () => ({
      status,
      mode: modeState,
      setMode: updateMode,
      error: error || callbackError,
      startLogin,
      result,
      reset,
      isProcessing,
      publicKeyStatus,
      publicKeyError,
      keyPair: {
        publicKey: storedPublicKey,
        privateKey: storedPrivateKey,
        loading: keyPairLoading,
        error: keyPairError,
        generate: async () => {
          await generateStoredKeyPair()
        },
      },
    }),
    [
      status,
      modeState,
      error,
      callbackError,
      startLogin,
      result,
      reset,
      isProcessing,
      publicKeyStatus,
      publicKeyError,
      storedPublicKey,
      storedPrivateKey,
      keyPairLoading,
      keyPairError,
      generateStoredKeyPair,
    ]
  )

  return contextValue
}
