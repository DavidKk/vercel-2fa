/**
 * Server-side ECDH key pair management
 * Loads server's ECDH key pair from environment variables or KV (if key rotation is enabled)
 */

import type { KeyObject } from 'crypto'
import { createPrivateKey, createPublicKey } from 'crypto'

import { getServerPublicKeyFromKV, isKeyRotationEnabled, loadServerPrivateKeyFromKV } from '@/services/oauth/server/key-rotation'

/**
 * Load server's ECDH private key from environment variable or KV
 * @returns Server's private key as KeyObject
 */
export async function loadServerPrivateKey(): Promise<KeyObject> {
  // If key rotation is enabled, try to load from KV first
  if (isKeyRotationEnabled()) {
    const keyFromKV = await loadServerPrivateKeyFromKV()
    if (keyFromKV) {
      return keyFromKV
    }
    // Fallback to environment variable if KV is not available
  }

  // Fallback to environment variable
  const privateKeyPem = process.env.ECDH_SERVER_PRIVATE_KEY
  if (!privateKeyPem) {
    throw new Error('ECDH_SERVER_PRIVATE_KEY environment variable is not set')
  }

  try {
    // Normalize key: convert literal \n strings in Vercel environment variables to actual newlines
    // Also ensure PEM format is correct
    let normalizedKey = privateKeyPem

    // If contains literal \n string, replace with actual newline
    if (normalizedKey.includes('\\n')) {
      normalizedKey = normalizedKey.replace(/\\n/g, '\n')
    }

    // Validate PEM format
    if (!normalizedKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid PEM format: missing BEGIN header')
    }
    if (!normalizedKey.includes('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid PEM format: missing END footer')
    }

    return createPrivateKey(normalizedKey)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to load server private key: ${errorMessage}`)
  }
}

/**
 * Get server's ECDH public key (base64 SPKI format)
 * @returns Server's public key as base64 string (SPKI format)
 */
export async function getServerPublicKey(): Promise<string> {
  // If key rotation is enabled, try to load from KV first
  if (isKeyRotationEnabled()) {
    const publicKeyFromKV = await getServerPublicKeyFromKV()
    if (publicKeyFromKV) {
      return publicKeyFromKV
    }
    // Fallback to environment variable if KV is not available
  }

  // Fallback to environment variable
  const publicKeyPem = process.env.ECDH_SERVER_PUBLIC_KEY
  if (!publicKeyPem) {
    throw new Error('ECDH_SERVER_PUBLIC_KEY environment variable is not set')
  }

  try {
    // Normalize key: convert literal \n strings in Vercel environment variables to actual newlines
    let normalizedKey = publicKeyPem

    // If contains literal \n string, replace with actual newline
    if (normalizedKey.includes('\\n')) {
      normalizedKey = normalizedKey.replace(/\\n/g, '\n')
    }

    // Validate PEM format
    if (!normalizedKey.includes('-----BEGIN PUBLIC KEY-----') && !normalizedKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid PEM format: missing BEGIN header')
    }
    if (!normalizedKey.includes('-----END PUBLIC KEY-----') && !normalizedKey.includes('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid PEM format: missing END footer')
    }

    const publicKey = createPublicKey(normalizedKey)
    // Export as SPKI format (base64)
    // Ensure no whitespace in base64 output
    const publicKeyDer = publicKey.export({ format: 'der', type: 'spki' })
    return publicKeyDer.toString('base64').replace(/\s+/g, '')
  } catch (error) {
    throw new Error(`Failed to export server public key: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
