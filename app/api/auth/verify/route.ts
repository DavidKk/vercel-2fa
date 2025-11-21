import type { JwtPayload } from 'jsonwebtoken'
import { NextResponse } from 'next/server'

import { generateJWTToken, verifyJWTToken } from '@/app/actions/jwt'
import { api, plainText } from '@/initializer/controller'
import { jsonInvalidParameters, jsonSuccess, jsonUnauthorized } from '@/initializer/response'
import { extractJti, generateJti, isReplayProtectionEnabled, isTokenUsed, markTokenAsUsed } from '@/services/token-replay-protection'
import { assertOriginAllowed, buildCorsHeaders } from '@/services/whitelist'

const ACCESS_TOKEN_TTL_SECONDS = 180 // 3 minutes - tokens are short-lived for login verification only

interface VerifyTokenPayload {
  token: string
  audience?: string
  scope?: string
}

interface VerificationResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  user: {
    username?: string
    authenticated?: boolean
  }
  claims?: JwtPayload
}

export const OPTIONS = plainText(async (req) => {
  const origin = req.headers.get('origin')
  assertOriginAllowed(origin)
  const headers = buildCorsHeaders(origin, { methods: ['POST', 'OPTIONS'], allowCredentials: true })
  return new NextResponse(null, { status: 204, headers })
})

/**
 * POST /api/auth/verify
 * Verify JWT token from third-party applications and return OAuth-like response
 */
export const POST = api(async (req) => {
  const { token, audience, scope } = (await req.json()) as VerifyTokenPayload
  const origin = req.headers.get('origin')
  const corsHeaders = buildCorsHeaders(origin, { methods: ['POST', 'OPTIONS'], allowCredentials: true })

  assertOriginAllowed(origin)

  if (!token) {
    return jsonInvalidParameters('token is required', { headers: corsHeaders })
  }

  const payload = normalizePayload((await verifyJWTToken(token)) as JwtPayload | string | null)

  if (!payload || !payload.username || !payload.authenticated) {
    return jsonUnauthorized('Invalid or expired token', { headers: corsHeaders })
  }

  // Validate username matches configured ACCESS_USERNAME
  const allowedUsername = process.env.ACCESS_USERNAME
  if (allowedUsername && payload.username !== allowedUsername) {
    return jsonUnauthorized('Token username does not match configured ACCESS_USERNAME', { headers: corsHeaders })
  }

  // Check token replay protection if enabled
  if (isReplayProtectionEnabled()) {
    const jti = extractJti(payload)
    if (jti && (await isTokenUsed(jti))) {
      return jsonUnauthorized('Token has already been used', { headers: corsHeaders })
    }
  }

  const expiresIn = getExpiresInSeconds(payload)
  const accessTokenClaims = buildAccessTokenClaims(payload, { audience, scope })

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

  const response: VerificationResponse = {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: expiresIn,
    user: {
      username: payload.username as string | undefined,
      authenticated: payload.authenticated as boolean | undefined,
    },
    claims: accessTokenClaims,
  }

  return jsonSuccess(response, { headers: corsHeaders })
})

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

function buildAccessTokenClaims(payload: JwtPayload, options?: { audience?: string; scope?: string }) {
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
