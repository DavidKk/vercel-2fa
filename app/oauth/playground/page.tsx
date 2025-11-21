import { headers } from 'next/headers'

import { generateTemporaryKeyPair, getServerPublicKey } from '@/app/actions/oauth'

import { OAuthPlaygroundContent } from './OAuthPlaygroundContent'

interface OAuthTestPageProps {
  searchParams: Promise<{ mode?: string; resultPage?: string }>
}

export default async function OAuthTestPage(props: OAuthTestPageProps) {
  const searchParams = await props.searchParams
  const mode = searchParams.mode === 'redirect' ? 'redirect' : 'popup'
  const isResultPage = searchParams.resultPage === 'true'
  const flowType: 'login' | 'callback' = isResultPage ? 'callback' : 'login'

  // Generate callback URL in SSR
  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') ?? 'https'
  const host = headersList.get('host')
  let defaultCallbackUrl: string | null = null
  if (host) {
    const url = new URL(`${protocol}://${host}/oauth/playground`)
    url.searchParams.set('resultPage', 'true')
    defaultCallbackUrl = url.toString()
  }

  // SSR data fetching strategy:
  // - 'login' flow: pre-fetch server public key and generate temporary key pair for performance
  // - 'callback' flow: skip SSR data fetching (will use existing keys from sessionStorage)
  let initialServerPublicKey: string | null = null
  let initialKeyPair: { publicKey: string; privateKey: string } | null = null

  if (flowType === 'login') {
    // Use Promise.allSettled to handle potential failures gracefully
    // If Server Actions fail, client will fall back to fetching/generating on its own
    const [serverPublicKeyResult, keyPairResult] = await Promise.allSettled([getServerPublicKey(), generateTemporaryKeyPair()])
    initialServerPublicKey = serverPublicKeyResult.status === 'fulfilled' ? serverPublicKeyResult.value : null
    initialKeyPair = keyPairResult.status === 'fulfilled' ? keyPairResult.value : null
  }

  return (
    <OAuthPlaygroundContent
      mode={mode}
      isResultPage={isResultPage}
      flowType={flowType}
      initialServerPublicKey={initialServerPublicKey}
      initialKeyPair={initialKeyPair}
      defaultCallbackUrl={defaultCallbackUrl}
    />
  )
}
