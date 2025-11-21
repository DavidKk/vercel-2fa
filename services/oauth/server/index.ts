/**
 * OAuth Server Service
 *
 * Provides server-side OAuth functionality:
 * - Parameter validation
 * - Token delivery (postMessage or redirect)
 * - Token verification and access token generation
 * - Token replay protection
 * - Configuration helpers
 */

// Configuration
export type { OAuthServerConfig } from './config'
export { getOAuthServerConfig, isOAuthEnabled } from './config'

// Token delivery
export type { DeliverTokenOptions } from './token-delivery'
export { deliverToken } from './token-delivery'

// Token verification
export type { VerifyTokenOptions, VerifyTokenResult } from './token-verify'
export { verifyTokenAndGenerateAccessToken } from './token-verify'

// Token replay protection
export type { ReplayProtectionOptions } from './replay-protection'
export { extractJti, generateJti, isTokenUsed, markTokenAsUsed } from './replay-protection'

// Parameter validation
export type { OAuthRequestParams, ValidateOAuthParamsResult } from './validate-params'
export { isValidBase64Key, normalizeClientPublicKey, validateOAuthParams } from './validate-params'
