'use client'

import type { PropsWithChildren } from 'react'
import { createContext, useContext } from 'react'

import type { OAuthFlowResult, UseOAuthFlowOptions } from './hooks/useOAuthFlow'
import { useOAuthFlow } from './hooks/useOAuthFlow'

const OAuthFlowContext = createContext<OAuthFlowResult | null>(null)

export function OAuthFlowProvider(props: PropsWithChildren<UseOAuthFlowOptions>) {
  const { children, ...options } = props
  const value = useOAuthFlow(options)
  return <OAuthFlowContext.Provider value={value}>{children}</OAuthFlowContext.Provider>
}

export function useOAuthFlowContext() {
  const ctx = useContext(OAuthFlowContext)
  if (!ctx) {
    throw new Error('useOAuthFlowContext must be used within OAuthFlowProvider')
  }
  return ctx
}
