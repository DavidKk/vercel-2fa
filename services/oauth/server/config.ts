/**
 * OAuth Server: Configuration
 * Provides OAuth server configuration helpers
 */

export interface OAuthServerConfig {
  enableTotp: boolean
  enableWebAuthn: boolean
  enableReplayProtection?: boolean
}

/**
 * Get OAuth server configuration
 */
export function getOAuthServerConfig(options?: { enableReplayProtection?: boolean }): OAuthServerConfig {
  return {
    enableTotp: !!process.env.ACCESS_TOTP_SECRET,
    enableWebAuthn: !!process.env.ACCESS_WEBAUTHN_SECRET,
    enableReplayProtection: options?.enableReplayProtection ?? false,
  }
}

/**
 * Check if OAuth is enabled (at least one 2FA method)
 */
export function isOAuthEnabled(): boolean {
  const config = getOAuthServerConfig()
  return config.enableTotp || config.enableWebAuthn
}
