/**
 * OAuth Server: Token Replay Protection
 *
 * Prevents token replay attacks by tracking used JWT IDs (jti) in Vercel KV.
 * This service is optional and can be enabled via environment variable or configuration options.
 */

import { kv } from '@vercel/kv'
import { randomUUID } from 'crypto'

const KV_PREFIX = 'token:'
const KV_TTL_BUFFER_SECONDS = 10 // Add 10 second buffer to token TTL (tokens expire in 3 minutes)

export interface ReplayProtectionOptions {
  enabled?: boolean
}

/**
 * Check if replay protection is enabled (from environment variable)
 * Defaults to false if not set
 */
export function isReplayProtectionEnabled(): boolean {
  const envValue = process.env.ENABLE_TOKEN_REPLAY_PROTECTION
  return envValue === '1' || envValue === 'true'
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
 * @param options - Replay protection options (enabled defaults to environment variable)
 * @returns true if token has been used, false otherwise
 */
export async function isTokenUsed(jti: string, options?: ReplayProtectionOptions): Promise<boolean> {
  // Use options.enabled if provided, otherwise use environment variable
  const enabled = options?.enabled ?? isReplayProtectionEnabled()
  if (!enabled) {
    return false // If protection is disabled, tokens are never considered "used"
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
 * @param options - Replay protection options (enabled defaults to environment variable)
 */
export async function markTokenAsUsed(jti: string, ttlSeconds: number, options?: ReplayProtectionOptions): Promise<void> {
  // Use options.enabled if provided, otherwise use environment variable
  const enabled = options?.enabled ?? isReplayProtectionEnabled()
  if (!enabled) {
    return // Skip if protection is disabled
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
