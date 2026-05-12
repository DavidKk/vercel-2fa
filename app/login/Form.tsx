'use client'

import { startAuthentication } from '@simplewebauthn/browser'
import { useRequest } from 'ahooks'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FiLogIn, FiShield, FiUser } from 'react-icons/fi'

import { generateLoginSessionJWT } from '@/app/actions/jwt'
import { getLoginWithWebauthnOptions, loginWithECDH, verfiyTOTPToken, verifyWebauthn, vierfyForm } from '@/app/actions/login'
import type { AlertImperativeHandler } from '@/components/Alert'
import Alert from '@/components/Alert'
import { LoginAuthenticatorCodeField, LoginFormButton, LoginIconTextField, LoginPasswordField, LoginRememberMeCheckbox } from '@/components/login'

export interface LoginFormProps {
  enableTotp?: boolean
  enableWebAuthn?: boolean
  redirectUrl?: string
  state?: string
}

export default function LoginForm(props: LoginFormProps) {
  const { enableTotp, enableWebAuthn, redirectUrl = '/', state } = props

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [access2FAToken, setAccess2FAToken] = useState('')
  const [complete, setComplete] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const formRef = useRef<HTMLFormElement>(null)
  const alertRef = useRef<AlertImperativeHandler>(null)
  const router = useRouter()

  const [clientPublicKey, setClientPublicKey] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const pk = params.get('clientPublicKey')
      if (pk) {
        setClientPublicKey(pk)
      }
    }
  }, [])

  const handleRedirect = (token: string) => {
    const url = new URL(redirectUrl, window.location.origin)
    url.searchParams.set('token', token)

    if (state) {
      url.searchParams.set('state', state)
    }

    router.push(url.toString())
    setComplete(true)
  }

  const { run: submit, loading: submitting } = useRequest(
    async () => {
      await vierfyForm({ username, password })

      if (enableTotp) {
        await verfiyTOTPToken({ username, password, token: access2FAToken })
      }

      if (clientPublicKey) {
        return await loginWithECDH({ username, password, clientPublicKey, rememberMe })
      }

      return generateLoginSessionJWT(rememberMe)
    },
    {
      manual: true,
      throttleWait: 1000,
      onSuccess: async (token) => {
        await handleRedirect(token)
      },
      onError: (error: Error) => {
        alertRef.current?.show(error.message, { type: 'error' })
      },
    }
  )

  const { run: submitWebAuthn, loading: webAuthnSubmitting } = useRequest(
    async () => {
      if (!enableWebAuthn) {
        throw new Error('WebAuthn is not enabled')
      }

      const options = await getLoginWithWebauthnOptions()
      const credentials = await startAuthentication({ optionsJSON: options })

      const challenge = options.challenge
      const expectedOrigin = window.location.origin
      const expectedRPID = options.rpId!

      await verifyWebauthn({ challenge, credentials, expectedOrigin, expectedRPID })

      return generateLoginSessionJWT(rememberMe)
    },
    {
      manual: true,
      throttleWait: 1000,
      onSuccess: (token) => {
        handleRedirect(token)
      },
      onError: (error: Error) => {
        alertRef.current?.show(error.message, { type: 'error' })
      },
    }
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity()
      return
    }

    submit()
  }

  const handleWebAuthn = () => {
    submitWebAuthn()
  }

  if (!(enableTotp || enableWebAuthn)) {
    return null
  }

  const busy = submitting || webAuthnSubmitting || complete

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] flex-1 flex-col bg-[var(--nav-link-hover-bg)] px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center">
        <form ref={formRef} onSubmit={handleSubmit} className="rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-[var(--nav-brand-text)]">Sign in</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--app-header-text)]">Enter your credentials and complete second-factor verification.</p>
          </div>

          <div className="flex flex-col gap-4">
            <LoginIconTextField
              id="login-username"
              label="Username"
              value={username}
              onChange={setUsername}
              leadingIcon={<FiUser strokeWidth={2} aria-hidden />}
              placeholder="admin"
              autoComplete="username"
              disabled={busy}
            />

            <LoginPasswordField
              id="login-password"
              label="Password"
              value={password}
              onChange={setPassword}
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword((v) => !v)}
              disabled={busy}
            />

            {enableTotp ? <LoginAuthenticatorCodeField id="login-totp" value={access2FAToken} onChange={setAccess2FAToken} disabled={busy} /> : null}

            <LoginRememberMeCheckbox id="login-remember-me" checked={rememberMe} onChange={setRememberMe} disabled={busy} />

            <div className="flex flex-col gap-2 pt-1">
              <LoginFormButton
                type="submit"
                variant="primary"
                loading={submitting}
                loadingLabel="Verifying…"
                disabled={complete}
                leadingIcon={complete ? undefined : <FiLogIn size={18} aria-hidden />}
              >
                {complete ? 'Redirecting…' : 'Sign in'}
              </LoginFormButton>

              {enableWebAuthn ? (
                <LoginFormButton
                  type="button"
                  variant="secondary"
                  loading={webAuthnSubmitting}
                  loadingLabel="Authenticating…"
                  disabled={complete}
                  leadingIcon={<FiShield size={18} aria-hidden />}
                  onClick={handleWebAuthn}
                >
                  Sign in with WebAuthn
                </LoginFormButton>
              ) : null}
            </div>
          </div>

          <div className="mt-5">
            <Alert ref={alertRef} />
          </div>
        </form>
      </div>
    </div>
  )
}
