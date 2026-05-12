'use client'

import Link from 'next/link'
import { type FC } from 'react'
import { FiHome, FiKey, FiLink, FiSettings, FiShield, FiSmartphone } from 'react-icons/fi'

import { gettingStartedDoc, gettingStartedNavTabClass, gettingStartedNavTabMobileClass } from '@/app/getting-started/doc-tokens'
import type { GettingStartedTab } from '@/app/getting-started/tabs'

import { ECDHContent } from './components/ECDHContent'
import { EnvironmentContent } from './components/EnvironmentContent'
import { IntegrationContent } from './components/IntegrationContent'
import { OverviewContent } from './components/OverviewContent'
import { TOTPContent } from './components/TOTPContent'
import { WebAuthnContent } from './components/WebAuthnContent'

type TabConfig = { key: GettingStartedTab; label: string; shortLabel: string; icon: FC<{ size?: number }> }

const tabs: TabConfig[] = [
  { key: 'overview', label: 'Overview', shortLabel: 'Overview', icon: FiHome },
  { key: 'totp', label: 'TOTP Setup', shortLabel: 'TOTP', icon: FiSmartphone },
  { key: 'webauthn', label: 'WebAuthn Setup', shortLabel: 'WebAuthn', icon: FiShield },
  { key: 'ecdh', label: 'ECDH Setup', shortLabel: 'ECDH', icon: FiKey },
  { key: 'integration', label: 'Project Integration', shortLabel: 'Integrate', icon: FiLink },
  { key: 'env', label: 'Environment Vars', shortLabel: 'Env', icon: FiSettings },
]

export type GettingStartedShellProps = {
  /** Active guide tab from the URL segment */
  activeTab: GettingStartedTab
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
        <nav className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 pt-0.5 lg:hidden" aria-label="Guide topics">
          {tabs.map(({ key, shortLabel, icon: TabIcon }) => {
            const active = activeTab === key
            return (
              <Link key={key} href={`/getting-started/${key}`} className={gettingStartedNavTabMobileClass(active)} aria-current={active ? 'page' : undefined}>
                <span className="flex items-center gap-1.5">
                  <span className="inline-flex shrink-0 opacity-90" aria-hidden>
                    <TabIcon size={14} />
                  </span>
                  <span>{shortLabel}</span>
                </span>
              </Link>
            )
          })}
        </nav>

        <aside className="hidden lg:col-span-1 lg:block">
          <div className="sticky top-4 rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] p-3 shadow-sm">
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-[var(--app-header-text)]">Guide</p>
            <nav className="space-y-0.5" aria-label="Getting started sections (desktop)">
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
        </aside>

        <div className="min-w-0 lg:col-span-3">
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
