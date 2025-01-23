'use client'

import { useRequest } from 'ahooks'
import { useCallback, useRef, useState } from 'react'
import { Spinner } from '@/components/Spinner'
import type { AlertImperativeHandler } from '@/components/Alert'
import Alert from '@/components/Alert'
import { verify2fa } from '@/actions/2fa'

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
      if (await verify2fa({ token, secret })) {
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
    <form className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4" ref={formRef}>
      <div className="w-full max-w-md bg-white p-6 rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Two-Factor Authentication</h1>
        <p className="text-sm text-gray-500 mb-6">Please enter the 6-digit verification code from your authenticator app.</p>

        <div className="mb-6">
          <input
            type="text"
            className="mt-1 w-full px-3 py-2 border rounded-md text-center tracking-[1em] placeholder:tracking-normal text-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter 6-digit code"
            value={token}
            disabled={completed}
            onChange={(e) => setToken(e.target.value)}
            maxLength={6}
            pattern="\d{6}"
            required
          />
        </div>

        <button
          onClick={verify}
          disabled={completed || submitting}
          className="w-full py-2 px-4 rounded-md text-white bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
          type="button"
        >
          {submitting ? <Spinner /> : 'Verify Code'}
        </button>

        <div className="flex flex-col gap-2 mt-2">
          <Alert ref={alertRef} />
        </div>
      </div>
    </form>
  )
}
