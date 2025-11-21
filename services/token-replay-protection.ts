/**
 * Token Replay Protection Service
 *
 * Prevents token replay attacks by tracking used JWT IDs (jti) in Vercel KV.
 * This service is optional and can be enabled via ENABLE_TOKEN_REPLAY_PROTECTION environment variable.
 */

import { randomUUID } from 'crypto'

const KV_PREFIX = 'token:'
const KV_TTL_BUFFER_SECONDS = 10 // Add 10 second buffer to token TTL (tokens expire in 3 minutes)

/**
 * Check if token replay protection is enabled
 */
export function isReplayProtectionEnabled(): boolean {
  return process.env.ENABLE_TOKEN_REPLAY_PROTECTION === '1' || process.env.ENABLE_TOKEN_REPLAY_PROTECTION === 'true'
}

/**
 * Get Vercel KV client (lazy import to avoid errors if KV is not configured)
 */
async function getKVClient() {
  try {
    // Dynamic import to avoid build errors if @vercel/kv is not installed
    const { kv } = await import('@vercel/kv')
    return kv
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Vercel KV not available. Token replay protection will be disabled.')
    return null
  }
}

/**
 * Generate a unique JWT ID (jti) for token replay protection
 */
export function generateJti(): string {
  return randomUUID()
}

/**
 * Check if a token JTI has already been used
 * @param jti - JWT ID to check
 * @returns true if token has been used, false otherwise
 */
export async function isTokenUsed(jti: string): Promise<boolean> {
  if (!isReplayProtectionEnabled()) {
    return false // If protection is disabled, tokens are never considered "used"
  }

  const kv = await getKVClient()
  if (!kv) {
    // If KV is not available, skip protection (fail open)
    return false
  }

  try {
    const key = `${KV_PREFIX}${jti}`
    const exists = await kv.exists(key)
    return exists === 1
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error checking token replay protection:', error)
    // Fail open: if we can't check, allow the token (better UX than blocking all requests)
    return false
  }
}

/**
 * Mark a token JTI as used
 * @param jti - JWT ID to mark as used
 * @param ttlSeconds - Time to live in seconds (should match token expiration)
 */
export async function markTokenAsUsed(jti: string, ttlSeconds: number): Promise<void> {
  if (!isReplayProtectionEnabled()) {
    return // Skip if protection is disabled
  }

  const kv = await getKVClient()
  if (!kv) {
    // If KV is not available, skip (fail open)
    return
  }

  try {
    const key = `${KV_PREFIX}${jti}`
    // Add buffer to TTL to ensure token is tracked for slightly longer than its expiration
    // Vercel KV automatically expires keys when TTL is reached (no manual cleanup needed)
    const ttlWithBuffer = ttlSeconds + KV_TTL_BUFFER_SECONDS
    await kv.set(key, '1', { ex: ttlWithBuffer })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error marking token as used:', error)
    // Fail open: don't block requests if we can't mark token
  }
}

/**
 * Extract JTI from JWT payload
 */
export function extractJti(payload: Record<string, unknown>): string | undefined {
  return payload.jti as string | undefined
}
