/**
 * OAuth Server: Token Verification
 * Handles verification of OAuth callback tokens and generation of access tokens
 */

import type { JwtPayload } from 'jsonwebtoken'

import { generateJWTToken, verifyJWTToken } from '@/app/actions/jwt'
import { buildStandardClaims } from '@/services/jwt'
import { generateUserSubForConfiguredUser, verifyUserSubForConfiguredUser } from '@/utils/user-sub'

import { ACCESS_TOKEN_TTL_SECONDS } from './constants'
import { extractJti, generateJti, isReplayProtectionEnabled, isTokenUsed, markTokenAsUsed } from './replay-protection'

export interface VerifyTokenOptions {
  audience?: string
  scope?: string
  enableReplayProtection?: boolean
  issuer?: string // Optional issuer override (if not provided, uses OAUTH_ISSUER env var or default)
}

export interface VerifyTokenResult {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  user: {
    sub?: string
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

  // Support both old format (username) and new format (sub) for backward compatibility
  const hasSub = payload && typeof payload.sub === 'string'
  const hasUsername = payload && typeof payload.username === 'string'

  if (!payload || !payload.authenticated) {
    throw new Error('Invalid or expired token')
  }

  // Validate sub (preferred) or username (legacy)
  if (hasSub) {
    // New format: validate sub matches configured user
    if (!verifyUserSubForConfiguredUser(payload.sub as string)) {
      throw new Error('Token sub does not match configured user')
    }
  } else if (hasUsername) {
    // Legacy format: validate username matches configured ACCESS_USERNAME
    const allowedUsername = process.env.ACCESS_USERNAME
    if (allowedUsername && payload.username !== allowedUsername) {
      throw new Error('Token username does not match configured ACCESS_USERNAME')
    }
  } else {
    throw new Error('Token missing required user identifier (sub or username)')
  }

  // Check if replay protection is enabled (from environment variable or options)
  // If options.enableReplayProtection is provided, use it; otherwise use environment variable
  const replayProtectionEnabled = options?.enableReplayProtection ?? isReplayProtectionEnabled()
  const replayProtectionOptions = { enabled: replayProtectionEnabled }

  // Check token replay protection if enabled
  if (replayProtectionEnabled) {
    const jti = extractJti(payload)
    if (jti && (await isTokenUsed(jti, replayProtectionOptions))) {
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
  if (replayProtectionEnabled) {
    accessTokenClaims.jti = generateJti()
  }

  const accessToken = await generateJWTToken(accessTokenClaims, { expiresIn })

  // Decode the generated token to get complete claims including iat and exp
  // This ensures the returned claims object matches the actual JWT payload
  const decodedToken = (await verifyJWTToken(accessToken, { ignoreExpiration: true })) as JwtPayload | null
  const completeClaims = decodedToken || accessTokenClaims

  // Mark the original token as used (if replay protection is enabled)
  // This prevents the same OAuth callback token from being reused
  if (replayProtectionEnabled) {
    const originalJti = extractJti(payload)
    if (originalJti) {
      // Mark original token as used with its remaining TTL
      await markTokenAsUsed(originalJti, expiresIn, replayProtectionOptions)
    }
    // Note: We do NOT mark the new access token as used here because
    // the client needs to use it. The new access token's replay protection
    // should be handled by the client service if needed.
  }

  // Get sub from payload or generate it
  const userSub = (payload.sub as string | undefined) || generateUserSubForConfiguredUser()

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: expiresIn,
    user: {
      sub: userSub,
      authenticated: payload.authenticated as boolean | undefined,
    },
    claims: completeClaims, // Complete claims including iat and exp from the actual JWT
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
  const authenticated = payload.authenticated

  if (!authenticated) {
    throw new Error('token payload missing authenticated flag')
  }

  // Get sub from payload (new format) or generate from username (legacy format)
  let userSub: string
  if (payload.sub && typeof payload.sub === 'string') {
    // New format: use existing sub
    userSub = payload.sub
  } else if (payload.username && typeof payload.username === 'string') {
    // Legacy format: generate sub from username
    // This ensures backward compatibility while migrating to sub
    userSub = generateUserSubForConfiguredUser()
  } else {
    throw new Error('token payload missing user identifier (sub or username)')
  }

  // Use unified buildStandardClaims function with explicit issuer support
  const standardClaims = buildStandardClaims(
    {
      authenticated,
      provider: 'vercel-2fa',
    },
    options?.issuer // Pass explicit issuer if provided
  )

  // Override sub if we have a specific one (from payload)
  const claims: JwtPayload = {
    ...standardClaims,
    sub: userSub, // Use the sub from payload or generated one
  }

  if (audience) {
    claims.aud = audience // Audience (OAuth2/OIDC standard)
  }

  if (scope) {
    claims.scope = scope // Scope (OAuth2 standard)
  }

  return claims
}
