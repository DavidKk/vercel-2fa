'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { getStoredPrivateKey, getStoredState, STORAGE_KEYS } from '@/services/oauth/client/utils'

import { OAUTH_POSTMESSAGE_TYPE } from '../constants'

export interface OAuthPostMessageData {
  type: typeof OAUTH_POSTMESSAGE_TYPE
  state: string
  encryptedToken: string
}

export type OAuthSource = 'postMessage' | 'url' | 'auto'

export interface UseOAuthOptions {
  /**
   * Server public key for ECDH decryption
   */
  serverPublicKey: string | null
  /**
   * Status of server public key loading
   */
  publicKeyStatus: 'loading' | 'ready' | 'error'
  /**
   * Callback when encrypted token is received and validated
   * @param encryptedToken - The encrypted token from OAuth provider
   * @param state - The state parameter for validation
   */
  onTokenReceived: (encryptedToken: string, state: string) => Promise<void>
  /**
   * Error callback
   */
  onError?: (error: string) => void
  /**
   * Enable/disable the hook
   */
  enabled?: boolean
  /**
   * OAuth source type: 'postMessage' for window.postMessage, 'url' for URL parameters, 'auto' to detect automatically
   * @default 'auto'
   */
  source?: OAuthSource
  /**
   * For postMessage source: the authentication window reference
   */
  authWindow?: Window | null
  /**
   * For postMessage source: the expected origin of the authentication service
   */
  authOrigin?: string
  /**
   * For postMessage source: the expected state value
   */
  expectedState?: string
  /**
   * Optional function to get client private key. If not provided, will use sessionStorage.
   * This is useful for postMessage flow where private key might be stored in memory.
   */
  getPrivateKey?: () => string | null
}

export interface UseOAuthResult {
  /**
   * Whether the hook is currently processing a token
   */
  isProcessing: boolean
  /**
   * Whether postMessage listener is active (only for postMessage source)
   */
  isListening: boolean
  /**
   * Current error, if any
   */
  error: string | null
  /**
   * The detected or configured source type
   */
  source: OAuthSource | null
}

/**
 * Unified hook for handling OAuth callbacks via postMessage or URL parameters
 *
 * @example
 * ```tsx
 * const { isProcessing, error } = useOAuth({
 *   serverPublicKey,
 *   publicKeyStatus: 'ready',
 *   onTokenReceived: async (encryptedToken, state) => {
 *     // Process the encrypted token
 *   },
 *   source: 'auto', // or 'postMessage' or 'url'
 *   authWindow: openedWindow,
 *   authOrigin: 'https://auth.example.com',
 *   expectedState: currentState,
 * })
 * ```
 */
