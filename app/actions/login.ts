'use server'

import type { AuthenticationResponseJSON } from '@simplewebauthn/server'

import { generateJWTToken } from '@/app/actions/jwt'
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

export async function getLoginWithWebauthnOptions(payload: LoginPayload) {
  const ACCESS_WEBAUTHN_SECRET = process.env.ACCESS_WEBAUTHN_SECRET
  if (!ACCESS_WEBAUTHN_SECRET) {
    throw new Error('Invalid server configuration')
  }

  await vierfyForm(payload)

  const userCredentials = stringToCredentials(ACCESS_WEBAUTHN_SECRET)
  if (!userCredentials) {
    throw new Error('Invalid server configuration')
  }

  return generateLoginOptions({ rpId: userCredentials.rpId, userCredentials })
}

interface VerifyWebauthnPayload extends LoginPayload {
  credentials: AuthenticationResponseJSON
  challenge: string
  expectedOrigin: string
  expectedRPID: string
}

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

  await vierfyForm(payload)

  if (!credentials || !challenge || !expectedOrigin || !expectedRPID) {
    throw new Error('Invalid request')
  }

  return verifyLogin({ credentials, userCredentials, challenge, expectedOrigin, expectedRPID })
}

interface LoginWithECDHPayload extends LoginPayload {
  clientPublicKey: string // Base64 encoded client public key (SPKI format)
}

/**
 * Login with ECDH encryption
 * Returns encrypted token instead of plain JWT
 */
export async function loginWithECDH(payload: LoginWithECDHPayload) {
  const { clientPublicKey, username, password } = payload

  if (!clientPublicKey) {
    throw new Error('Client public key is required')
  }

  // Verify credentials
  await vierfyForm({ username, password })

  // Generate signed JWT token (same as legacy flow)
  const jwtToken = await generateJWTToken({ username, authenticated: true }, { expiresIn: '5m' })
  const payloadJson = JSON.stringify({
    token: jwtToken,
    issuedAt: Date.now(),
  })

  // Derive shared key using ECDH (use latest key for encryption)
  const serverPrivateKey = await loadServerPrivateKey()
  const sharedKey = deriveSharedKey(serverPrivateKey, clientPublicKey)

  // Encrypt token with shared key
  const encryptedToken = encryptWithSharedKey(payloadJson, sharedKey)

  return encryptedToken
}
