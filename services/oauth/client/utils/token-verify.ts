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

  let body: any
  try {
    body = await response.json()
  } catch (error) {
    throw new Error(`Token verification failed: ${response.status} ${response.statusText}`)
  }

  // Check response status and code
  if (!response.ok || !body || typeof body !== 'object') {
    const errorMessage = body?.message || `HTTP ${response.status}: ${response.statusText}`
    throw new Error(`Token verification failed: ${errorMessage}`)
  }

  // Handle error responses based on status code and code field
  // 400 = invalid parameters (code: 1000)
  // 401 = unauthorized (code: 2000)
  if (response.status === 400 || body.code === 1000) {
    const errorMessage = body.message || 'Invalid parameters'
    throw new Error(`Token verification failed: ${errorMessage}`)
  }

  if (response.status === 401 || body.code === 2000) {
    const errorMessage = body.message || 'Unauthorized'
    throw new Error(`Token verification failed: ${errorMessage}`)
  }

  // Success response: code === 0
  if (body.code !== 0 || !body.data) {
    throw new Error(body.message || 'Token verification failed')
  }

  return body.data as VerifyTokenResult
}
