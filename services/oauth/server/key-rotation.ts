/**
 * OAuth Server: Key Rotation Management
 *
 * Manages ECDH key pair rotation with transition period support.
 * Stores multiple key pairs in Upstash Redis to support graceful key rotation.
 */

import { Redis } from '@upstash/redis'
import type { KeyObject } from 'crypto'
import { createPrivateKey, generateKeyPairSync } from 'crypto'

import { DEFAULT_KEY_ROTATION_TRANSITION_SECONDS, DEFAULT_KEY_ROTATION_TTL_SECONDS } from './constants'

/**
 * Initialize Redis client with custom environment variable names
 * Supports AUTH_KV_REST_API_* (primary), UPSTASH_REDIS_REST_* (fallback), and KV_REST_API_* (legacy)
 */
function getRedisClient(): Redis | null {
  const url = process.env.AUTH_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.AUTH_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    return null
  }

  return new Redis({
    url,
    token,
  })
}

const redis = getRedisClient()

const KV_PREFIX = 'oauth:server-key:'
const KEY_LIST_KEY = 'oauth:server-keys:list'

export interface ServerKeyPair {
  id: string
  privateKeyPem: string
  publicKeyBase64: string
  createdAt: number
  expiresAt: number
}

export interface KeyRotationConfig {
  enabled: boolean
  keyTtlSeconds: number // Time to live for each key pair (default: 7 days)
  transitionPeriodSeconds: number // Overlap period for key rotation (default: 1 day)
}

/**
 * Get key rotation configuration
 */
export function getKeyRotationConfig(): KeyRotationConfig {
  const enabled = process.env.ENABLE_KEY_ROTATION === '1' || process.env.ENABLE_KEY_ROTATION === 'true'
  const keyTtlSeconds = parseInt(process.env.KEY_ROTATION_TTL_SECONDS || String(DEFAULT_KEY_ROTATION_TTL_SECONDS), 10)
  const transitionPeriodSeconds = parseInt(process.env.KEY_ROTATION_TRANSITION_SECONDS || String(DEFAULT_KEY_ROTATION_TRANSITION_SECONDS), 10)

  return {
    enabled,
    keyTtlSeconds,
    transitionPeriodSeconds,
  }
}

/**
 * Check if key rotation is enabled
 */
export function isKeyRotationEnabled(): boolean {
  return getKeyRotationConfig().enabled
}

/**
 * Check if Upstash Redis is available (environment variables are set)
 * @returns true if Redis is available, false otherwise
 */
function isRedisAvailable(): boolean {
  // Support AUTH_KV_REST_API_* (primary), UPSTASH_REDIS_REST_* (fallback), and KV_REST_API_* (legacy)
  return !!(
    (process.env.AUTH_KV_REST_API_URL && process.env.AUTH_KV_REST_API_TOKEN) ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  )
}

/**
 * Generate a new ECDH key pair
 */
function generateKeyPair(): { privateKeyPem: string; publicKeyBase64: string } {
  const { privateKey, publicKey } = generateKeyPairSync('ec', {
    namedCurve: 'prime256v1', // P-256
  })

  const privateKeyPem = privateKey.export({ format: 'pem', type: 'pkcs8' }) as string
  const publicKeyDer = publicKey.export({ format: 'der', type: 'spki' })
  const publicKeyBase64 = publicKeyDer.toString('base64').replace(/\s+/g, '')

  return { privateKeyPem, publicKeyBase64 }
}

/**
 * Normalize PEM key (handle Vercel environment variable format)
 */
function normalizePemKey(key: string): string {
  if (key.includes('\\n')) {
    return key.replace(/\\n/g, '\n')
  }
  return key
}

/**
 * Get all active key pairs from KV (not expired)
 *
 * Edge case handling:
 * - During transition period, multiple key pairs may be active
 * - Old keys remain valid until their expiresAt time
 * - This ensures tokens encrypted with old public keys can still be decrypted
 * - Example: If key A expires in 1 day, new key B is created. Both A and B are active
 *   for the remaining 1 day, allowing smooth transition.
 *
 * @returns Array of active key pairs, sorted by creation time (newest first)
 */
