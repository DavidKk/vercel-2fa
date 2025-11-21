/**
 * OAuth Client: Public Key Management
 * Fetches server public key for ECDH key exchange
 */

export interface PublicKeyResponse {
  key: string
  format: 'spki-base64'
  algorithm: 'ECDH-P256'
}

/**
 * Fetch server public key from /api/oauth/public-key
 * Uses no-store cache policy to ensure we always get the latest public key
 * (important when server public key is rotated)
 */
export async function fetchServerPublicKey(apiUrl = '/api/oauth/public-key'): Promise<string> {
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // Always fetch fresh public key to prevent stale key issues
  })

  const body = await response.json()

  if (!response.ok || !body || typeof body !== 'object') {
    throw new Error('Failed to load server public key.')
  }

  if (body.code !== 0 || !body.data?.key) {
    throw new Error(body.message || 'Server public key is not available.')
  }

  return body.data.key as string
}
