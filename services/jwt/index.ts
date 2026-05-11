import { type JWTPayload, jwtVerify, SignJWT } from 'jose'

import { generateUserSubForConfiguredUser } from '@/utils/user-sub'

export type { JWTPayload }

/**
 * Get issuer (iss) for JWT tokens
 * Priority: explicit issuer > OAUTH_ISSUER env var > constructed from Vercel URL > default
 * @param explicitIssuer - Optional explicit issuer to use (highest priority)
 * @returns Issuer identifier string
 */
export function getIssuer(explicitIssuer?: string): string {
  if (explicitIssuer) {
    return explicitIssuer
  }

  const configuredIssuer = process.env.OAUTH_ISSUER
  if (configuredIssuer) {
    return configuredIssuer
  }

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL
  if (vercelUrl) {
    return `https://${vercelUrl}`
  }

  return 'https://vercel-2fa.local'
}

/**
 * Build standard JWT claims with iss, sub, and other required fields.
 * Adds display claims after merging `additionalClaims` so client-supplied payload cannot override them:
 * `username` / `preferred_username` from `ACCESS_USERNAME`, optional `email` from `ACCESS_EMAIL`.
 * @param additionalClaims - Additional claims to merge with standard claims
 * @param explicitIssuer - Optional explicit issuer to use
 * @returns Standard JWT claims object
 */
export function buildStandardClaims(additionalClaims: Record<string, unknown> = {}, explicitIssuer?: string): Record<string, unknown> {
  const userSub = generateUserSubForConfiguredUser()
  const claims: Record<string, unknown> = {
    iss: getIssuer(explicitIssuer),
    sub: userSub,
    ...additionalClaims,
  }

  const accessUsername = process.env.ACCESS_USERNAME?.trim()
  if (accessUsername) {
    claims.username = accessUsername
    claims.preferred_username = accessUsername
  }

  const email = process.env.ACCESS_EMAIL?.trim()
  if (email) {
    claims.email = email
  }

  return claims
}

export interface SignOptions {
  expiresIn?: string | number
  issuer?: string
  audience?: string | string[]
}

export interface VerifyOptions {
  issuer?: string | string[]
  audience?: string | string[]
}

/**
 * Generate JWT token with standard claims (iss, sub) automatically included
 * @param payload - Additional payload to merge with standard claims
 * @param options - JWT sign options
 * @param explicitIssuer - Optional explicit issuer to use
 * @returns JWT token string
 */
export async function generateTokenWithStandardClaims(payload: Record<string, unknown>, options?: SignOptions, explicitIssuer?: string): Promise<string> {
  const standardClaims = buildStandardClaims(payload, explicitIssuer)
  return generateToken(standardClaims, options)
}

/**
 * Sign an HS256 JWT with configured secret and expiration.
 * @param payload - JWT body (claims)
 * @param options - Optional expiration override and issuer/audience for the JWT header/payload
 * @returns Serialized JWT
 */
export async function generateToken(payload: object, options?: SignOptions): Promise<string> {
  const { JWT_SECRET, JWT_EXPIRES_IN } = getJWTConfig()
  const secretKey = new TextEncoder().encode(JWT_SECRET)

  const jwtPayload: JWTPayload = {
    ...(payload as Record<string, unknown>),
  }

  const sign = new SignJWT(jwtPayload).setProtectedHeader({ alg: 'HS256', typ: 'JWT' })

  const expiresIn = options?.expiresIn ?? JWT_EXPIRES_IN
  if (expiresIn !== undefined && expiresIn !== '') {
    sign.setExpirationTime(expiresIn as string | number)
  }

  if (options?.issuer) {
    sign.setIssuer(options.issuer)
  }

  if (options?.audience) {
    sign.setAudience(options.audience)
  }

  return sign.sign(secretKey)
}

/**
 * Verify HS256 JWT with server secret.
 * @param token - JWT string
 * @param options - Optional issuer / audience checks
 * @returns Parsed payload or null when invalid
 */
export async function verifyToken(token: string, options?: VerifyOptions): Promise<JWTPayload | null> {
  try {
    const { JWT_SECRET } = getJWTConfig()
    const secretKey = new TextEncoder().encode(JWT_SECRET)

    const { payload } = await jwtVerify(token, secretKey, {
      issuer: options?.issuer,
      audience: options?.audience,
    })

    return payload
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
