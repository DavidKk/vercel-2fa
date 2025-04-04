import { api } from '@/initializer/controller'
import { jsonInvalidParameters, jsonSuccess, jsonUnauthorized } from '@/initializer/response'
import { verify2fa } from '@/app/actions/totp'
import { generateToken } from '@/utils/jwt'

interface Payload {
  username: string
  password: string
  token: string
}

export const POST = api(async (req) => {
  if (!(process.env.ACCESS_USERNAME && process.env.ACCESS_PASSWORD && process.env.ACCESS_TOTP_SECRET)) {
    return jsonUnauthorized('Invalid server configuration')
  }

  const { username, password, token } = (await req.json()) as Payload
  if (!username) {
    return jsonInvalidParameters('username is required')
  }

  if (!password) {
    return jsonInvalidParameters('password is required')
  }

  if (!token) {
    return jsonInvalidParameters('token is required')
  }

  if (username !== process.env.ACCESS_USERNAME || password !== process.env.ACCESS_PASSWORD) {
    return jsonUnauthorized()
  }

  const secret = process.env.ACCESS_TOTP_SECRET
  if (!(await verify2fa({ token, secret }))) {
    return jsonUnauthorized()
  }

  const authToken = generateToken({ authenticated: true })
  return jsonSuccess({ username, authToken })
})
