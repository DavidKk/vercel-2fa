import { notFound } from 'next/navigation'

import { generate } from '@/components/Meta'
import { getRequestOrigin } from '@/utils/get-request-origin'

import { GettingStartedShell } from '../GettingStartedShell'
import { GETTING_STARTED_TABS, type GettingStartedTab, isGettingStartedTab } from '../tabs'

const BASE_DESCRIPTION = 'Learn how to set up and integrate the Two-Factor Authentication Service for your applications.'

const TAB_META: Record<
  GettingStartedTab,
  {
    title: string
    description: string
  }
> = {
  overview: {
    title: 'Overview - Getting Started',
    description: BASE_DESCRIPTION,
  },
  totp: {
    title: 'TOTP Setup - Getting Started',
    description: 'Generate and store a TOTP secret for admin two-factor authentication.',
  },
  webauthn: {
    title: 'WebAuthn Setup - Getting Started',
    description: 'Register passkeys or security keys for passwordless admin sign-in.',
  },
  ecdh: {
    title: 'ECDH Setup - Getting Started',
    description: 'Configure ECDH keys for optional encrypted OAuth-style token return.',
  },
  integration: {
    title: 'Project Integration - Getting Started',
    description: 'Redirect flows, JWT verification, and client examples for your apps.',
  },
  env: {
    title: 'Environment Variables - Getting Started',
    description: 'Required and optional environment variables for this auth service.',
  },
}

export function generateStaticParams() {
  return GETTING_STARTED_TABS.map((tab) => ({ tab }))
}

/**
 * Per-tab metadata for SEO and browser title.
 * @param params Dynamic route segment `tab`
 * @returns Next.js metadata object
 */
export async function generateMetadata({ params }: { params: Promise<{ tab: string }> }) {
  const { tab: raw } = await params
  if (!isGettingStartedTab(raw)) {
    return {}
  }
  const { title, description } = TAB_META[raw]
  const { generateMetadata } = generate({ title, description })
  return generateMetadata()
}

/**
 * Renders one guide tab under `/getting-started/[tab]`.
 * @param params Route params containing `tab`
 * @returns Guide shell with tab content
 */
export default async function GettingStartedTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab: raw } = await params
  if (!isGettingStartedTab(raw)) {
    notFound()
  }

  const requestOrigin = await getRequestOrigin()

  return <GettingStartedShell activeTab={raw} requestOrigin={requestOrigin} />
}
