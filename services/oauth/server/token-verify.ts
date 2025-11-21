/**
 * OAuth Server: Token Verification
 * Handles verification of OAuth callback tokens and generation of access tokens
 */

import type { JwtPayload } from 'jsonwebtoken'

import { generateJWTToken, verifyJWTToken } from '@/app/actions/jwt'
import { extractJti, generateJti, isReplayProtectionEnabled, isTokenUsed, markTokenAsUsed } from '@/services/token-replay-protection'

import { ACCESS_TOKEN_TTL_SECONDS } from './constants'

export interface VerifyTokenOptions {
  audience?: string
  scope?: string
}

export interface VerifyTokenResult {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  user: {
    username?: string
    authenticated?: boolean
  }
  claims?: JwtPayload
}

/**
 * Verify OAuth callback token and generate new access token
 * @throws {Error} If token is invalid, expired, or already used
 */
export async function verifyTokenAndGenerateAccessToken(token: string, options?: VerifyTokenOptions): Promise<VerifyTokenResult> {
  if (!token) {
    throw new Error('token is required')
  }

  const payload = normalizePayload((await verifyJWTToken(token)) as JwtPayload | string | null)

  if (!payload || !payload.username || !payload.authenticated) {
    throw new Error('Invalid or expired token')
  }

  // Validate username matches configured ACCESS_USERNAME
  const allowedUsername = process.env.ACCESS_USERNAME
  if (allowedUsername && payload.username !== allowedUsername) {
    throw new Error('Token username does not match configured ACCESS_USERNAME')
  }

  // Check token replay protection if enabled
  if (isReplayProtectionEnabled()) {
    const jti = extractJti(payload)
    if (jti && (await isTokenUsed(jti))) {
      throw new Error('Token has already been used')
    }
  }

  const expiresIn = getExpiresInSeconds(payload)
  const accessTokenClaims = buildAccessTokenClaims(payload, options)

  // Add JTI to access token if replay protection is enabled
  // Note: The new access token's jti is NOT marked as used here because
  // the client needs to use this token for subsequent API calls.
  // The replay protection for the new access token should be handled
  // by the client service's own token validation logic.
  if (isReplayProtectionEnabled()) {
    accessTokenClaims.jti = generateJti()
  }

  const accessToken = await generateJWTToken(accessTokenClaims, { expiresIn })

  // Mark the original token as used (if replay protection is enabled)
  // This prevents the same OAuth callback token from being reused
  if (isReplayProtectionEnabled()) {
    const originalJti = extractJti(payload)
    if (originalJti) {
      // Mark original token as used with its remaining TTL
      await markTokenAsUsed(originalJti, expiresIn)
    }
    // Note: We do NOT mark the new access token as used here because
    // the client needs to use it. The new access token's replay protection
    // should be handled by the client service if needed.
  }

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: expiresIn,
    user: {
      username: payload.username as string | undefined,
      authenticated: payload.authenticated as boolean | undefined,
    },
    claims: accessTokenClaims,
  }
}

function normalizePayload(payload: JwtPayload | string | null): JwtPayload {
  if (!payload) {
    throw new Error('Invalid payload')
  }

  if (typeof payload === 'string') {
    return { token: payload }
  }

  return payload
}

function getExpiresInSeconds(payload: JwtPayload): number {
  if (typeof payload.exp === 'number') {
    const diffMs = payload.exp * 1000 - Date.now()
    return diffMs <= 0 ? 0 : Math.floor(diffMs / 1000)
  }

  return ACCESS_TOKEN_TTL_SECONDS
}

function buildAccessTokenClaims(payload: JwtPayload, options?: VerifyTokenOptions): JwtPayload {
  const { audience, scope } = options || {}
  const username = payload.username
  const authenticated = payload.authenticated

  if (!username) {
    throw new Error('token payload missing username')
  }

  if (!authenticated) {
    throw new Error('token payload missing authenticated flag')
  }

  const claims: JwtPayload = {
    sub: username,
    username,
    authenticated,
    provider: 'vercel-2fa',
  }

  if (audience) {
    claims.aud = audience
  }

  if (scope) {
    claims.scope = scope
  }

  return claims
}
