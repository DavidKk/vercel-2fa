import type { AuthenticationResponseJSON } from '@simplewebauthn/server'
import { api } from '@/initializer/controller'
import { jsonSuccess, jsonUnauthorized } from '@/initializer/response'
import { verifyLogin } from '@/app/actions/webauthn'
import { generateToken } from '@/utils/jwt'
import { stringToCredentials } from '@/services/webauthn'

interface Payload {
  username: string
  password: string
  challenge: string
  credentials: AuthenticationResponseJSON
}

export const POST = api(async (req) => {
  if (!(process.env.ACCESS_USERNAME && process.env.ACCESS_PASSWORD && process.env.ACCESS_WEBAUTHN_SECRET)) {
    return jsonUnauthorized('Invalid server configuration')
  }

  const userCredentials = stringToCredentials(process.env.ACCESS_WEBAUTHN_SECRET)
  if (!userCredentials) {
    return jsonUnauthorized('Invalid server configuration')
  }

  const { username, password, challenge, credentials } = (await req.json()) as Payload
  if (!username) {
    return jsonUnauthorized('username is required')
  }

  if (!password) {
    return jsonUnauthorized('password is required')
  }

  if (!challenge) {
    return jsonUnauthorized('challenge is required')
  }

  if (username !== process.env.ACCESS_USERNAME || password !== process.env.ACCESS_PASSWORD) {
    return jsonUnauthorized()
  }

  try {
    const expectedOrigin = window.location.origin
    const expectedRPID = userCredentials.rpId
    await verifyLogin({ userCredentials, challenge, credentials, expectedOrigin, expectedRPID })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return jsonUnauthorized('WebAuthn verification failed: ' + message)
  }

  const authToken = generateToken({ authenticated: true })
  return jsonSuccess({ username, authToken })
})
