import { headers } from 'next/headers'

import { OAuthHelpSidebar } from '@/app/oauth/OAuthHelpSidebar'
import { OAuthLoginForm } from '@/app/oauth/OAuthLoginForm'
import { getOAuthServerConfig, isOAuthEnabled, validateOAuthParams } from '@/services/oauth/server'

// Force dynamic rendering because we use searchParams and headers
export const dynamic = 'force-dynamic'

export interface OAuthLoginPageProps {
  searchParams: Promise<{
    redirectUrl?: string
    state?: string
    clientPublicKey?: string
    callbackOrigin?: string
  }>
}

export default async function OAuthLoginPage(props: OAuthLoginPageProps) {
  try {
    if (!isOAuthEnabled()) {
      return <div>2FA is not enabled</div>
    }

    const { searchParams } = props
    const params = await searchParams

    const headersList = await headers()
    const protocol = headersList.get('x-forwarded-proto') ?? 'https'
    const host = headersList.get('host')
    const currentPageUrl = host ? `${protocol}://${host}/oauth` : '/oauth'

    const validation = validateOAuthParams({
      ...params,
      currentHost: host || undefined,
      currentPageUrl,
    })

    if (!validation.valid) {
      return <ErrorPanel {...validation.error!} />
    }

    const config = getOAuthServerConfig()

    return (
      <>
        <OAuthHelpSidebar />
        <OAuthLoginForm
          enableTotp={config.enableTotp}
          enableWebAuthn={config.enableWebAuthn}
          redirectUrl={validation.redirectUrl!}
          state={validation.state}
          clientPublicKey={validation.clientPublicKey!}
          callbackOrigin={validation.callbackOrigin}
        />
      </>
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('OAuth login page error:', error)
    // Don't expose internal error details to prevent information leakage
    return <ErrorPanel title="Server Error" description="An error occurred while processing your request. Please try again later." value="Internal server error" />
  }
}

export interface ErrorPanelProps {
  title: string
  description: string
  value: string
}

function ErrorPanel(props: ErrorPanelProps) {
  const { title, description, value } = props
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 border border-red-200">
        <h2 className="text-center text-xl font-semibold mb-4 text-red-600">{title}</h2>
        <p className="text-center text-gray-700">{description}</p>
        <p className="text-center text-sm text-gray-500 mt-4 break-all">{value}</p>
      </div>
    </div>
  )
}
