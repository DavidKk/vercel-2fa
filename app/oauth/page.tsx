import { headers } from 'next/headers'

import LoginForm from '@/app/login/Form'
import { OAuthHelpSidebar } from '@/app/oauth/OAuthHelpSidebar'
import { isAllowedRedirectUrl } from '@/utils/url'

interface OAuthLoginPageProps {
  searchParams: Promise<{ redirectUrl?: string; state?: string }>
}

export default async function OAuthLoginPage(props: OAuthLoginPageProps) {
  const enableTotp = !!process.env.ACCESS_TOTP_SECRET
  const enableWebAuthn = !!process.env.ACCESS_WEBAUTHN_SECRET

  if (!enableTotp && !enableWebAuthn) {
    return <div>2FA is not enabled</div>
  }

  const { searchParams } = props
  const { redirectUrl: encodedRedirectUrl, state } = await searchParams

  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') ?? 'https'
  const host = headersList.get('host')
  const currentPageUrl = host ? `${protocol}://${host}/oauth` : '/oauth'

  let redirectUrl = currentPageUrl
  if (encodedRedirectUrl) {
    try {
      redirectUrl = decodeURIComponent(encodedRedirectUrl)
    } catch {
      redirectUrl = encodedRedirectUrl
    }
  }
  if (!redirectUrl) {
    redirectUrl = currentPageUrl
  }

  if (!isAllowedRedirectUrl(redirectUrl, host || undefined)) {
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

  return (
    <>
      <OAuthHelpSidebar />
      <LoginForm enableTotp={enableTotp} enableWebAuthn={enableWebAuthn} redirectUrl={redirectUrl} state={state} />
    </>
  )
}
