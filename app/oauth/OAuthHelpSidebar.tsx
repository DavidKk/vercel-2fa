'use client'

import { AssistSidebarTrigger, useAssistSidebarContent } from '@/components/AssistSidebar'

import ecdhDoc from '../ecdh/docs/flow.md'
import integrationDoc from './docs/integration.md'

export interface OAuthHelpSidebarProps {
  moduleKey?: string
  showTrigger?: boolean
}

export function OAuthHelpSidebar(props: OAuthHelpSidebarProps) {
  const { moduleKey = 'oauth', showTrigger = true } = props

  useAssistSidebarContent(moduleKey, [
    { key: 'integration', title: 'Integration Guide', markdown: integrationDoc },
    { key: 'ecdh', title: 'ECDH Secure Flow', markdown: ecdhDoc },
  ])

  if (!showTrigger) {
    return null
  }

  return <AssistSidebarTrigger contentKey={moduleKey} />
}
