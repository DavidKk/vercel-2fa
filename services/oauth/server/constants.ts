/**
 * OAuth Server: Constants
 * Centralized constants for OAuth server-side functionality
 */

/**
 * Access token TTL in seconds (3 minutes)
 * Tokens are short-lived for login verification only
 */
export const ACCESS_TOKEN_TTL_SECONDS = 180

/**
 * PostMessage type identifier for OAuth result messages
 * Must match the client-side constant
 */
export const OAUTH_POSTMESSAGE_TYPE = 'OAUTH_RESULT' as const

/**
 * Key rotation: Default TTL for each key pair in seconds (7 days)
 * Each key pair is valid for this duration before expiration
 */
export const DEFAULT_KEY_ROTATION_TTL_SECONDS = 604800 // 7 days

/**
 * Key rotation: Default transition period in seconds (1 day)
 * Overlap period during which both old and new keys are active
 * This ensures smooth key rotation without breaking active sessions
 */
export const DEFAULT_KEY_ROTATION_TRANSITION_SECONDS = 86400 // 1 day
