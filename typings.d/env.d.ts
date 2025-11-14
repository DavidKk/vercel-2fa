declare namespace NodeJS {
  interface ProcessEnv {
    /** time of project build */
    NEXT_PUBLIC_BUILD_TIME: string
    /** Admin Username */
    ACCESS_USERNAME: string
    /** Admin Password */
    ACCESS_PASSWORD: string
    /** TOTP Secret */
    ACCESS_TOTP_SECRET: string
    /** WebAuthn Secret */
    ACCESS_WEBAUTHN_SECRET: string
    /** JWT Secret */
    JWT_SECRET: string
    /** JWT Token Expiration Time */
    JWT_EXPIRES_IN: string
    /** Allowed Redirect URLs (comma-separated) */
    ALLOWED_REDIRECT_URLS?: string
  }
}
