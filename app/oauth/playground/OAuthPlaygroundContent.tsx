'use client'

import type { OAuthFlowMode } from '@/services/oauth/client'
import { OAuthFlowProvider } from '@/services/oauth/client'

import { OAuthHelpSidebar } from '../OAuthHelpSidebar'
import { OAuthPlayground } from './OAuthPlayground'

interface OAuthPlaygroundContentProps {
  mode: OAuthFlowMode
  isResultPage?: boolean
  /** Flow type: 'login' or 'callback' */
  flowType: 'login' | 'callback'
  /** Initial server public key from SSR (only used for 'login' flow type) */
  initialServerPublicKey?: string | null
  /** Initial temporary key pair from SSR (only used for 'login' flow type) */
  initialKeyPair?: { publicKey: string; privateKey: string } | null
  /** Default callback URL from SSR */
  defaultCallbackUrl?: string | null
}

export function OAuthPlaygroundContent({ mode, isResultPage, flowType, initialServerPublicKey, initialKeyPair, defaultCallbackUrl }: OAuthPlaygroundContentProps) {
  const oauthOptions = {
    defaultMode: mode,
    flowType,
    initialServerPublicKey,
    initialKeyPair,
  }

  return (
    <>
      <OAuthHelpSidebar />
      <OAuthFlowProvider {...oauthOptions}>
        <OAuthPlayground isResultPage={isResultPage} defaultCallbackUrl={defaultCallbackUrl} />
      </OAuthFlowProvider>
    </>
  )
}
