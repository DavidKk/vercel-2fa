/**
 * OAuth Client: Token Decryption
 * Handles decryption of ECDH-encrypted tokens
 */

import { decryptWithSharedKey, deriveSharedKey, importPrivateKey } from '@/utils/ecdh-client'

export interface DecryptTokenResult {
  token: string
  issuedAt?: number
}

/**
 * Decrypt ECDH-encrypted token
 */
export async function decryptOAuthToken(encryptedToken: string, clientPrivateKeyBase64: string, serverPublicKeyBase64: string): Promise<DecryptTokenResult> {
  if (!clientPrivateKeyBase64) {
    throw new Error('Client private key not found')
  }

  if (encryptedToken.split('.').length === 3) {
    throw new Error(
      'Received a JWT token instead of an ECDH encrypted payload. Make sure to include the client public key when launching OAuth and do not decode JWT tokens on this page.'
    )
  }

  let privateKey: CryptoKey
  try {
    privateKey = await importPrivateKey(clientPrivateKeyBase64)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to import client private key: ${message}. Make sure the private key is valid base64 PKCS#8 format.`)
  }

  let sharedKey: CryptoKey
  try {
    sharedKey = await deriveSharedKey(privateKey, serverPublicKeyBase64)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to derive shared key: ${message}. Check that client private key and server public key are from the same key exchange.`)
  }

  let decryptedJson: string
  try {
    decryptedJson = await decryptWithSharedKey(encryptedToken, sharedKey)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const tokenPreview = encryptedToken.substring(0, 50) + (encryptedToken.length > 50 ? '...' : '')
    throw new Error(
      `Failed to decrypt token: ${message}. ` +
        `Token length: ${encryptedToken.length}, ` +
        `Token preview: "${tokenPreview}". ` +
        `This usually means the client private key doesn't match the public key used during encryption, or the server public key is incorrect.`
    )
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(decryptedJson)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[OAuth Client] Failed to parse decrypted payload', { error })
    throw new Error('Decrypted payload is not valid JSON')
  }

  if (!payload || typeof payload !== 'object' || typeof payload.token !== 'string') {
    // eslint-disable-next-line no-console
    console.error('[OAuth Client] Decrypted payload does not contain token field', payload)
    throw new Error('Decrypted payload is missing the JWT token')
  }

  return {
    token: payload.token as string,
    issuedAt: typeof payload.issuedAt === 'number' ? payload.issuedAt : undefined,
  }
}
