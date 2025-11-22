import jwt from 'jsonwebtoken'

import { generateUserSubForConfiguredUser } from '@/utils/user-sub'

/**
 * Get issuer (iss) for JWT tokens
 * Priority: explicit issuer > OAUTH_ISSUER env var > constructed from Vercel URL > default
 * @param explicitIssuer - Optional explicit issuer to use (highest priority)
 * @returns Issuer identifier string
 */
export function getIssuer(explicitIssuer?: string): string {
  // 1. Highest priority: explicit issuer parameter
  if (explicitIssuer) {
    return explicitIssuer
  }

  // 2. Environment variable configuration
  const configuredIssuer = process.env.OAUTH_ISSUER
  if (configuredIssuer) {
    return configuredIssuer
  }

  // 3. Construct from Vercel URL (if available)
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL
  if (vercelUrl) {
    // Vercel URL format: project-name.vercel.app
    return `https://${vercelUrl}`
  }

  // 4. Last resort: use a default (should be overridden in production via OAUTH_ISSUER)
  return 'https://vercel-2fa.local'
}

/**
 * Build standard JWT claims with iss, sub, and other required fields
 * Note: iat and exp are automatically added by jwt.sign()
 * @param additionalClaims - Additional claims to merge with standard claims
 * @param explicitIssuer - Optional explicit issuer to use
 * @returns Standard JWT claims object
 */
export function buildStandardClaims(additionalClaims: Record<string, unknown> = {}, explicitIssuer?: string): Record<string, unknown> {
  const userSub = generateUserSubForConfiguredUser()
  return {
    iss: getIssuer(explicitIssuer), // Issuer identifier (OIDC standard)
    sub: userSub, // Subject identifier (OIDC standard)
    ...additionalClaims,
  }
}

/**
 * Generate JWT token with standard claims (iss, sub) automatically included
 * @param payload - Additional payload to merge with standard claims
 * @param options - JWT sign options
 * @param explicitIssuer - Optional explicit issuer to use
 * @returns JWT token string
 */
export function generateTokenWithStandardClaims(payload: Record<string, unknown>, options?: jwt.SignOptions | undefined, explicitIssuer?: string): string {
  const standardClaims = buildStandardClaims(payload, explicitIssuer)
  return generateToken(standardClaims, options)
}

export function generateToken(payload: object, options?: jwt.SignOptions | undefined) {
  const { JWT_SECRET, JWT_EXPIRES_IN } = getJWTConfig()
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, ...options })
}

export function verifyToken(token: string, options?: jwt.VerifyOptions | undefined) {
  try {
    const { JWT_SECRET } = getJWTConfig()
    // Ensure we don't accept tokens without proper validation
    // The caller should specify additional options like issuer, audience if needed
    return jwt.verify(token, JWT_SECRET, {
      ...options,
      // Reject tokens without expiration if not explicitly allowed
      ignoreExpiration: options?.ignoreExpiration ?? false,
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error verifying token:', err)
    return null
  }
}

function getJWTConfig() {
  const JWT_SECRET = process.env.JWT_SECRET
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d'

  if (!JWT_SECRET) {
    throw new Error('process.env.JWT_SECRET is not defined')
  }

  return {
    JWT_SECRET,
    JWT_EXPIRES_IN,
  }
}
