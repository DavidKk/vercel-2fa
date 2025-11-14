import { isAllowedRedirectUrl } from '@/utils/url'

import LoginForm from './Form'

interface LoginPageProps {
  searchParams: Promise<{ redirectUrl?: string; state?: string }>
}

export default async function LoginPage(props: LoginPageProps) {
  const enableTotp = !!process.env.ACCESS_TOTP_SECRET
  const enableWebAuthn = !!process.env.ACCESS_WEBAUTHN_SECRET
  if (!enableTotp && !enableWebAuthn) {
    return <div>2FA is not enabled</div>
  }

  const { searchParams } = props
  const { redirectUrl: url = '/login/blank', state } = await searchParams

  const redirectUrl = decodeURIComponent(url)

  // Validate redirect URL against whitelist
  if (!isAllowedRedirectUrl(redirectUrl)) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 border border-red-200">
          <h2 className="text-center text-xl font-semibold mb-4 text-red-600">Invalid Redirect URL</h2>
          <p className="text-center text-gray-700">The redirect URL is not in the allowed list. Please contact your administrator.</p>
          <p className="text-center text-sm text-gray-500 mt-4">Redirect URL: {redirectUrl}</p>
        </div>
      </div>
    )
  }

  return <LoginForm enableTotp={enableTotp} enableWebAuthn={enableWebAuthn} redirectUrl={redirectUrl} state={state} />
}
