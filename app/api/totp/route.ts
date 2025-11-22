import { generateJWTToken } from '@/app/actions/jwt'
import { verfiyToken } from '@/app/actions/totp'
import { api } from '@/initializer/controller'
import { jsonInvalidParameters, jsonSuccess, jsonUnauthorized } from '@/initializer/response'

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

  // Generate JWT token with standard claims (iss, sub, authenticated)
  // generateJWTToken automatically includes iss and sub
  const authToken = await generateJWTToken({ authenticated: true })
  return jsonSuccess({ authToken })
})
