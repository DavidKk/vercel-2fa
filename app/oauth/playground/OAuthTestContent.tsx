'use client'

import type { OAuthFlowMode } from '@/services/oauth/client'
import { OAuthFlowProvider } from '@/services/oauth/client'

import { OAuthHelpSidebar } from '../OAuthHelpSidebar'
import { OAuthPlayground } from './OAuthPlayground'

interface OAuthTestContentProps {
  mode: OAuthFlowMode
}

export function OAuthTestContent({ mode }: OAuthTestContentProps) {
  const oauthOptions = {
    defaultMode: mode,
  }

  return (
    <>
      <OAuthHelpSidebar />
      <OAuthFlowProvider {...oauthOptions}>
        <OAuthPlayground />
      </OAuthFlowProvider>
    </>
  )
}
