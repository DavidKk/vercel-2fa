'use client'

import type { FeatherIconName } from 'feather-icons-react'
import FeatherIcon from 'feather-icons-react'
import { useState } from 'react'

import { ECDHContent } from './components/ECDHContent'
import { EnvironmentContent } from './components/EnvironmentContent'
import { IntegrationContent } from './components/IntegrationContent'
import { OverviewContent } from './components/OverviewContent'
import { TOTPContent } from './components/TOTPContent'
import { WebAuthnContent } from './components/WebAuthnContent'

type Tab = 'overview' | 'totp' | 'webauthn' | 'ecdh' | 'integration' | 'env'

export function GettingStartedContent() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs: Array<{ key: Tab; label: string; icon: FeatherIconName }> = [
    { key: 'overview', label: 'Overview', icon: 'home' },
    { key: 'totp', label: 'TOTP Setup', icon: 'smartphone' },
    { key: 'webauthn', label: 'WebAuthn Setup', icon: 'shield' },
    { key: 'ecdh', label: 'ECDH Setup', icon: 'key' },
    { key: 'integration', label: 'Project Integration', icon: 'link' },
    { key: 'env', label: 'Environment Vars', icon: 'settings' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sticky top-4">
          <nav className="space-y-0.5">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as Tab)}
                className={`w-full text-left px-3 py-1.5 rounded-md transition-colors text-sm ${
                  activeTab === key ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FeatherIcon icon={icon} size={16} />
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
