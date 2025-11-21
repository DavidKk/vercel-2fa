import { headers } from 'next/headers'

import { OAuthHelpSidebar } from '@/app/oauth/OAuthHelpSidebar'
import { OAuthLoginForm } from '@/app/oauth/OAuthLoginForm'
import { isAllowedRedirectUrl } from '@/utils/url'

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
    const enableTotp = !!process.env.ACCESS_TOTP_SECRET
    const enableWebAuthn = !!process.env.ACCESS_WEBAUTHN_SECRET

    if (!enableTotp && !enableWebAuthn) {
      return <div>2FA is not enabled</div>
    }

    const { searchParams } = props
    const { redirectUrl: encodedRedirectUrl, state, clientPublicKey: rawClientPublicKey, callbackOrigin } = await searchParams
    const clientPublicKey = normalizeClientPublicKey(rawClientPublicKey)

    if (!clientPublicKey || !isValidBase64Key(clientPublicKey)) {
      return (
        <ErrorPanel
          title="Missing Client Public Key"
          description="OAuth requests must include a valid client public key so we can encrypt the token. Make sure you append the clientPublicKey query parameter."
          value={rawClientPublicKey || 'Not provided'}
        />
      )
    }

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
      return <ErrorPanel title="Invalid Redirect URL" description="The redirect URL is not in the allowed list. Please contact your administrator." value={redirectUrl} />
    }

    return (
      <>
        <OAuthHelpSidebar />
        <OAuthLoginForm
          enableTotp={enableTotp}
          enableWebAuthn={enableWebAuthn}
          redirectUrl={redirectUrl}
          state={state}
          clientPublicKey={clientPublicKey}
          callbackOrigin={callbackOrigin}
        />
      </>
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('OAuth login page error:', error)
    return (
      <ErrorPanel
        title="Server Error"
        description="An error occurred while processing your request. Please try again later."
        value={error instanceof Error ? error.message : 'Unknown error'}
      />
    )
  }
}

function normalizeClientPublicKey(value?: string) {
  if (!value) {
    return undefined
  }
  const decoded = safeDecodeURIComponent(value)
  // Some clients send base64 with '+' signs without encoding; browsers convert '+' to ' ' when parsing querystring.
  // Convert spaces back to '+' to ensure we use the original base64 string.
  return decoded.replace(/ /g, '+').trim()
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function isValidBase64Key(value: string) {
  if (!value || value.length < 32) {
    return false
  }
  try {
    // Reject characters outside base64 alphabet
    if (!/^[A-Za-z0-9+/=]+$/.test(value)) {
      return false
    }
    Buffer.from(value, 'base64').toString('base64')
    return true
  } catch {
    return false
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
