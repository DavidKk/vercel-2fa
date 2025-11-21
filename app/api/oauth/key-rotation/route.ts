'use server'

import { NextResponse } from 'next/server'

import { api, plainText } from '@/initializer/controller'
import { jsonInvalidParameters, jsonSuccess } from '@/initializer/response'
import { assertHttpsRequired, assertOriginAllowed, buildCorsHeaders, getCurrentOrigin } from '@/services/auth/whitelist'
import { getActiveKeyPairs, getKeyRotationConfig } from '@/services/oauth/server/key-rotation'

/**
 * GET /api/oauth/key-rotation
 * Get current key rotation status and active key pairs
 * This is an optional management endpoint for monitoring key rotation status
 */
export const GET = api(async (req) => {
  const origin = req.headers.get('origin')
  const currentOrigin = getCurrentOrigin(req)
  const corsHeaders = buildCorsHeaders(origin, { methods: ['GET', 'OPTIONS'], currentOrigin })

  if (!assertOriginAllowed(origin, currentOrigin)) {
    return jsonInvalidParameters('origin is not allowed', { headers: corsHeaders })
  }

  if (!assertHttpsRequired(req, origin)) {
    return jsonInvalidParameters('HTTPS is required. Please use HTTPS to access this endpoint.', { headers: corsHeaders })
  }

  const config = getKeyRotationConfig()
  const activeKeys = await getActiveKeyPairs()

  return jsonSuccess(
    {
      enabled: config.enabled,
      keyTtlSeconds: config.keyTtlSeconds,
      transitionPeriodSeconds: config.transitionPeriodSeconds,
      activeKeyCount: activeKeys.length,
      activeKeys: activeKeys.map((key) => ({
        id: key.id,
        createdAt: new Date(key.createdAt).toISOString(),
        expiresAt: new Date(key.expiresAt).toISOString(),
        timeUntilExpiration: Math.max(0, key.expiresAt - Date.now()),
        publicKeyBase64: key.publicKeyBase64.substring(0, 20) + '...', // Truncated for security
      })),
      note: 'Key rotation is automatic. Keys are rotated when they approach expiration.',
    },
    { headers: corsHeaders }
  )
})

export const OPTIONS = plainText(async (req) => {
  const origin = req.headers.get('origin')
  const currentOrigin = getCurrentOrigin(req)
  if (!assertOriginAllowed(origin, currentOrigin)) {
    // For OPTIONS requests, return 403 if origin is not allowed
    return new NextResponse(null, { status: 403 })
  }
  const headers = buildCorsHeaders(origin, { methods: ['GET', 'OPTIONS'], currentOrigin })
  return new NextResponse(null, { status: 204, headers })
})
