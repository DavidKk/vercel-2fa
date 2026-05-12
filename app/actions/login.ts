'use server'

import type { AuthenticationResponseJSON } from '@simplewebauthn/server'

import { generateJWTToken } from '@/app/actions/jwt'
import { getLoginSessionExpiresIn } from '@/services/jwt'
import { stringToCredentials } from '@/services/webauthn'
import { deriveSharedKey, encryptWithSharedKey } from '@/utils/ecdh'
import { loadServerPrivateKey } from '@/utils/ecdh-server-keys'

import { verfiyToken } from './totp'
import { generateLoginOptions, verifyLogin } from './webauthn'

interface LoginPayload {
  username: string
  password: string
}

export async function vierfyForm(payload: LoginPayload) {
  const ACCESS_USERNAME = process.env.ACCESS_USERNAME
  const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD

  if (!ACCESS_USERNAME || !ACCESS_PASSWORD) {
    throw new Error('Invalid server configuration')
  }

  const { username, password } = payload
  if (!username) {
    throw new Error('Username is required')
  }

  if (!password) {
    throw new Error('Password is required')
  }

  if (username !== ACCESS_USERNAME || password !== ACCESS_PASSWORD) {
    throw new Error('Unauthorized')
  }
}

interface VerfiyTOTPTokenPayload extends LoginPayload {
  token: string
}

export async function verfiyTOTPToken(payload: VerfiyTOTPTokenPayload) {
  const { token } = payload
  if (!token) {
    throw new Error('Token is required')
  }

  await vierfyForm(payload)
  return verfiyToken({ token })
}

/**
 * Builds WebAuthn authentication options for the passkey stored in ACCESS_WEBAUTHN_SECRET (no username or password).
 * @returns Options JSON for `startAuthentication`
 */
export async function getLoginWithWebauthnOptions() {
  const ACCESS_WEBAUTHN_SECRET = process.env.ACCESS_WEBAUTHN_SECRET
  if (!ACCESS_WEBAUTHN_SECRET) {
    throw new Error('Invalid server configuration')
  }

  const userCredentials = stringToCredentials(ACCESS_WEBAUTHN_SECRET)
  if (!userCredentials) {
    throw new Error('Invalid server configuration')
  }

  return generateLoginOptions({ rpId: userCredentials.rpId, userCredentials })
}

interface VerifyWebauthnPayload {
  credentials: AuthenticationResponseJSON
  challenge: string
  expectedOrigin: string
  expectedRPID: string
}

/**
 * Verifies a WebAuthn authentication response for the configured passkey (no password or TOTP step).
 * @param payload WebAuthn response, challenge, and RP context
 * @returns True when verification succeeds
 */
export async function verifyWebauthn(payload: VerifyWebauthnPayload) {
  const { credentials, challenge, expectedOrigin, expectedRPID } = payload
  const ACCESS_WEBAUTHN_SECRET = process.env.ACCESS_WEBAUTHN_SECRET
  if (!ACCESS_WEBAUTHN_SECRET) {
    throw new Error('Invalid server configuration')
  }

  const userCredentials = stringToCredentials(ACCESS_WEBAUTHN_SECRET)
  if (!userCredentials) {
    throw new Error('Invalid server configuration')
  }

  if (!credentials || !challenge || !expectedOrigin || !expectedRPID) {
    throw new Error('Invalid request')
  }

  return verifyLogin({ credentials, userCredentials, challenge, expectedOrigin, expectedRPID })
}

async function encryptLoginSessionForECDH(clientPublicKey: string, rememberMe: boolean): Promise<string> {
  const jwtToken = await generateJWTToken({ authenticated: true }, { expiresIn: getLoginSessionExpiresIn(rememberMe) })
  const payloadJson = JSON.stringify({
    token: jwtToken,
    issuedAt: Date.now(),
  })

  const serverPrivateKey = await loadServerPrivateKey()
  const sharedKey = deriveSharedKey(serverPrivateKey, clientPublicKey)

  return encryptWithSharedKey(payloadJson, sharedKey)
}

interface LoginWithECDHViaWebAuthnPayload extends VerifyWebauthnPayload {
  clientPublicKey: string
  rememberMe: boolean
}

/**
 * Completes ECDH token delivery after a successful WebAuthn assertion (no password or TOTP).
 * @param payload Passkey response, RP context, client ECDH public key, and remember-me for JWT lifetime
 * @returns Encrypted token payload for the client
 */
export async function loginWithECDHViaWebAuthn(payload: LoginWithECDHViaWebAuthnPayload) {
  const { clientPublicKey, rememberMe, credentials, challenge, expectedOrigin, expectedRPID } = payload

  if (!clientPublicKey) {
    throw new Error('Client public key is required')
  }

  await verifyWebauthn({ credentials, challenge, expectedOrigin, expectedRPID })

  return encryptLoginSessionForECDH(clientPublicKey, rememberMe)
}

interface LoginWithECDHPayload extends LoginPayload {
  clientPublicKey: string // Base64 encoded client public key (SPKI format)
  /** When true, inner JWT uses JWT_EXPIRES_IN; when false, one day */
  rememberMe: boolean
}

/**
 * Login with ECDH encryption
 * @param payload Username, password, client public key (SPKI base64), and remember-me flag for inner JWT lifetime
 * @returns Encrypted payload string (not a plain JWT)
 */
export async function loginWithECDH(payload: LoginWithECDHPayload) {
  const { clientPublicKey, username, password, rememberMe } = payload

  if (!clientPublicKey) {
    throw new Error('Client public key is required')
  }

  // Verify credentials
  await vierfyForm({ username, password })

  return encryptLoginSessionForECDH(clientPublicKey, rememberMe)
}
