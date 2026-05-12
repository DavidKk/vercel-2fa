import { headers } from 'next/headers'

import { isAllowedRedirectUrl } from '@/utils/url'

import LoginForm from './Form'

// Force dynamic rendering because we use searchParams and headers
export const dynamic = 'force-dynamic'

export interface LoginPageProps {
  searchParams: Promise<{ redirectUrl?: string; state?: string }>
}

export default async function LoginPage(props: LoginPageProps) {
  const enableTotp = !!process.env.ACCESS_TOTP_SECRET
  const enableWebAuthn = !!process.env.ACCESS_WEBAUTHN_SECRET
  if (!enableTotp && !enableWebAuthn) {
    return (
      <div className="flex min-h-[calc(100vh-var(--header-height))] flex-1 flex-col items-center justify-center bg-[var(--nav-link-hover-bg)] px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-[var(--nav-brand-text)]">Two-factor authentication is not configured</p>
          <p className="mt-2 text-sm text-[var(--app-header-text)]">Set ACCESS_TOTP_SECRET and/or ACCESS_WEBAUTHN_SECRET to enable sign-in.</p>
        </div>
      </div>
    )
  }

  const { searchParams } = props
  // Default `/` after sign-in; pass `redirectUrl=/login/blank` for token inspection (playground / docs).
  const { redirectUrl: url = '/', state } = await searchParams

  const redirectUrl = decodeURIComponent(url)

  const headersList = await headers()
  const host = headersList.get('host')

  // Validate redirect URL against whitelist
  if (!isAllowedRedirectUrl(redirectUrl, host || undefined)) {
    return (
      <div className="flex min-h-[calc(100vh-var(--header-height))] flex-1 flex-col items-center justify-center bg-[var(--nav-link-hover-bg)] px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-[var(--app-header-bg)] p-8 shadow-sm dark:border-red-900/50">
          <h2 className="text-center text-lg font-semibold tracking-tight text-red-600 dark:text-red-400">Invalid redirect URL</h2>
          <p className="mt-3 text-center text-sm leading-relaxed text-[var(--app-header-text)]">The redirect URL is not in the allowed list. Please contact your administrator.</p>
          <p className="mt-4 break-all rounded-lg border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] px-3 py-2 text-left font-mono text-xs text-[var(--nav-brand-text)]">
            {redirectUrl}
          </p>
        </div>
      </div>
    )
  }

  return <LoginForm enableTotp={enableTotp} enableWebAuthn={enableWebAuthn} redirectUrl={redirectUrl} state={state} />
}
