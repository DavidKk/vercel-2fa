'use server'

import type { SignOptions, VerifyOptions } from '@/services/jwt'
import { generateTokenWithStandardClaims, verifyToken } from '@/services/jwt'

/**
 * Generate JWT token with standard claims (iss, sub) automatically included
 * Server Action wrapper for generateTokenWithStandardClaims
 * @param payload - Additional JWT claims
 * @param options - Sign options (expiration, issuer, audience)
 * @returns Signed JWT string
 */
export async function generateJWTToken(payload: Record<string, unknown>, options?: SignOptions) {
  return generateTokenWithStandardClaims(payload, options)
}

/**
 * Generate JWT token with user sub (subject) identifier
 * This is the preferred method for OAuth/OIDC flows
 * Automatically includes iss and sub in the token
 * @param payload - Must include authenticated flag
 * @param options - Sign options
 * @returns Signed JWT string
 */
export async function generateJWTTokenWithSub(payload: { authenticated: boolean }, options?: SignOptions) {
  return generateTokenWithStandardClaims(payload as Record<string, unknown>, options)
}

/**
 * Verify JWT using server secret
 * @param token - JWT string
 * @param options - Verify options (issuer, audience)
 * @returns Verified payload or null
 */
export async function verifyJWTToken(token: string, options?: VerifyOptions) {
  return verifyToken(token, options)
}
