import { api } from '@/initializer/controller'
import { jsonSuccess, jsonUnauthorized } from '@/initializer/response'
import { generateLoginOptions, verifyLogin } from '@/app/actions/webauthn'
import { generateToken } from '@/utils/jwt'
import { startAuthentication } from '@simplewebauthn/browser'

export const POST = api(async (req) => {
  if (!(process.env.ACCESS_USERNAME && process.env.ACCESS_PASSWORD && process.env.ACCESS_WEBAUTHN_SECRET)) {
    return jsonUnauthorized('Invalid server configuration')
  }

  const { username, password, credential: userCredentials } = await req.json()
  if (!username) {
    return jsonUnauthorized('username is required')
  }

  if (!password) {
    return jsonUnauthorized('password is required')
  }

  if (!userCredentials) {
    return jsonUnauthorized('credential is required')
  }

  if (username !== process.env.ACCESS_USERNAME || password !== process.env.ACCESS_PASSWORD) {
    return jsonUnauthorized()
  }

  const options = await generateLoginOptions({ rpId: userCredentials.rpId, userCredentials })
  const credential = await startAuthentication({ optionsJSON: options })
  const challenge = options.challenge
  const expectedOrigin = window.location.origin
  const expectedRPID = userCredentials.rpId

  try {
    await verifyLogin({ userCredentials, challenge, credential, expectedOrigin, expectedRPID })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return jsonUnauthorized('WebAuthn verification failed: ' + message)
  }

  const authToken = generateToken({ authenticated: true })
  return jsonSuccess({ username, authToken })
})
