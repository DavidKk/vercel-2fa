/**
 * User Subject (sub) Generation Utility
 * Generates a unique, non-reversible user identifier based on username + salt
 * Following OIDC standard: uses 'sub' (subject) claim as user identifier
 */

import { createHmac } from 'crypto'

/**
 * Generate user subject (sub) identifier from username using HMAC-SHA256
 * This ensures:
 * - Uniqueness: username is unique, so sub will be unique
 * - Non-reversibility: Cannot derive username from sub
 * - Verifiability: Server can regenerate and compare
 *
 * @param username - The username to generate sub from
 * @param salt - Secret salt for HMAC (should be stored in environment variable)
 * @returns Base64-encoded sub identifier (URL-safe, without padding)
 */
export function generateUserSub(username: string, salt: string): string {
  if (!username) {
    throw new Error('Username is required to generate user sub')
  }
  if (!salt) {
    throw new Error('Salt is required to generate user sub')
  }

  // Use HMAC-SHA256 for better security (requires salt to verify)
  // Alternative: SHA256(username + salt) - simpler but less secure
  const hmac = createHmac('sha256', salt)
  hmac.update(username)
  const hash = hmac.digest()

  // Return base64url-encoded (URL-safe, no padding) for use in JWT
  return hash.toString('base64url')
}

/**
 * Verify if a given sub matches the expected username
 * @param sub - The sub identifier to verify
 * @param username - The expected username
 * @param salt - The salt used for generation
 * @returns true if sub matches username, false otherwise
 */
export function verifyUserSub(sub: string, username: string, salt: string): boolean {
  if (!sub || !username || !salt) {
    return false
  }

  const expectedSub = generateUserSub(username, salt)
  return sub === expectedSub
}

/**
 * Get user sub salt from environment variable
 * Falls back to using part of JWT_SECRET if USER_SUB_SALT is not set
 * @returns Salt string for sub generation
 */
export function getUserSubSalt(): string {
  // Prefer dedicated salt for user sub generation
  const userSubSalt = process.env.USER_SUB_SALT

  if (userSubSalt) {
    return userSubSalt
  }

  // Fallback: use JWT_SECRET as salt (less ideal but works)
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('Either USER_SUB_SALT or JWT_SECRET must be set')
  }

  // Use first 32 characters of JWT_SECRET as salt
  // This ensures consistency while not exposing full JWT_SECRET
  return jwtSecret.substring(0, Math.min(32, jwtSecret.length))
}

/**
 * Generate user sub for the configured ACCESS_USERNAME
 * This is the main function used in token generation
 * @returns User sub identifier
 */
export function generateUserSubForConfiguredUser(): string {
  const username = process.env.ACCESS_USERNAME
  if (!username) {
    throw new Error('ACCESS_USERNAME is not configured')
  }

  const salt = getUserSubSalt()
  return generateUserSub(username, salt)
}

/**
 * Verify if a sub matches the configured ACCESS_USERNAME
 * Used in token verification
 * @param sub - The sub identifier to verify
 * @returns true if sub matches configured user, false otherwise
 */
export function verifyUserSubForConfiguredUser(sub: string): boolean {
  const username = process.env.ACCESS_USERNAME
  if (!username) {
    return false
  }

  const salt = getUserSubSalt()
  return verifyUserSub(sub, username, salt)
}
