import { api } from '@/initializer/controller'
import { jsonSuccess, jsonUnauthorized } from '@/initializer/response'
import { verify2fa } from '@/actions/2fa'

export const POST = api(async (req) => {
  const { token, secret } = await req.json()
  if (!(await verify2fa({ token, secret }))) {
    return jsonUnauthorized()
  }

  return jsonSuccess()
})
