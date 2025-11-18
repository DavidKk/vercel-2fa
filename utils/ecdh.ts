/**
 * ECDH (Elliptic Curve Diffie-Hellman) utility functions for server-side
 * Used for secure key exchange and encryption/decryption
 */

import type { KeyObject } from 'crypto'
import { createCipheriv, createDecipheriv, createPublicKey, diffieHellman, randomBytes } from 'crypto'

/**
 * Derive shared key using ECDH
 * @param serverPrivateKey - Server's private key (KeyObject)
 * @param clientPublicKeyBase64 - Client's public key (SPKI format, base64 encoded)
 * @returns Shared key as Buffer
 */
export function deriveSharedKey(serverPrivateKey: KeyObject, clientPublicKeyBase64: string): Buffer {
  const clientPublicKey = createPublicKey({
    key: Buffer.from(clientPublicKeyBase64, 'base64'),
    format: 'der',
    type: 'spki',
  })

  return diffieHellman({
    privateKey: serverPrivateKey,
    publicKey: clientPublicKey,
  })
}

/**
 * Encrypt data using AES-256-GCM with shared key
 * @param data - Data to encrypt (string or Buffer)
 * @param sharedKey - Shared key from ECDH
 * @returns Encrypted data as base64 string (format: iv:tag:ciphertext)
 */
export function encryptWithSharedKey(data: string | Buffer, sharedKey: Buffer): string {
  const algorithm = 'aes-256-gcm'
  const iv = randomBytes(12) // 96-bit IV for GCM
  const key = sharedKey.slice(0, 32) // Use first 32 bytes for AES-256

  const cipher = createCipheriv(algorithm, key, iv)

  const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data
  let encrypted = cipher.update(dataBuffer)
  encrypted = Buffer.concat([encrypted, cipher.final()])

  const authTag = cipher.getAuthTag()

  // Combine iv:authTag:encrypted
  const result = Buffer.concat([iv, authTag, encrypted])
  return result.toString('base64')
}

/**
 * Decrypt data using AES-256-GCM with shared key
 * @param encryptedData - Encrypted data (base64 string, format: iv:tag:ciphertext)
 * @param sharedKey - Shared key from ECDH
 * @returns Decrypted data as string
 */
export function decryptWithSharedKey(encryptedData: string, sharedKey: Buffer): string {
  const algorithm = 'aes-256-gcm'
  const dataBuffer = Buffer.from(encryptedData, 'base64')

  // Extract components: iv (12 bytes) + authTag (16 bytes) + ciphertext
  const iv = dataBuffer.slice(0, 12)
  const authTag = dataBuffer.slice(12, 28)
  const ciphertext = dataBuffer.slice(28)
  const key = sharedKey.slice(0, 32) // Use first 32 bytes for AES-256

  const decipher = createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext)
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString('utf8')
}

/**
 * Encrypt payload for a peer by deriving shared key with provided private key and peer public key
 */
export function encryptPayloadForPeer(args: { payload: string | Buffer; privateKey: KeyObject; peerPublicKeyBase64: string }): string {
  const { payload, privateKey, peerPublicKeyBase64 } = args
  const sharedKey = deriveSharedKey(privateKey, peerPublicKeyBase64)
  return encryptWithSharedKey(payload, sharedKey)
}

/**
 * Decrypt payload from a peer by deriving shared key with provided private key and peer public key
 */
export function decryptPayloadFromPeer(args: { encryptedData: string; privateKey: KeyObject; peerPublicKeyBase64: string }): string {
  const { encryptedData, privateKey, peerPublicKeyBase64 } = args
  const sharedKey = deriveSharedKey(privateKey, peerPublicKeyBase64)
  return decryptWithSharedKey(encryptedData, sharedKey)
}
