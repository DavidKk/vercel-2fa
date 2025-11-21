/**
 * OAuth Server: Parameter Validation
 * Validates and normalizes OAuth request parameters
 */

import { isAllowedRedirectUrl } from '@/utils/url'

/**
 * Normalize client public key from query parameter
 * Handles URL encoding issues (e.g., '+' signs converted to spaces)
 */
export function normalizeClientPublicKey(value?: string): string | undefined {
  if (!value) {
    return undefined
  }
  const decoded = safeDecodeURIComponent(value)
  // Some clients send base64 with '+' signs without encoding; browsers convert '+' to ' ' when parsing querystring.
  // Convert spaces back to '+' to ensure we use the original base64 string.
  return decoded.replace(/ /g, '+').trim()
}

/**
 * Validate if a string is a valid base64-encoded key
 */
export function isValidBase64Key(value: string): boolean {
  if (!value || value.length < 32) {
    return false
  }
  try {
    // Reject characters outside base64 alphabet
    if (!/^[A-Za-z0-9+/=]+$/.test(value)) {
      return false
    }
    Buffer.from(value, 'base64').toString('base64')
    return true
  } catch {
    return false
  }
}

/**
 * Safe decode URI component (doesn't throw on invalid input)
 */
function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Validate OAuth request parameters
 */
export interface ValidateOAuthParamsResult {
  valid: boolean
  clientPublicKey?: string
  redirectUrl?: string
  state?: string
  callbackOrigin?: string
  error?: {
    title: string
    description: string
    value: string
  }
}

export interface OAuthRequestParams {
  redirectUrl?: string
  state?: string
  clientPublicKey?: string
  callbackOrigin?: string
  currentHost?: string
  currentPageUrl: string
}

export function validateOAuthParams(params: OAuthRequestParams): ValidateOAuthParamsResult {
  const { redirectUrl: encodedRedirectUrl, state, clientPublicKey: rawClientPublicKey, callbackOrigin, currentHost, currentPageUrl } = params

  // Validate client public key
  const clientPublicKey = normalizeClientPublicKey(rawClientPublicKey)
  if (!clientPublicKey || !isValidBase64Key(clientPublicKey)) {
    return {
      valid: false,
      error: {
        title: 'Missing Client Public Key',
        description: 'OAuth requests must include a valid client public key so we can encrypt the token. Make sure you append the clientPublicKey query parameter.',
        value: rawClientPublicKey || 'Not provided',
      },
    }
  }

  // Normalize redirect URL
  let redirectUrl = currentPageUrl
  if (encodedRedirectUrl) {
    try {
      redirectUrl = decodeURIComponent(encodedRedirectUrl)
    } catch {
      redirectUrl = encodedRedirectUrl
    }
  }
  if (!redirectUrl) {
    redirectUrl = currentPageUrl
  }

  // Extract hostname from currentPageUrl if currentHost is not provided
  let hostForValidation = currentHost
  if (!hostForValidation && currentPageUrl && !currentPageUrl.startsWith('/')) {
    try {
      const currentPageUrlObj = new URL(currentPageUrl)
      hostForValidation = currentPageUrlObj.host
    } catch {
      // If parsing fails, use currentHost as is (undefined)
    }
  }

  // Validate redirect URL
  if (!isAllowedRedirectUrl(redirectUrl, hostForValidation)) {
    return {
      valid: false,
      error: {
        title: 'Invalid Redirect URL',
        description: 'The redirect URL is not in the allowed list. Please contact your administrator.',
        value: redirectUrl,
      },
    }
  }

  return {
    valid: true,
    clientPublicKey,
    redirectUrl,
    state,
    callbackOrigin,
  }
}
