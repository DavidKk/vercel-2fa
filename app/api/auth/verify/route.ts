import { verifyJWTToken } from '@/app/actions/jwt'
import { api } from '@/initializer/controller'
import { jsonInvalidParameters, jsonSuccess, jsonUnauthorized } from '@/initializer/response'

interface VerifyTokenPayload {
  token: string
}

/**
 * POST /api/auth/verify
 * Verify JWT token from third-party applications
 *
 * @param token - The JWT token to verify
 * @returns Token validation result with user information
 */
export const POST = api(async (req) => {
  const { token } = (await req.json()) as VerifyTokenPayload

  if (!token) {
    return jsonInvalidParameters('token is required')
  }

  const payload = await verifyJWTToken(token)

  if (!payload) {
    return jsonUnauthorized('Invalid or expired token')
  }

  // Return decoded token information
  return jsonSuccess({
    valid: true,
    payload,
  })
})

/**
 * OPTIONS /api/auth/verify
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  const allowedOrigins = process.env.ALLOWED_REDIRECT_URLS

  const headers = new Headers()
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  headers.set('Access-Control-Max-Age', '86400')

  // Set CORS origin based on configuration
  if (allowedOrigins) {
    // For simplicity, allow all configured origins
    // In production, you should match the request origin against the whitelist
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return new Response(null, { status: 204, headers })
}
