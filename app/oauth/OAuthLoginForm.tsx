'use client'

import { startAuthentication } from '@simplewebauthn/browser'
import { useRequest } from 'ahooks'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { FiShield, FiUser } from 'react-icons/fi'

import { getLoginWithWebauthnOptions, loginWithECDH, loginWithECDHViaWebAuthn, verfiyTOTPToken, vierfyForm } from '@/app/actions/login'
import type { AlertImperativeHandler } from '@/components/Alert'
import Alert from '@/components/Alert'
import { LoginAuthenticatorCodeField, LoginFormButton, LoginIconTextField, LoginPasswordField, LoginRememberMeCheckbox } from '@/components/login'
import { deliverToken } from '@/services/oauth/server'

export interface OAuthLoginFormProps {
  enableTotp?: boolean
  enableWebAuthn?: boolean
  redirectUrl: string
  state?: string
  clientPublicKey: string
  callbackOrigin?: string
}

export function OAuthLoginForm(props: OAuthLoginFormProps) {
  const { enableTotp, enableWebAuthn, redirectUrl, state, clientPublicKey, callbackOrigin } = props

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [access2FAToken, setAccess2FAToken] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [complete, setComplete] = useState(false)
  const [totpVisible, setTotpVisible] = useState(!!enableTotp && !enableWebAuthn)
  const formRef = useRef<HTMLFormElement>(null)
  const alertRef = useRef<AlertImperativeHandler>(null)
  const router = useRouter()

  const handleRedirect = (token: string) => {
    if (typeof window === 'undefined') {
      return
    }

    deliverToken({
      token,
      redirectUrl,
      state,
      callbackOrigin,
      onRedirect: (url) => {
        router.push(url)
      },
    })

    setComplete(true)
  }

  const { run: submit, loading: submitting } = useRequest(
    async () => {
      await vierfyForm({ username, password })

      if (enableTotp) {
        await verfiyTOTPToken({ username, password, token: access2FAToken })
      }

      return loginWithECDH({ username, password, clientPublicKey, rememberMe })
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

      return loginWithECDHViaWebAuthn({
        clientPublicKey,
        rememberMe,
        credentials,
        challenge: options.challenge,
        expectedOrigin: window.location.origin,
        expectedRPID: options.rpId!,
      })
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!enableTotp) {
      submit()
      return
    }

    if (!totpVisible) {
      setTotpVisible(true)
      return
    }

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
    <div className="flex min-h-screen flex-col justify-center bg-[var(--nav-link-hover-bg)] px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[26rem]">
        <form ref={formRef} onSubmit={handleSubmit} className="rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-[var(--nav-brand-text)]">OAuth Login</h1>
            <p className="mt-1.5 text-sm text-[var(--app-header-text)]">Sign in to continue to the requesting application.</p>
          </div>

          <div className="flex flex-col gap-4">
            <LoginIconTextField
              id="oauth-login-username"
              label="Username"
              value={username}
              onChange={setUsername}
              leadingIcon={<FiUser strokeWidth={2} aria-hidden />}
              placeholder="Username"
              autoComplete="username"
              disabled={busy}
            />

            <LoginPasswordField
              id="oauth-login-password"
              label="Password"
              value={password}
              onChange={setPassword}
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword((v) => !v)}
              placeholder="Password"
              disabled={busy}
            />

            {enableTotp && totpVisible ? <LoginAuthenticatorCodeField id="oauth-login-totp" value={access2FAToken} onChange={setAccess2FAToken} disabled={busy} /> : null}

            <LoginRememberMeCheckbox id="oauth-login-remember-me" checked={rememberMe} onChange={setRememberMe} disabled={busy} />

            <div className="flex flex-col gap-2 pt-1">
              <LoginFormButton type="submit" variant="primary" loading={submitting} loadingLabel="Verifying…" disabled={complete}>
                {complete ? 'Redirecting…' : 'Continue'}
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
                  Use WebAuthn
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
