'use client'

import { useRequest } from 'ahooks'
import { useCallback, useRef, useState } from 'react'

import type { AlertImperativeHandler } from '@/components/Alert'
import Alert from '@/components/Alert'
import { LoginAuthenticatorCodeField, LoginFormButton } from '@/components/login'
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
    <form className="flex min-h-screen flex-col items-center justify-center bg-[var(--nav-link-hover-bg)] px-4" ref={formRef}>
      <div className="w-full max-w-md rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] p-6 shadow-sm sm:p-8">
        <h1 className="mb-2 text-center text-xl font-semibold tracking-tight text-[var(--nav-brand-text)]">Two-Factor Authentication</h1>
        <p className="mb-6 text-center text-sm text-[var(--app-header-text)]">Please enter the 6-digit verification code from your authenticator app.</p>

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
          Verify Code
        </LoginFormButton>

        <div className="mt-5 flex flex-col gap-2">
          <Alert ref={alertRef} />
        </div>
      </div>
    </form>
  )
}
