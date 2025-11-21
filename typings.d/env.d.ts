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
    /** Enable token replay protection using Vercel KV (requires @vercel/kv package) */
    ENABLE_TOKEN_REPLAY_PROTECTION?: string
    /** Server's ECDH private key for secure key exchange (PEM format) */
    ECDH_SERVER_PRIVATE_KEY?: string
    /** Server's ECDH public key for debugging (PEM format) */
    ECDH_SERVER_PUBLIC_KEY?: string
    /** Enable automatic ECDH key pair rotation (requires @vercel/kv package) */
    ENABLE_KEY_ROTATION?: string
    /** Key pair TTL in seconds for key rotation (default: 604800 = 7 days) */
    KEY_ROTATION_TTL_SECONDS?: string
    /** Transition period in seconds for key rotation (default: 86400 = 1 day) */
    KEY_ROTATION_TRANSITION_SECONDS?: string
  }
}
