/**
 * Server-side ECDH key pair management
 * Loads server's ECDH key pair from environment variables
 */

import type { KeyObject } from 'crypto'
import { createPrivateKey, createPublicKey } from 'crypto'

/**
 * Load server's ECDH private key from environment variable
 * @returns Server's private key as KeyObject
 */
export function loadServerPrivateKey(): KeyObject {
  const privateKeyPem = process.env.ECDH_SERVER_PRIVATE_KEY
  if (!privateKeyPem) {
    throw new Error('ECDH_SERVER_PRIVATE_KEY environment variable is not set')
  }

  try {
    return createPrivateKey(privateKeyPem)
  } catch (error) {
    throw new Error(`Failed to load server private key: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get server's ECDH public key (base64 SPKI format)
 * @returns Server's public key as base64 string (SPKI format)
 */
export function getServerPublicKey(): string {
  const publicKeyPem = process.env.ECDH_SERVER_PUBLIC_KEY
  if (!publicKeyPem) {
    throw new Error('ECDH_SERVER_PUBLIC_KEY environment variable is not set')
  }

  try {
    const publicKey = createPublicKey(publicKeyPem)
    // Export as SPKI format (base64)
    // Ensure no whitespace in base64 output
    const publicKeyDer = publicKey.export({ format: 'der', type: 'spki' })
    return publicKeyDer.toString('base64').replace(/\s+/g, '')
  } catch (error) {
    throw new Error(`Failed to export server public key: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
