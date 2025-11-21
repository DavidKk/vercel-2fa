/**
 * OAuth Client: Token Verification
 * Handles verification of decrypted JWT tokens via /api/auth/verify
 */

export interface VerifyTokenResult {
  access_token: string
  token_type: string
  expires_in: number
  user: {
    username?: string
    authenticated?: boolean
  }
  claims?: Record<string, unknown>
}

/**
 * Verify token via /api/auth/verify endpoint
 */
export async function verifyOAuthToken(token: string, options?: { audience?: string; scope?: string }): Promise<VerifyTokenResult> {
  const verifyUrl = '/api/auth/verify'
  const response = await fetch(verifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      audience: options?.audience,
      scope: options?.scope,
    }),
  })

  const body = await response.json()

  if (!response.ok || !body || typeof body !== 'object') {
    const errorMessage = body?.message || `HTTP ${response.status}: ${response.statusText}`
    throw new Error(`Token verification failed: ${errorMessage}`)
  }

  if (body.code !== 0 || !body.data) {
    throw new Error(body.message || 'Token verification failed')
  }

  return body.data as VerifyTokenResult
}
