import { NextResponse } from 'next/server'

import { api, plainText } from '@/initializer/controller'
import { jsonInvalidParameters, jsonSuccess, jsonUnauthorized } from '@/initializer/response'
import { assertHttpsRequired, assertOriginAllowed, buildCorsHeaders, getCurrentOrigin } from '@/services/auth/whitelist'
import { verifyTokenAndGenerateAccessToken } from '@/services/oauth/server/token-verify'

interface VerifyTokenPayload {
  token: string
  audience?: string
  scope?: string
}

export const OPTIONS = plainText(async (req) => {
  const origin = req.headers.get('origin')
  const currentOrigin = getCurrentOrigin(req)
  if (!assertOriginAllowed(origin, currentOrigin)) {
    // For OPTIONS requests, return 403 if origin is not allowed
    return new NextResponse(null, { status: 403 })
  }
  const headers = buildCorsHeaders(origin, { methods: ['POST', 'OPTIONS'], allowCredentials: true, currentOrigin })
  return new NextResponse(null, { status: 204, headers })
})

/**
 * POST /api/auth/verify
 * Verify JWT token from third-party applications and return OAuth-like response
 */
export const POST = api(async (req) => {
  const { token, audience, scope } = (await req.json()) as VerifyTokenPayload
  const origin = req.headers.get('origin')
  const currentOrigin = getCurrentOrigin(req)
  const corsHeaders = buildCorsHeaders(origin, { methods: ['POST', 'OPTIONS'], allowCredentials: true, currentOrigin })

  if (!assertOriginAllowed(origin, currentOrigin)) {
    return jsonInvalidParameters('origin is not allowed', { headers: corsHeaders })
  }

  if (!assertHttpsRequired(req, origin)) {
    return jsonInvalidParameters('HTTPS is required. Please use HTTPS to access this endpoint.', { headers: corsHeaders })
  }

  if (!token) {
    return jsonInvalidParameters('token is required', { headers: corsHeaders })
  }

  try {
    const response = await verifyTokenAndGenerateAccessToken(token, { audience, scope })
    return jsonSuccess(response, { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token verification failed'

    // Map specific error messages to appropriate HTTP status codes
    if (message.includes('required') || message.includes('missing')) {
      return jsonInvalidParameters(message, { headers: corsHeaders })
    }

    // All other errors (invalid token, expired, already used, etc.) are unauthorized
    return jsonUnauthorized(message, { headers: corsHeaders })
  }
})
