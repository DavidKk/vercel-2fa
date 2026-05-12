'use client'

import { type FC, useState } from 'react'
import { FiHome, FiKey, FiLink, FiSettings, FiShield, FiSmartphone } from 'react-icons/fi'

import { ECDHContent } from './components/ECDHContent'
import { EnvironmentContent } from './components/EnvironmentContent'
import { IntegrationContent } from './components/IntegrationContent'
import { OverviewContent } from './components/OverviewContent'
import { TOTPContent } from './components/TOTPContent'
import { WebAuthnContent } from './components/WebAuthnContent'

type Tab = 'overview' | 'totp' | 'webauthn' | 'ecdh' | 'integration' | 'env'

export function GettingStartedContent() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs: Array<{ key: Tab; label: string; icon: FC<{ size?: number }> }> = [
    { key: 'overview', label: 'Overview', icon: FiHome },
    { key: 'totp', label: 'TOTP Setup', icon: FiSmartphone },
    { key: 'webauthn', label: 'WebAuthn Setup', icon: FiShield },
    { key: 'ecdh', label: 'ECDH Setup', icon: FiKey },
    { key: 'integration', label: 'Project Integration', icon: FiLink },
    { key: 'env', label: 'Environment Vars', icon: FiSettings },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <div id="mcp" className="col-span-full h-0 scroll-mt-28 overflow-hidden" aria-hidden tabIndex={-1} />
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sticky top-4">
          <nav className="space-y-0.5">
            {tabs.map(({ key, label, icon: TabIcon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as Tab)}
                className={`w-full text-left px-3 py-1.5 rounded-md transition-colors text-sm ${
                  activeTab === key ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TabIcon size={16} />
                  <span>{label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          {activeTab === 'overview' && <OverviewContent />}
          {activeTab === 'totp' && <TOTPContent />}
          {activeTab === 'webauthn' && <WebAuthnContent />}
          {activeTab === 'ecdh' && <ECDHContent />}
          {activeTab === 'integration' && <IntegrationContent />}
          {activeTab === 'env' && <EnvironmentContent />}
        </div>
      </div>
    </div>
  )
}
