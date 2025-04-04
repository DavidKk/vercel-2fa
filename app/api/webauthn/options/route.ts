import { api } from '@/initializer/controller'
import { jsonInvalidParameters, jsonSuccess } from '@/initializer/response'
import { generateLoginOptions } from '@/app/actions/webauthn'

export const GET = api(async (req) => {
  const { credential: userCredentials } = await req.json()
  if (!userCredentials) {
    return jsonInvalidParameters('credential is required')
  }

  if (!(userCredentials.rpId && userCredentials.credentialID)) {
    return jsonInvalidParameters('credential is invalid')
  }

  const options = await generateLoginOptions({ rpId: userCredentials.rpId, userCredentials })
  return jsonSuccess(options)
})