export function useOAuth(options: UseOAuthOptions): UseOAuthResult {
  const {
    serverPublicKey,
    publicKeyStatus,
    onTokenReceived,
    onError,
    enabled = true,
    source: sourceOption = 'auto',
    authWindow,
    authOrigin,
    expectedState,
    getPrivateKey,
  } = options

  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detectedSource, setDetectedSource] = useState<OAuthSource | null>(null)
  const processedRef = useRef(false)
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null)
  const isProcessingRef = useRef(false)
  const postMessageProcessedRef = useRef(false)

  const params = useSearchParams()
  // Read from hash first (more secure), fallback to query params for backward compatibility
  const [hashToken, setHashToken] = useState<string>('')
  const [hashState, setHashState] = useState<string>('')

  // Parse hash parameters on mount and when hash changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const parseHash = () => {
      const hash = window.location.hash.substring(1) // Remove '#'
      const hashParams = new URLSearchParams(hash)
      const tokenFromHash = hashParams.get('token') || ''
      const stateFromHash = hashParams.get('state') || ''

      // eslint-disable-next-line no-console
      console.log('[useOAuth] Parsing hash:', { hash, tokenFromHash: !!tokenFromHash, stateFromHash: !!stateFromHash })

      setHashToken(tokenFromHash)
      setHashState(stateFromHash)
    }

    // Parse immediately
    parseHash()

    // Listen for hash changes
    const handleHashChange = () => {
      parseHash()
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  // Prefer hash over query params (hash is more secure, not sent to server)
  const urlToken = hashToken || params.get('token') || ''
  const urlState = hashState || params.get('state') || ''

  // Debug logging
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[useOAuth] Token state:', {
      hashToken: !!hashToken,
      urlToken: !!urlToken,
      hashState: !!hashState,
      urlState: !!urlState,
      detectedSource,
      publicKeyStatus,
      hasServerPublicKey: !!serverPublicKey,
    })
  }, [hashToken, urlToken, hashState, urlState, detectedSource, publicKeyStatus, serverPublicKey])

  // Detect source type if auto
  useEffect(() => {
    if (sourceOption !== 'auto') {
      setDetectedSource(sourceOption)
      return
    }

    // Auto-detect: prefer postMessage if authWindow is available, otherwise use URL
    if (authWindow && authOrigin && expectedState) {
      setDetectedSource('postMessage')
    } else if (urlToken) {
      setDetectedSource('url')
    } else {
      setDetectedSource(null)
    }

    // eslint-disable-next-line no-console
    console.log('[useOAuth] Source detection:', {
      sourceOption,
      hasAuthWindow: !!authWindow,
      hasAuthOrigin: !!authOrigin,
      hasExpectedState: !!expectedState,
      hasUrlToken: !!urlToken,
      urlTokenLength: urlToken.length,
      willDetectAs: authWindow && authOrigin && expectedState ? 'postMessage' : urlToken ? 'url' : null,
    })
  }, [sourceOption, authWindow, authOrigin, expectedState, urlToken, hashToken])

  // Shared token validation and processing
  // Note: State validation is done before calling this function
  const processToken = useCallback(
    async (encryptedToken: string, state: string, clientPrivateKey: string) => {
      setIsProcessing(true)
      setError(null)

      try {
        // Validate required keys
        if (!clientPrivateKey) {
          throw new Error('Client private key not found. Please start a new OAuth login.')
        }

        if (!serverPublicKey) {
          throw new Error('Server public key not loaded')
        }

        // eslint-disable-next-line no-console
        console.log('[useOAuth] Calling onTokenReceived callback')

        // Call the token received callback
        // The callback should handle decryption and verification
        await onTokenReceived(encryptedToken, state)

        // eslint-disable-next-line no-console
        console.log('[useOAuth] onTokenReceived callback completed')
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to process token'
        // eslint-disable-next-line no-console
        console.error('[useOAuth] processToken error:', errorMsg, err)
        setError(errorMsg)
        onError?.(errorMsg)
        throw err
      } finally {
        setIsProcessing(false)
      }
    },
    [serverPublicKey, onTokenReceived, onError]
  )

  // PostMessage handler
  const handlePostMessage = useCallback(
    (event: MessageEvent) => {
      // Quick filter: validate message type first
      if (event.data?.type !== OAUTH_POSTMESSAGE_TYPE) {
        return
      }

      // Validate origin
      if (authOrigin && event.origin !== authOrigin) {
        // eslint-disable-next-line no-console
        console.warn('Ignoring message from unexpected origin:', event.origin, 'expected:', authOrigin)
        return
      }

      // Validate source window
      if (event.source && event.source === window) {
        // eslint-disable-next-line no-console
        console.warn('Ignoring message from self')
        return
      }

      // Verify authWindow is still open
      if (authWindow && authWindow.closed) {
        // eslint-disable-next-line no-console
        console.warn('Auth window is closed, ignoring message')
        return
      }

      // Validate state
      if (expectedState && event.data?.state !== expectedState) {
        const errorMsg = 'State validation failed. Please try again.'
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      // Process the encrypted token
      const encryptedToken = event.data?.encryptedToken
      if (!encryptedToken) {
        const errorMsg = 'Missing encrypted token in message'
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      // Prevent duplicate processing
      if (isProcessingRef.current || postMessageProcessedRef.current) {
        // eslint-disable-next-line no-console
        console.log('[useOAuth] PostMessage already processed, ignoring duplicate message')
        return
      }
      isProcessingRef.current = true
      postMessageProcessedRef.current = true

      // Remove listener immediately to prevent duplicate messages
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current)
        messageHandlerRef.current = null
        setIsListening(false)
      }

      // Get private key: prefer getPrivateKey function, fallback to sessionStorage
      const clientPrivateKey = getPrivateKey ? getPrivateKey() : getStoredPrivateKey()
      if (!clientPrivateKey) {
        const errorMsg = 'Client private key not found'
        setError(errorMsg)
        onError?.(errorMsg)
        isProcessingRef.current = false
        postMessageProcessedRef.current = false
        return
      }

      // Process token
      processToken(encryptedToken, event.data.state, clientPrivateKey)
        .then(() => {
          // eslint-disable-next-line no-console
          console.log('[useOAuth] PostMessage token processing completed')
          // Keep isProcessingRef.current = true and postMessageProcessedRef.current = true
          // to prevent duplicate processing. The listener has already been removed above.
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[useOAuth] PostMessage token processing failed:', err)
          isProcessingRef.current = false
          postMessageProcessedRef.current = false
          // Don't re-add listener on error, user should start a new flow
        })
    },
    [authWindow, authOrigin, expectedState, processToken, onError, getPrivateKey]
  )

  // Setup postMessage listener
  useEffect(() => {
    if (!enabled || detectedSource !== 'postMessage') {
      setIsListening(false)
      // Reset processing flags when not in postMessage mode
      if (detectedSource !== 'postMessage') {
        isProcessingRef.current = false
        postMessageProcessedRef.current = false
      }
      return
    }

    if (!authWindow || !authOrigin || !expectedState) {
      // Reset processing flags when auth params are missing (new flow starting)
      isProcessingRef.current = false
      postMessageProcessedRef.current = false
      return
    }

    // Don't set up listener if already processing (prevents re-listening after token received)
    if (isProcessingRef.current || postMessageProcessedRef.current) {
      // eslint-disable-next-line no-console
      console.log('[useOAuth] Skipping postMessage listener setup: already processed', {
        isProcessing: isProcessingRef.current,
        postMessageProcessed: postMessageProcessedRef.current,
      })
      return
    }

    // Store handler reference for cleanup
    messageHandlerRef.current = handlePostMessage
    setIsListening(true)
    setError(null)
    isProcessingRef.current = false
    postMessageProcessedRef.current = false

    window.addEventListener('message', handlePostMessage)

    // Cleanup listener if window is closed manually
    const checkWindowClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkWindowClosed)
        if (messageHandlerRef.current) {
          window.removeEventListener('message', messageHandlerRef.current)
          messageHandlerRef.current = null
          setIsListening(false)
        }
      }
    }, 500)

    return () => {
      clearInterval(checkWindowClosed)
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current)
        messageHandlerRef.current = null
      }
      setIsListening(false)
      // Only reset processing flags if auth params are cleared (new flow starting)
      // Otherwise keep them to prevent re-processing
      if (!authWindow || !authOrigin || !expectedState) {
        isProcessingRef.current = false
        postMessageProcessedRef.current = false
      }
    }
  }, [enabled, detectedSource, authWindow, authOrigin, expectedState, handlePostMessage])

  // URL callback handler
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[useOAuth] URL callback check:', {
      enabled,
      detectedSource,
      publicKeyStatus,
      hasServerPublicKey: !!serverPublicKey,
      hasUrlToken: !!urlToken,
      processed: processedRef.current,
    })

    if (!enabled || detectedSource !== 'url' || typeof window === 'undefined') {
      return
    }

    if (publicKeyStatus !== 'ready' || !serverPublicKey) {
      // eslint-disable-next-line no-console
      console.log('[useOAuth] URL callback skipped: publicKey not ready')
      return
    }

    // Only process if we have a token and haven't already processed it
    if (!urlToken || processedRef.current) {
      // eslint-disable-next-line no-console
      console.log('[useOAuth] URL callback skipped: no token or already processed', { urlToken: !!urlToken, processed: processedRef.current })
      return
    }

    // eslint-disable-next-line no-console
    console.log('[useOAuth] Processing URL callback token', { urlToken: urlToken.substring(0, 50) + '...', urlState })

    processedRef.current = true

    // Clear hash from URL immediately after reading token (for security)
    if (typeof window !== 'undefined' && window.location.hash) {
      // Remove hash from URL without triggering page reload
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      // eslint-disable-next-line no-console
      console.log('[useOAuth] Hash cleared from URL')
    }

    // URL decode the token if needed
    let queryToken = urlToken
    try {
      queryToken = decodeURIComponent(queryToken)
    } catch {
      // If decoding fails, use the original token
    }

    // Validate state
    const storedState = getStoredState()
    // eslint-disable-next-line no-console
    console.log('[useOAuth] State validation:', {
      hasUrlState: !!urlState,
      urlStateLength: urlState?.length || 0,
      hasStoredState: !!storedState,
      storedStateLength: storedState?.length || 0,
      urlStatePreview: urlState?.substring(0, 8) || 'none',
      storedStatePreview: storedState?.substring(0, 8) || 'none',
      sessionStorageKeys: typeof window !== 'undefined' ? Object.keys(sessionStorage).filter((k) => k.startsWith('oauth_')) : [],
    })
    if (!urlState) {
      const errorMsg = 'State parameter is missing from the callback URL. Please start a new OAuth login.'
      setError(errorMsg)
      setIsProcessing(false)
      onError?.(errorMsg)
      processedRef.current = false
      return
    }
    if (!storedState) {
      const errorMsg = 'State not found in session storage. This may happen if you refreshed the page or opened the callback in a new tab. Please start a new OAuth login.'
      // eslint-disable-next-line no-console
      console.error('[useOAuth] State not found in sessionStorage:', {
        urlState,
        storedState,
        allSessionStorageKeys: typeof window !== 'undefined' ? Object.keys(sessionStorage) : [],
      })
      setError(errorMsg)
      setIsProcessing(false)
      onError?.(errorMsg)
      processedRef.current = false
      return
    }
    if (storedState !== urlState) {
      const errorMsg = `State validation failed. Expected: ${storedState.substring(0, 8)}..., Got: ${urlState.substring(0, 8)}... Please start over.`
      setError(errorMsg)
      setIsProcessing(false)
      onError?.(errorMsg)
      processedRef.current = false
      return
    }

    // Only remove state after successful validation
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEYS.STATE)
    }

    // Get private key: prefer getPrivateKey function, fallback to sessionStorage
    const clientPrivateKey = getPrivateKey ? getPrivateKey() : getStoredPrivateKey()
    if (!clientPrivateKey) {
      const errorMsg = 'Client private key not found. Please start a new OAuth login.'
      // eslint-disable-next-line no-console
      console.error('[useOAuth] Missing private key')
      setError(errorMsg)
      setIsProcessing(false)
      onError?.(errorMsg)
      processedRef.current = false
      return
    }

    // eslint-disable-next-line no-console
    console.log('[useOAuth] About to call processToken', {
      hasToken: !!queryToken,
      tokenLength: queryToken.length,
      hasState: !!urlState,
      hasPrivateKey: !!clientPrivateKey,
      processTokenType: typeof processToken,
    })

    // Process token - call directly to avoid closure issues
    setIsProcessing(true)
    setError(null)

    // Call processToken directly
    processToken(queryToken, urlState, clientPrivateKey)
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('[useOAuth] Token processing completed successfully')
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[useOAuth] Token processing failed:', err)
        processedRef.current = false
        setIsProcessing(false)
      })
  }, [enabled, detectedSource, publicKeyStatus, serverPublicKey, urlToken, urlState, processToken, onError, getPrivateKey])

  return {
    isProcessing,
    isListening: detectedSource === 'postMessage' ? isListening : false,
    error,
    source: detectedSource,
  }
}