export async function getActiveKeyPairs(): Promise<ServerKeyPair[]> {
  const config = getKeyRotationConfig()
  if (!config.enabled) {
    return []
  }

  // Check if Redis is available before attempting to use it
  if (!isRedisAvailable() || !redis) {
    // eslint-disable-next-line no-console
    console.warn(
      'Upstash Redis is not configured (missing AUTH_KV_REST_API_URL/AUTH_KV_REST_API_TOKEN, UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN, or KV_REST_API_URL/KV_REST_API_TOKEN). Key rotation will fall back to environment variables.'
    )
    return []
  }

  try {
    const keyIds = await redis.lrange<string>(KEY_LIST_KEY, 0, -1)
    if (!keyIds || keyIds.length === 0) {
      return []
    }

    const now = Date.now()
    const activeKeys: ServerKeyPair[] = []

    for (const keyId of keyIds) {
      try {
        const keyData = await redis.get<ServerKeyPair>(`${KV_PREFIX}${keyId}`)
        // Key is active if expiresAt hasn't passed yet
        // This ensures old keys remain valid during transition period
        if (keyData && keyData.expiresAt > now) {
          activeKeys.push(keyData)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to load key pair ${keyId}:`, error)
      }
    }

    // Sort by creation time (newest first)
    // Newest key is used for encryption, all active keys can be used for decryption
    return activeKeys.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to get active key pairs from Redis:', error)
    return []
  }
}

/**
 * Get the latest active key pair
 */
export async function getLatestKeyPair(): Promise<ServerKeyPair | null> {
  const activeKeys = await getActiveKeyPairs()
  return activeKeys.length > 0 ? activeKeys[0] : null
}

/**
 * Create and store a new key pair in KV
 *
 * Key expiration strategy:
 * - Key expiresAt = createdAt + keyTtlSeconds (e.g., 7 days)
 * - KV storage TTL = keyTtlSeconds + transitionPeriodSeconds (e.g., 8 days)
 * - This ensures:
 *   1. Key is valid for keyTtlSeconds (7 days)
 *   2. Key remains in KV for transitionPeriodSeconds after expiration (1 day buffer)
 *   3. During transition period, both old and new keys are active
 *   4. Old keys can decrypt tokens encrypted with old public keys
 *
 * Example timeline (default: 7 days TTL, 1 day transition):
 * - Day 0: Key A created, expiresAt = Day 7
 * - Day 6: Key A has 1 day left, Key B created (expiresAt = Day 13)
 * - Day 6-7: Both Key A and Key B are active (transition period)
 * - Day 7: Key A expires, only Key B is active
 * - Day 8: Key A removed from KV (KV TTL expires)
 */
export async function rotateKeyPair(): Promise<ServerKeyPair> {
  const config = getKeyRotationConfig()
  if (!config.enabled) {
    throw new Error('Key rotation is not enabled')
  }

  // Check if Redis is available before attempting to use it
  if (!isRedisAvailable() || !redis) {
    throw new Error(
      'Upstash Redis is not configured. Please set AUTH_KV_REST_API_URL and AUTH_KV_REST_API_TOKEN environment variables (or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN, or KV_REST_API_URL/KV_REST_API_TOKEN for backward compatibility), or disable key rotation by unsetting ENABLE_KEY_ROTATION.'
    )
  }

  const { privateKeyPem, publicKeyBase64 } = generateKeyPair()
  const now = Date.now()
  const keyId = `key-${now}`
  const expiresAt = now + config.keyTtlSeconds * 1000

  const keyPair: ServerKeyPair = {
    id: keyId,
    privateKeyPem,
    publicKeyBase64,
    createdAt: now,
    expiresAt,
  }

  try {
    // Store the key pair in Redis
    // Redis TTL = keyTtlSeconds + transitionPeriodSeconds to ensure old keys remain
    // available during transition period even after expiresAt
    await redis.set(`${KV_PREFIX}${keyId}`, keyPair, { ex: config.keyTtlSeconds + config.transitionPeriodSeconds })

    // Add to list
    await redis.lpush(KEY_LIST_KEY, keyId)

    // Clean up expired keys from list (keep only active ones)
    const activeKeys = await getActiveKeyPairs()
    const activeKeyIds = new Set(activeKeys.map((k) => k.id))
    const allKeyIds = await redis.lrange<string>(KEY_LIST_KEY, 0, -1)
    for (const id of allKeyIds) {
      if (!activeKeyIds.has(id)) {
        await redis.lrem(KEY_LIST_KEY, 0, id)
        await redis.del(`${KV_PREFIX}${id}`)
      }
    }

    return keyPair
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to rotate key pair: ${message}`)
  }
}

/**
 * Check if key rotation is needed (current key is close to expiration)
 */
async function shouldRotateKey(): Promise<boolean> {
  const config = getKeyRotationConfig()
  if (!config.enabled) {
    return false
  }

  const latestKey = await getLatestKeyPair()
  if (!latestKey) {
    return true // No keys exist, need to create one
  }

  const now = Date.now()
  const timeUntilExpiration = latestKey.expiresAt - now
  const rotationThreshold = config.transitionPeriodSeconds * 1000

  // Rotate if key expires within the transition period
  return timeUntilExpiration <= rotationThreshold
}

/**
 * Ensure key rotation (auto-rotate if needed)
 * This function is called automatically when getting public key
 */
export async function ensureKeyRotation(): Promise<ServerKeyPair | null> {
  const config = getKeyRotationConfig()
  if (!config.enabled) {
    return null
  }

  // Check if Redis is available before attempting to use it
  if (!isRedisAvailable() || !redis) {
    // Redis is not available, silently return null to allow fallback to environment variables
    // This matches the documented behavior: "If enabled but Upstash Redis is not configured,
    // the service will fall back to environment variable keys"
    return null
  }

  // Check if rotation is needed
  if (await shouldRotateKey()) {
    try {
      return await rotateKeyPair()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to auto-rotate key pair:', error)
      // Fallback to existing key if rotation fails
      return await getLatestKeyPair()
    }
  }

  // Return existing key if no rotation needed
  return await getLatestKeyPair()
}

/**
 * Initialize key rotation (create first key pair if none exists)
 * @deprecated Use ensureKeyRotation() instead, which handles both initialization and auto-rotation
 */
export async function initializeKeyRotation(): Promise<ServerKeyPair | null> {
  return ensureKeyRotation()
}

/**
 * Load server private key from KV (latest active key)
 */
export async function loadServerPrivateKeyFromKV(): Promise<KeyObject | null> {
  const keyPair = await getLatestKeyPair()
  if (!keyPair) {
    return null
  }

  try {
    const normalizedKey = normalizePemKey(keyPair.privateKeyPem)
    return createPrivateKey(normalizedKey)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to load server private key from KV: ${message}`)
  }
}

/**
 * Get server public key from KV (latest active key)
 */
export async function getServerPublicKeyFromKV(): Promise<string | null> {
  const keyPair = await getLatestKeyPair()
  return keyPair ? keyPair.publicKeyBase64 : null
}

/**
 * Try to decrypt with all active key pairs (for transition period)
 * Returns the first successful decryption result
 */
export async function tryDecryptWithAllKeys<T>(decryptFn: (privateKey: KeyObject) => T | Promise<T>): Promise<T | null> {
  const activeKeys = await getActiveKeyPairs()
  if (activeKeys.length === 0) {
    return null
  }

  // Try keys in order (newest first)
  for (const keyPair of activeKeys) {
    try {
      const normalizedKey = normalizePemKey(keyPair.privateKeyPem)
      const privateKey = createPrivateKey(normalizedKey)
      const result = await decryptFn(privateKey)
      return result
    } catch (error) {
      // Try next key
      continue
    }
  }

  return null
}
