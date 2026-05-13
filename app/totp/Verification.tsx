'use client'

import { useRequest } from 'ahooks'
import { useCallback, useRef, useState } from 'react'
import { FiCheckCircle, FiSmartphone } from 'react-icons/fi'

import type { AlertImperativeHandler } from '@/components/Alert'
import Alert from '@/components/Alert'
import { LoginAuthenticatorCodeField, LoginFormButton } from '@/components/login'
import { appUi } from '@/components/ui/app-tokens'
import { verifyTOTPToken } from '@/utils/totp'

export interface VerificationProps {
  secret: string
}

export default function Verification(props: VerificationProps) {
  const { secret } = props

  const [token, setToken] = useState('')
  const [completed, setCompleted] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const alertRef = useRef<AlertImperativeHandler>(null)

  const { run: submit, loading: submitting } = useRequest(
    async () => {
      if (await verifyTOTPToken({ token, secret })) {
        return
      }

      throw new Error('Invalid verification code')
    },
    {
      manual: true,
      onSuccess: async () => {
        setCompleted(true)

        await alertRef.current?.show('Verification successful! Redirecting you...')
        window.location.reload()
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
  }, [])

  return (
    <form className={appUi.pageShell} ref={formRef}>
      <div className={`${appUi.card} w-full max-w-lg`}>
        <div className="mb-8 flex flex-col items-center text-center">
          <div className={`${appUi.iconBox} mb-5`}>
            <FiSmartphone size={18} aria-hidden />
          </div>
          <p className={`${appUi.sectionLabel} mb-2`}>Verification</p>
          <h1 className={`${appUi.pageTitle} mb-3`}>Confirm TOTP setup</h1>
          <p className={`${appUi.lead} max-w-md`}>Enter the current 6-digit code from your authenticator app before relying on this secret for login.</p>
        </div>

        <LoginAuthenticatorCodeField
          id="totp-setup-verify"
          hideLabel
          value={token}
          onChange={setToken}
          placeholder="Enter 6-digit code"
          disabled={completed}
          className="mb-6 w-full"
        />

        <LoginFormButton type="button" variant="primary" loading={submitting} loadingLabel="Verifying…" disabled={completed} onClick={verify}>
          <FiCheckCircle size={16} aria-hidden />
          Verify Code
        </LoginFormButton>

        <div className="mt-5 flex flex-col gap-2">
          <Alert ref={alertRef} />
        </div>
      </div>
    </form>
  )
}
