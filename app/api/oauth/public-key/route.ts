'use server'

import { NextResponse } from 'next/server'

import { api, plainText } from '@/initializer/controller'
import { jsonInvalidParameters, jsonSuccess, jsonUnauthorized } from '@/initializer/response'
import { assertOriginAllowed, buildCorsHeaders } from '@/services/whitelist'
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

  const publicKey = getServerPublicKey()
  if (!publicKey) {
    return jsonInvalidParameters('Server public key is not available', { headers: corsHeaders })
  }

  const response: PublicKeyResponse = {
    key: publicKey,
    format: 'spki-base64',
    algorithm: 'ECDH-P256',
  }

  return jsonSuccess(response, { headers: corsHeaders })
})

export const OPTIONS = plainText(async (req) => {
  const origin = req.headers.get('origin')
  assertOriginAllowed(origin)
  const headers = buildCorsHeaders(origin, { methods: ['GET', 'OPTIONS'] })
  return new NextResponse(null, { status: 204, headers })
})
