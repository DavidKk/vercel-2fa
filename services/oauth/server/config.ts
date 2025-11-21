/**
 * OAuth Server: Configuration
 * Provides OAuth server configuration helpers
 */

/**
 * Get OAuth server configuration
 */
export function getOAuthServerConfig() {
  return {
    enableTotp: !!process.env.ACCESS_TOTP_SECRET,
    enableWebAuthn: !!process.env.ACCESS_WEBAUTHN_SECRET,
  }
}

/**
 * Check if OAuth is enabled (at least one 2FA method)
 */
export function isOAuthEnabled(): boolean {
  const config = getOAuthServerConfig()
  return config.enableTotp || config.enableWebAuthn
}
