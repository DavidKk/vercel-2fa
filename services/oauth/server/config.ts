/**
 * OAuth Server: Configuration
 * Provides OAuth server configuration helpers
 */

import { isReplayProtectionEnabled } from './replay-protection'

export interface OAuthServerConfig {
  enableTotp: boolean
  enableWebAuthn: boolean
  enableReplayProtection?: boolean
}

/**
 * Get OAuth server configuration
 * @param options - Optional overrides for configuration
 * @returns OAuth server configuration
 */
export function getOAuthServerConfig(options?: { enableReplayProtection?: boolean }): OAuthServerConfig {
  // Use options.enableReplayProtection if provided, otherwise use environment variable (default)
  const enableReplayProtection = options?.enableReplayProtection ?? isReplayProtectionEnabled()

  return {
    enableTotp: !!process.env.ACCESS_TOTP_SECRET,
    enableWebAuthn: !!process.env.ACCESS_WEBAUTHN_SECRET,
    enableReplayProtection,
  }
}

/**
 * Check if OAuth is enabled (at least one 2FA method)
 */
export function isOAuthEnabled(): boolean {
  const config = getOAuthServerConfig()
  return config.enableTotp || config.enableWebAuthn
}
