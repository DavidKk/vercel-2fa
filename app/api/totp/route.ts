import { api } from '@/initializer/controller'
import { jsonInvalidParameters, jsonSuccess, jsonUnauthorized } from '@/initializer/response'
import { generateJWTToken } from '@/app/actions/jwt'
import { verfiyToken } from '@/app/actions/totp'

interface Payload {
  token: string
}

export const POST = api(async (req) => {
  const { token } = (await req.json()) as Payload
  if (!token) {
    return jsonInvalidParameters('token is required')
  }

  if (!(await verfiyToken({ token }))) {
    return jsonUnauthorized()
  }

  const authToken = generateJWTToken({ authenticated: true })
  return jsonSuccess({ authToken })
})
