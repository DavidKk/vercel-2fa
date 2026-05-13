import { headers } from 'next/headers'
import { FiAlertTriangle } from 'react-icons/fi'

import { OAuthHelpSidebar } from '@/app/oauth/OAuthHelpSidebar'
import { OAuthLoginForm } from '@/app/oauth/OAuthLoginForm'
import { appUi } from '@/components/ui/app-tokens'
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
    // eslint-disable-next-line no-console
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    })
    // Don't expose internal error details to prevent information leakage
    return (
      <ErrorPanel
        title="Server Error"
        description="An error occurred while processing your request. Please try again later."
        value={error instanceof Error ? error.message : 'Internal server error'}
      />
    )
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
    <div className={appUi.pageShell}>
      <div className={`${appUi.card} w-full max-w-md text-center`}>
        <div className={`${appUi.iconBox} mx-auto mb-5 border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/60 dark:text-red-300`}>
          <FiAlertTriangle size={18} aria-hidden />
        </div>
        <h2 className="mb-3 text-xl font-semibold tracking-tight text-red-700 dark:text-red-300">{title}</h2>
        <p className={appUi.lead}>{description}</p>
        <p className="mt-4 break-all text-sm text-[var(--app-header-text)]">{value}</p>
      </div>
    </div>
  )
}
