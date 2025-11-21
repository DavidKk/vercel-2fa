/**
 * OAuth Client: Constants
 * Centralized constants for OAuth client-side functionality
 */

/**
 * PostMessage type identifier for OAuth result messages
 */
export const OAUTH_POSTMESSAGE_TYPE = 'OAUTH_RESULT' as const

/**
 * SessionStorage keys for OAuth session data
 */
export const STORAGE_KEYS = {
  STATE: 'oauth_state',
  CLIENT_PUBLIC_KEY: 'oauth_client_public_key',
  CLIENT_PRIVATE_KEY: 'oauth_client_private_key',
} as const

/**
 * Default OAuth provider URL (relative path)
 */
export const DEFAULT_PROVIDER_URL = '/oauth'

/**
 * Default OAuth flow mode
 */
export const DEFAULT_FLOW_MODE = 'popup' as const
