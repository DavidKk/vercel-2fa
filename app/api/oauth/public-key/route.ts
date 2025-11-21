'use server'

import { NextResponse } from 'next/server'

import { api, plainText } from '@/initializer/controller'
import { jsonInvalidParameters, jsonSuccess } from '@/initializer/response'
import { assertHttpsRequired, assertOriginAllowed, buildCorsHeaders } from '@/services/auth/whitelist'
import { getServerPublicKey } from '@/utils/ecdh-server-keys'

interface PublicKeyResponse {
  key: string
  format: 'spki-base64'
  algorithm: 'ECDH-P256'
}

export const GET = api(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = buildCorsHeaders(origin, { methods: ['GET', 'OPTIONS'] })

  assertOriginAllowed(origin)
  assertHttpsRequired(req, origin)

  const publicKey = getServerPublicKey()
  if (!publicKey) {
    return jsonInvalidParameters('Server public key is not available', { headers: corsHeaders })
  }

  const response: PublicKeyResponse = {
    key: publicKey,
    format: 'spki-base64',
    algorithm: 'ECDH-P256',
  }

  // Set cache control headers to prevent stale public key caching
  // Use no-cache to ensure clients always validate with server, but allow conditional requests
  // This prevents issues when server public key is rotated
  corsHeaders.set('Cache-Control', 'no-cache, must-revalidate')
  corsHeaders.set('Pragma', 'no-cache')

  return jsonSuccess(response, { headers: corsHeaders })
})

export const OPTIONS = plainText(async (req) => {
  const origin = req.headers.get('origin')
  assertOriginAllowed(origin)
  const headers = buildCorsHeaders(origin, { methods: ['GET', 'OPTIONS'] })
  return new NextResponse(null, { status: 204, headers })
})
