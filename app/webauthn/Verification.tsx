import { startAuthentication } from '@simplewebauthn/browser'
import { useRequest } from 'ahooks'
import { useCallback, useMemo, useRef, useState } from 'react'
import { FiCheckCircle, FiLoader, FiShield } from 'react-icons/fi'

import { generateLoginOptions, verifyLogin } from '@/app/actions/webauthn'
import type { AlertImperativeHandler } from '@/components/Alert'
import Alert from '@/components/Alert'
import { appUi } from '@/components/ui/app-tokens'
import { credentialsToString, type StoreCredentials, stringToCredentials } from '@/services/webauthn'

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
    <form className={appUi.pageShell} ref={formRef}>
      <div className={`${appUi.card} w-full max-w-2xl`}>
        <div className="mb-8 flex flex-col items-center text-center">
          <div className={`${appUi.iconBox} mb-5`}>
            <FiShield size={18} aria-hidden />
          </div>
          <p className={`${appUi.sectionLabel} mb-2`}>Verification</p>
          <h1 className={`${appUi.pageTitle} mb-3`}>Confirm WebAuthn credential</h1>
          <p className={`${appUi.lead} max-w-md`}>Use your authenticator once to confirm the exported credential works on this origin.</p>
        </div>

        <div className="mb-6 space-y-1.5">
          <label htmlFor="webauthn-verify-credentials" className={appUi.fieldLabel}>
            Credentials JSON
          </label>
          <input
            id="webauthn-verify-credentials"
            value={credentialsJson}
            onChange={(e) => setCredentialsJson(e.target.value)}
            className={`${appUi.control} font-mono`}
            required
            disabled
            placeholder='{"credentialID": "...", "publicKey": "...", "rpId": "..."}'
          />

          {credentialsJson && !userCredentials && <p className="mt-1 text-sm text-red-600 dark:text-red-400">Invalid JSON format or missing required fields</p>}
        </div>

        <button onClick={verify} disabled={submitting || !userCredentials} className={appUi.btnPrimary} type="button">
          {submitting ? (
            <>
              <FiLoader size={16} className="animate-spin" aria-hidden />
              Verifying...
            </>
          ) : (
            <>
              <FiCheckCircle size={16} aria-hidden />
              Verify credential
            </>
          )}
        </button>

        <div className="mt-4 flex flex-col gap-2">
          <Alert ref={alertRef} />
        </div>
      </div>
    </form>
  )
}
