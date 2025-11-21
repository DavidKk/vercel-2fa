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
