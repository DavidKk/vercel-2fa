'use server'

import type jwt from 'jsonwebtoken'

import { generateTokenWithStandardClaims, verifyToken } from '@/services/jwt'

/**
 * Generate JWT token with standard claims (iss, sub) automatically included
 * Server Action wrapper for generateTokenWithStandardClaims
 */
export async function generateJWTToken(payload: Record<string, unknown>, options?: jwt.SignOptions | undefined) {
  return generateTokenWithStandardClaims(payload, options)
}

/**
 * Generate JWT token with user sub (subject) identifier
 * This is the preferred method for OAuth/OIDC flows
 * Automatically includes iss and sub in the token
 */
export async function generateJWTTokenWithSub(payload: { authenticated: boolean }, options?: jwt.SignOptions | undefined) {
  return generateTokenWithStandardClaims(payload, options)
}

export async function verifyJWTToken(token: string, options?: jwt.VerifyOptions | undefined) {
  return verifyToken(token, options)
}
