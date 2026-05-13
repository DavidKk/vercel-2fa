'use client'

import Link from 'next/link'
import { type FC } from 'react'
import { FiHome, FiKey, FiLink, FiSettings, FiShield, FiSmartphone } from 'react-icons/fi'

import { gettingStartedDoc, gettingStartedNavTabClass } from '@/app/getting-started/doc-tokens'
import type { GettingStartedTab } from '@/app/getting-started/tabs'

import { ECDHContent } from './components/ECDHContent'
import { EnvironmentContent } from './components/EnvironmentContent'
import { IntegrationContent } from './components/IntegrationContent'
import { OverviewContent } from './components/OverviewContent'
import { TOTPContent } from './components/TOTPContent'
import { WebAuthnContent } from './components/WebAuthnContent'

type TabConfig = { key: GettingStartedTab; label: string; icon: FC<{ size?: number }> }

const tabs: TabConfig[] = [
  { key: 'overview', label: 'Overview', icon: FiHome },
  { key: 'totp', label: 'TOTP Setup', icon: FiSmartphone },
  { key: 'webauthn', label: 'WebAuthn Setup', icon: FiShield },
  { key: 'ecdh', label: 'ECDH Setup', icon: FiKey },
  { key: 'integration', label: 'Project Integration', icon: FiLink },
  { key: 'env', label: 'Environment variables', icon: FiSettings },
]

export type GettingStartedShellProps = {
  /** Active guide tab from the URL segment */
  activeTab: GettingStartedTab
}

/**
 * Renders the Guide sidebar card (shared markup for mobile stack and desktop sticky column).
 * @param activeTab Current tab for active link styling
 * @param sticky When true, wraps the card in a sticky container for large viewports
 * @returns Nav card element
 */
function GuideNavCard(props: { activeTab: GettingStartedTab; sticky?: boolean }) {
  const { activeTab, sticky } = props
  const inner = (
    <div className="rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] p-3 shadow-sm">
      <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-[var(--app-header-text)]">Guide</p>
      <nav className="space-y-0.5" aria-label="Getting started sections">
        {tabs.map(({ key, label, icon: TabIcon }) => {
          const active = activeTab === key
          return (
            <Link key={key} href={`/getting-started/${key}`} className={`${gettingStartedNavTabClass(active)} block`} aria-current={active ? 'page' : undefined}>
              <span className="flex items-center gap-2">
                <span className="inline-flex shrink-0 opacity-90" aria-hidden>
                  <TabIcon size={16} />
                </span>
                <span>{label}</span>
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )

  if (sticky) {
    return <div className="sticky top-4">{inner}</div>
  }
  return inner
}

/**
 * Guide layout with navigation links and tab body; driven by `/getting-started/[tab]` routes.
 * @param activeTab Current tab from the server page
 * @returns Full guide UI for the active tab
 */
export function GettingStartedShell({ activeTab }: GettingStartedShellProps) {
  return (
    <div className="relative">
      {/* Out of document flow so the grid row-gap does not add a blank strip above the layout */}
      <div id="mcp" className="pointer-events-none absolute left-0 top-0 -z-10 h-px w-px overflow-hidden scroll-mt-28" aria-hidden tabIndex={-1} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4 xl:gap-6">
        <div className="xl:hidden">
          <GuideNavCard activeTab={activeTab} />
        </div>

        <aside className="hidden xl:col-span-1 xl:block">
          <GuideNavCard activeTab={activeTab} sticky />
        </aside>

        <div className="min-w-0 xl:col-span-3">
          <div className="min-h-[22rem] rounded-2xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] shadow-sm sm:min-h-[26rem]">
            <div className="px-4 py-6 sm:px-8 sm:py-10">
              <div className={gettingStartedDoc.docMain}>
                {activeTab === 'overview' && <OverviewContent />}
                {activeTab === 'totp' && <TOTPContent />}
                {activeTab === 'webauthn' && <WebAuthnContent />}
                {activeTab === 'ecdh' && <ECDHContent />}
                {activeTab === 'integration' && <IntegrationContent />}
                {activeTab === 'env' && <EnvironmentContent />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
