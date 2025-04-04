import { useRequest } from 'ahooks'
import { useCallback, useRef, useState, useMemo } from 'react'
import { startAuthentication } from '@simplewebauthn/browser'
import { Spinner } from '@/components/Spinner'
import type { AlertImperativeHandler } from '@/components/Alert'
import Alert from '@/components/Alert'
import { credentialsToString, stringToCredentials, type StoreCredentials } from '@/services/webauthn'
import { generateLoginOptions, verifyLogin } from '@/app/actions/webauthn'

export interface VerificationProps {
  credentials: StoreCredentials
  onSuccess: () => void
}

export default function Verification(props: VerificationProps) {
  const { credentials: defaultCredentials, onSuccess } = props
  const [credentialsJson, setCredentialsJson] = useState<string>(credentialsToString(defaultCredentials))

  const formRef = useRef<HTMLFormElement>(null)
  const alertRef = useRef<AlertImperativeHandler>(null)

  const userCredentials = useMemo<StoreCredentials | null>(() => {
    if (!credentialsJson) {
      return null
    }

    return stringToCredentials(credentialsJson)
  }, [credentialsJson])

  const { run: submit, loading: submitting } = useRequest(
    async () => {
      if (!userCredentials) {
        throw new Error('Please enter valid credential information')
      }

      const options = await generateLoginOptions({ rpId: userCredentials.rpId, userCredentials })
      const credentials = await startAuthentication({ optionsJSON: options })
      const challenge = options.challenge
      const expectedOrigin = window.location.origin
      const expectedRPID = userCredentials.rpId
      await verifyLogin({ userCredentials, challenge, credentials, expectedOrigin, expectedRPID })
    },
    {
      manual: true,
      onSuccess: async () => {
        await alertRef.current?.show('Verification successful!')
        onSuccess()
      },
      onError: (error) => {
        alertRef.current?.show(error.message, { type: 'error' })
      },
    }
  )

  const verify = useCallback(async () => {
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity()
      return
    }

    submit()
  }, [submit])

  return (
    <form className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4" ref={formRef}>
      <div className="w-full max-w-md bg-white p-6 rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">WebAuthn Verification</h1>
        <p className="text-sm text-gray-500 mb-6">Please enter your credentials and use biometric or security key authentication.</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Credentials (JSON format)</label>
          <input
            value={credentialsJson}
            onChange={(e) => setCredentialsJson(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
            disabled
            placeholder='{"credentialID": "...", "publicKey": "...", "rpId": "..."}'
          />

          {credentialsJson && !userCredentials && <p className="mt-1 text-sm text-red-600">Invalid JSON format or missing required fields</p>}
        </div>

        <button
          onClick={verify}
          disabled={submitting || !userCredentials}
          className="w-full py-2 px-4 rounded-md text-white bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
          type="button"
        >
          {submitting ? <Spinner /> : 'Verify'}
        </button>

        <div className="flex flex-col gap-2 mt-2">
          <Alert ref={alertRef} />
        </div>
      </div>
    </form>
  )
}
