'use server'

import type { AuthenticationResponseJSON } from '@simplewebauthn/server'

import { stringToCredentials } from '@/services/webauthn'

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
