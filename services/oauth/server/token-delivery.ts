/**
 * OAuth Server: Token Delivery
 * Handles delivery of encrypted tokens via postMessage or URL redirect
 */

import { OAUTH_POSTMESSAGE_TYPE } from './constants'

/**
 * Send token via postMessage (for popup window flow)
 */
export function sendTokenViaPostMessage(token: string, state: string | undefined, callbackOrigin: string | undefined): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  // Use postMessage if opened via window.open (has opener)
  if (window.opener && callbackOrigin) {
    try {
      const message = {
        type: OAUTH_POSTMESSAGE_TYPE,
        state: state || '',
        encryptedToken: token,
      }
      // eslint-disable-next-line no-console
      console.log('Sending postMessage to:', callbackOrigin, 'message type:', message.type, 'has token:', !!message.encryptedToken)
      window.opener.postMessage(message, callbackOrigin)
      // Close the window after a short delay to allow message to be sent
      setTimeout(() => {
        window.close()
      }, 100)
      return true
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to send postMessage:', error)
      return false
    }
  }

  return false
}

/**
 * Build redirect URL with token and state in hash (for redirect flow)
 */
export function buildRedirectUrlWithHash(redirectUrl: string, token: string, state: string | undefined): URL {
  const url = buildRedirectUrl(redirectUrl)
  const hashParams = new URLSearchParams()
  hashParams.set('token', token)
  if (state) {
    hashParams.set('state', state)
  }
  url.hash = hashParams.toString()
  return url
}

/**
 * Build redirect URL from target string
 */
function buildRedirectUrl(target: string): URL {
  try {
    return new URL(target)
  } catch {
    if (typeof window !== 'undefined') {
      return new URL(target, window.location.origin)
    }
    throw new Error('Invalid redirect URL')
  }
}

/**
 * Deliver token to client (tries postMessage first, falls back to redirect)
 */
export interface DeliverTokenOptions {
  token: string
  redirectUrl: string
  state?: string
  callbackOrigin?: string
  onRedirect?: (url: string) => void
}

export function deliverToken(options: DeliverTokenOptions): boolean {
  const { token, redirectUrl, state, callbackOrigin, onRedirect } = options

  if (typeof window === 'undefined') {
    return false
  }

  // Try postMessage first
  if (sendTokenViaPostMessage(token, state, callbackOrigin)) {
    return true
  }

  // Fallback to redirect with hash
  const url = buildRedirectUrlWithHash(redirectUrl, token, state)
  const urlString = url.toString()

  if (typeof window !== 'undefined' && window.location.origin !== url.origin) {
    window.location.href = urlString
  } else if (onRedirect) {
    onRedirect(urlString)
  }

  return true
}
