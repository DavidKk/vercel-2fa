'use client'

import { useRequest } from 'ahooks'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { startAuthentication } from '@simplewebauthn/browser'
import type { AlertImperativeHandler } from '@/components/Alert'
import Alert from '@/components/Alert'
import { Spinner } from '@/components/Spinner'
import { verfiyTOTPToken, getLoginWithWebauthnOptions, vierfyForm, verifyWebauthn } from '@/app/actions/login'
import { generateJWTToken } from '@/app/actions/jwt'
import { stringToCredentials } from '@/services/webauthn'

export interface LoginFormProps {
  enableTotp?: boolean
  enableWebAuthn?: boolean
  redirectUrl?: string
}

export default function LoginForm(props: LoginFormProps) {
  const { enableTotp, enableWebAuthn, redirectUrl = '/' } = props

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [access2FAToken, setAccess2FAToken] = useState('')
  const [complete, setComplete] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const alertRef = useRef<AlertImperativeHandler>(null)
  const router = useRouter()

  const { run: submit, loading: submitting } = useRequest(
    async () => {
      await vierfyForm({ username, password })

      if (enableTotp) {
        await verfiyTOTPToken({ username, password, token: access2FAToken })
      }

      if (enableWebAuthn) {
        const options = await getLoginWithWebauthnOptions({ username, password })
        const credentials = await startAuthentication({ optionsJSON: options })
        const challenge = options.challenge
        const expectedOrigin = window.location.origin
        const expectedRPID = options.rpId!
        await verifyWebauthn({ username, password, challenge, credentials, expectedOrigin, expectedRPID })
      }

      return generateJWTToken({ username, authenticated: true }, { expiresIn: '5m' })
    },
    {
      manual: true,
      throttleWait: 1000,
      onSuccess: (token) => {
        const url = new URL(redirectUrl, window.location.origin)
        url.searchParams.set('token', token)
        router.push(url.toString())
        setComplete(true)
      },
      onError: (error: Error) => {
        alertRef.current?.show(error.message, { type: 'error' })
      },
    }
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    submit()
  }

  useEffect(() => {
    if (username && password && access2FAToken) {
      if (formRef.current?.checkValidity()) {
        submit()
      }
    }
  }, [username, password, access2FAToken])

  if (!(enableTotp || enableWebAuthn)) {
    return null
  }

  return (
    <div className="flex justify-center pt-[20vh] h-screen bg-gray-100 pt-12">
      <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col items-center gap-4 p-4" ref={formRef}>
        <h1 className="text-2xl">Login</h1>

        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          required
          className="mt-1 w-full px-3 py-2 border rounded-md placeholder:tracking-normal text-lg focus:ring-indigo-500 focus:border-indigo-500"
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
          className="mt-1 w-full px-3 py-2 border rounded-md placeholder:tracking-normal text-lg focus:ring-indigo-500 focus:border-indigo-500"
        />

        {enableTotp && (
          <input
            className="mt-1 w-full px-3 py-2 border rounded-md text-center tracking-[1em] placeholder:tracking-normal text-lg focus:ring-indigo-500 focus:border-indigo-500"
            value={access2FAToken}
            onChange={(event) => setAccess2FAToken(event.target.value)}
            placeholder="2FA Code"
            maxLength={6}
            pattern="\d{6}"
            required
          />
        )}

        <button
          disabled={submitting || complete}
          type="submit"
          className="relative w-full max-w-lg bg-indigo-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <div>
              <span className="w-6 h-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Spinner />
              </span>
              &nbsp;
            </div>
          ) : complete ? (
            <span>jumpping, please wait...</span>
          ) : (
            <span>Login</span>
          )}
        </button>

        <Alert ref={alertRef} />
      </form>
    </div>
  )
}
