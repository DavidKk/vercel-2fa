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
 */
export async function fetchServerPublicKey(apiUrl = '/api/oauth/public-key'): Promise<string> {
  const response = await fetch(apiUrl, {
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

  return body.data.key as string
}
