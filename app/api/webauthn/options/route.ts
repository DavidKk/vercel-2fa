import { api } from '@/initializer/controller'
import { jsonInvalidParameters, jsonSuccess, jsonUnauthorized } from '@/initializer/response'
import { stringToCredentials } from '@/services/webauthn'
import { generateLoginOptions } from '@/app/actions/webauthn'

export const GET = api(async () => {
  if (!process.env.ACCESS_WEBAUTHN_SECRET) {
    return jsonUnauthorized('Invalid server configuration')
  }

  const userCredentials = stringToCredentials(process.env.ACCESS_WEBAUTHN_SECRET)
  if (!userCredentials) {
    return jsonInvalidParameters('credential is required')
  }

  if (!(userCredentials.rpId && userCredentials.credentialID)) {
    return jsonInvalidParameters('credential is invalid')
  }

  const options = await generateLoginOptions({ rpId: userCredentials.rpId, userCredentials })
  return jsonSuccess(options)
})
