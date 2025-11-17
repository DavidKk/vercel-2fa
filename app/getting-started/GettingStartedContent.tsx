'use client'

import type { FeatherIconName } from 'feather-icons-react'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'
import { useState } from 'react'

type Tab = 'overview' | 'totp' | 'webauthn' | 'integration' | 'env'

export function GettingStartedContent() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs: Array<{ key: Tab; label: string; icon: FeatherIconName }> = [
    { key: 'overview', label: 'Overview', icon: 'home' },
    { key: 'totp', label: 'TOTP Setup', icon: 'smartphone' },
    { key: 'webauthn', label: 'WebAuthn Setup', icon: 'shield' },
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
          {activeTab === 'integration' && <IntegrationContent />}
          {activeTab === 'env' && <EnvironmentContent />}
        </div>
      </div>
    </div>
  )
}

function OverviewContent() {
  return (
    <div className="prose max-w-none prose-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Welcome to Your Personal Auth Hub</h2>

      <p className="text-gray-600 text-sm mb-4">
        Host one login service and reuse it across every side project. This app bundles TOTP and WebAuthn so you can protect dashboards, admin tools, and playground ideas without
        rewriting auth each time.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-indigo-100 rounded-lg p-1.5">
              <FeatherIcon icon="smartphone" size={20} className="text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">TOTP Auth</h3>
          </div>
          <p className="text-gray-600 text-xs mb-3">Works with Google Authenticator, Authy, 1Password, and more.</p>
          <Link href="/totp" className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
            Generate Secret →
          </Link>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 rounded-lg p-1.5">
              <FeatherIcon icon="shield" size={20} className="text-green-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">WebAuthn Auth</h3>
          </div>
          <p className="text-gray-600 text-xs mb-3">Use Touch ID, Face ID, Windows Hello, or hardware keys.</p>
          <Link href="/webauthn" className="text-green-600 hover:text-green-700 text-xs font-medium">
            Register Credential →
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
        <div className="flex items-start gap-2">
          <FeatherIcon icon="info" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1.5 text-sm">Quick Start Checklist</h4>
            <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
              <li>Configure env vars (username, password, JWT secret, 2FA method)</li>
              <li>Create a TOTP secret or WebAuthn credential</li>
              <li>Add allowed redirect URLs (your projects)</li>
              <li>Redirect projects to this login and verify the token</li>
            </ol>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-3">Why it helps</h3>
      <div className="space-y-3 mb-5">
        {[
          { title: 'One Auth for Everything', desc: 'Central place for all personal apps, SSO-style but self-hosted.' },
          { title: 'JWT Tokens', desc: 'Signed tokens with customizable TTL, easy to verify in any backend.' },
          { title: 'Redirect Whitelist', desc: 'Protects against open redirects; wildcard domains supported.' },
          { title: 'State / CSRF Guard', desc: 'Optional state param keeps the login flow safe.' },
        ].map(({ title, desc }) => (
          <div className="flex items-start gap-2" key={title}>
            <div className="bg-indigo-100 rounded-full p-0.5 mt-0.5 flex-shrink-0">
              <FeatherIcon icon="check" size={14} className="text-indigo-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
              <p className="text-gray-600 text-xs">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <FeatherIcon icon="alert-triangle" size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1.5 text-sm">Security Notes</h4>
            <ul className="text-xs text-yellow-800 space-y-0.5 list-disc list-inside">
              <li>Keep JWT_SECRET private and rotate when needed</li>
              <li>Use strong admin credentials in prod</li>
              <li>Only whitelist redirects you trust</li>
              <li>Prefer HTTPS everywhere (localhost is fine for dev)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function TOTPContent() {
  return (
    <div className="prose max-w-none prose-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Set up TOTP</h2>

      <p className="text-gray-600 text-sm mb-4">
        Time-based One-Time Passwords (TOTP) are the easiest way to add 2FA. Any authenticator app that supports RFC 6238 will work, so you can use the tools you already trust.
      </p>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-indigo-900 mb-2">📱 Step 1 · Generate secret</h3>
        <ol className="text-indigo-800 text-sm space-y-1 list-decimal list-inside mb-3">
          <li>
            Visit{' '}
            <Link href="/totp" className="text-indigo-600 hover:underline font-medium">
              /totp
            </Link>
          </li>
          <li>Enter the admin username (e.g. admin)</li>
          <li>Add a label so you can recognise the account (e.g. “Personal Auth”)</li>
          <li>Click Generate</li>
        </ol>
        <Link href="/totp" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm">
          <FeatherIcon icon="arrow-right" size={14} />
          open totp tool
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-blue-900 mb-2">🔑 Step 2 · Store secret</h3>
        <p className="text-blue-800 text-xs mb-3">The generator shows two important pieces of data:</p>
        <ul className="text-blue-800 space-y-1 list-disc list-inside text-xs mb-3">
          <li>
            <strong>QR Code</strong> — scan with your authenticator app
          </li>
          <li>
            <strong>Secret</strong> — copy the Base32 string into <code>ACCESS_TOTP_SECRET</code>
          </li>
        </ul>
        <div className="bg-white rounded border border-blue-200 p-3">
          <p className="text-[11px] font-mono text-gray-700 break-all">ACCESS_TOTP_SECRET=JBSWY3DPEHPK3PXP</p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-green-900 mb-2">📲 Step 3 · Pair an authenticator</h3>
        <p className="text-green-800 text-xs mb-3">Scan the QR with any app:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-green-900 text-xs">
          {['Google Authenticator', 'Microsoft Authenticator', 'Authy', '1Password'].map((app) => (
            <div key={app}>
              <div className="bg-white rounded-lg p-2 border border-green-200 mb-1">
                <FeatherIcon icon="smartphone" size={28} className="text-green-600 mx-auto" />
              </div>
              {app}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-purple-900 mb-2">✅ Step 4 · Test a code</h3>
        <ol className="text-purple-800 text-xs space-y-1 list-decimal list-inside">
          <li>Open your authenticator and copy the 6 digit code</li>
          <li>Enter it in the “Verify” section on the TOTP page</li>
          <li>Click Verify — you should see “Token is valid”</li>
        </ol>
        <p className="text-[11px] text-purple-700 mt-2">Once TOTP works you can turn it on for login.</p>
      </div>
    </div>
  )
}

function WebAuthnContent() {
  return (
    <div className="prose max-w-none prose-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Set up WebAuthn</h2>

      <p className="text-gray-600 text-sm mb-4">
        WebAuthn gives you “touch once to login” convenience using fingerprints, Face ID, Windows Hello, or hardware keys such as YubiKey. It is perfect when you want max security
        for your own admin panels.
      </p>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-indigo-900 mb-2">🔐 Step 1 · Register credential</h3>
        <ol className="text-indigo-800 text-sm space-y-1 list-decimal list-inside mb-3">
          <li>
            Open{' '}
            <Link href="/webauthn" className="text-indigo-600 hover:underline font-medium">
              /webauthn
            </Link>
          </li>
          <li>Enter username (same admin account used for login)</li>
          <li>Give it a display name (e.g. “MacBook Touch ID”)</li>
          <li>Set RP ID to the domain hosting this service (localhost in dev)</li>
          <li>Click Register and follow the browser prompt</li>
        </ol>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-blue-900 mb-2">🎯 Step 2 · Approve in the browser</h3>
        <p className="text-blue-800 text-xs mb-3">The browser lets you pick how to verify:</p>
        <ul className="text-blue-800 text-xs space-y-1 list-disc list-inside">
          <li>Biometrics (Touch ID, Face ID, Windows Hello)</li>
          <li>Security keys (YubiKey, SoloKey, etc.)</li>
          <li>Built-in platform authenticators on phones or laptops</li>
        </ul>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-green-900 mb-2">💾 Step 3 · Save the credential</h3>
        <p className="text-green-800 text-xs mb-3">After registration you get a JSON blob:</p>
        <div className="bg-white rounded border border-green-200 p-3 mb-2">
          <pre className="text-[11px] font-mono text-gray-700 whitespace-pre-wrap break-all">
            {`{
  "id": "...",
  "publicKey": "...",
  "counter": 0,
  "rpId": "localhost"
}`}
          </pre>
        </div>
        <p className="text-[11px] text-green-700 mb-2">Copy everything into ACCESS_WEBAUTHN_SECRET.</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-yellow-900 mb-2">⚠️ Notes</h3>
        <ul className="text-yellow-800 text-xs space-y-1 list-disc list-inside">
          <li>RP ID must match your production domain exactly</li>
          <li>HTTPS is required in production (localhost is exempt)</li>
          <li>Credentials are bound to a device — re-register when you switch laptops</li>
          <li>Keep TOTP enabled as a fallback in case hardware keys are unavailable</li>
        </ul>
      </div>
    </div>
  )
}

function IntegrationContent() {
  return (
    <div className="prose max-w-none prose-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Integrate with Your Projects</h2>

      <p className="text-gray-600 text-sm mb-4">
        Every project simply redirects to this login page, waits for the JWT callback, and then verifies it. No more re-building auth for each repo.
      </p>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-indigo-900 mb-2">🔄 Flow overview</h3>
        <div className="space-y-3 text-sm text-indigo-800">
          {[
            { step: '1', title: 'Redirect user', desc: 'Send users to /login?redirectUrl=your-app&state=uuid' },
            { step: '2', title: 'Complete 2FA', desc: 'User enters credentials plus TOTP/WebAuthn' },
            { step: '3', title: 'Receive JWT', desc: 'Service redirects back with token + state' },
            { step: '4', title: 'Verify', desc: 'Your app validates the token and creates its own session' },
          ].map(({ step, title, desc }) => (
            <div className="flex items-start gap-3" key={step}>
              <div className="bg-indigo-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-indigo-900">{step}</div>
              <div>
                <h4 className="font-semibold text-indigo-900 text-sm">{title}</h4>
                <p className="text-[11px]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-blue-900 mb-2">Option A · Shared secret</h3>
          <p className="text-blue-800 text-xs mb-3">Use the same JWT secret inside your project:</p>
          <div className="bg-white rounded border border-blue-200 p-3 mb-2">
            <pre className="text-[11px] font-mono text-gray-700 whitespace-pre-wrap">
              {`import jwt from 'jsonwebtoken'

const payload = jwt.verify(token, process.env.JWT_SECRET)
if (payload?.authenticated) {
  // create your local session
}`}
            </pre>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <FeatherIcon icon="check-circle" size={14} />
            <span>Fastest and simplest</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-green-900 mb-2">Option B · Verify API</h3>
          <p className="text-green-800 text-xs mb-3">When you cannot share secrets, call the verify endpoint:</p>
          <div className="bg-white rounded border border-green-200 p-3 mb-2">
            <pre className="text-[11px] font-mono text-gray-700 whitespace-pre-wrap">
              {`const res = await fetch('https://your-2fa-domain.com/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
})
const data = await res.json()
if (data.code === 0 && data.data.valid) {
  // trusted login
}`}
            </pre>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-700">
            <FeatherIcon icon="shield" size={14} />
            <span>No key sharing required</span>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-purple-900 mb-2">📝 React example</h3>
        <div className="space-y-3 text-[11px] text-purple-900 font-mono bg-white rounded border border-purple-200 p-3">
          <div>
            <p className="mb-1 font-sans text-xs text-purple-700 font-semibold">Launch login:</p>
            <pre className="whitespace-pre-wrap">{`function handleLogin() {
  const state = crypto.randomUUID()
  sessionStorage.setItem('oauth_state', state)

  const callback = window.location.origin + '/auth/callback'
  const url = \`https://auth.example.com/login?\${new URLSearchParams({
    redirectUrl: callback,
    state,
  })}\`

  window.location.href = url
}`}</pre>
          </div>
          <div>
            <p className="mb-1 font-sans text-xs text-purple-700 font-semibold">Handle callback:</p>
            <pre className="whitespace-pre-wrap">{`function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const state = params.get('state')

    if (state !== sessionStorage.getItem('oauth_state')) throw new Error('Invalid state')
    sessionStorage.removeItem('oauth_state')

    verifyTokenAndCreateSession(token)
  }, [])

  return <div>Signing you in...</div>
}`}</pre>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-yellow-900 mb-2">🔒 Best practices</h3>
        <ul className="text-yellow-800 text-xs space-y-1 list-disc list-inside">
          <li>Whitelist only domains you control via ALLOWED_REDIRECT_URLS</li>
          <li>Generate a fresh state value for every login attempt</li>
          <li>Use short-lived tokens (defaults to 5 minutes) then create local sessions</li>
          <li>Serve everything over HTTPS in production</li>
        </ul>
      </div>
    </div>
  )
}

function EnvironmentContent() {
  return (
    <div className="prose max-w-none prose-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Environment variables</h2>

      <p className="text-gray-600 text-sm mb-4">
        Drop these into your <code>.env.local</code> or hosting provider.
      </p>

      <div className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <FeatherIcon icon="alert-circle" size={18} className="text-red-600" />
            <h3 className="text-base font-semibold text-gray-900">Required</h3>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { key: 'ACCESS_USERNAME', desc: 'Admin username (used on the login form)', example: 'admin' },
              { key: 'ACCESS_PASSWORD', desc: 'Strong admin password', example: 'your-secure-password' },
              { key: 'JWT_SECRET', desc: 'At least 32 chars, used to sign tokens', example: 'your-super-secret-jwt-key-minimum-32-characters' },
            ].map(({ key, desc, example }) => (
              <div key={key}>
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{key}</code>
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">required</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{desc}</p>
                <div className="bg-gray-50 rounded p-2">
                  <code className="text-[11px] text-gray-700 break-all">
                    {key}={example}
                  </code>
                </div>
              </div>
            ))}
            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-[11px] text-blue-800">
              Generate a secure JWT secret:
              <br />
              <code>node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"</code>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <FeatherIcon icon="shield" size={18} className="text-indigo-600" />
            <h3 className="text-base font-semibold text-gray-900">2FA providers (pick at least one)</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">ACCESS_TOTP_SECRET</code>
                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">optional</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Base32 TOTP secret generated from the /totp page.</p>
              <div className="bg-gray-50 rounded p-2 mb-1">
                <code className="text-[11px] text-gray-700">ACCESS_TOTP_SECRET=JBSWY3DPEHPK3PXP</code>
              </div>
              <Link href="/totp" className="text-[11px] text-indigo-600 hover:underline">
                → open totp generator
              </Link>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">ACCESS_WEBAUTHN_SECRET</code>
                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">optional</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Full JSON credential saved from the /webauthn registration flow.</p>
              <div className="bg-gray-50 rounded p-2 mb-1">
                <code className="text-[11px] text-gray-700 break-all">{'ACCESS_WEBAUTHN_SECRET={"id":"...","publicKey":"...","rpId":"..."}'}</code>
              </div>
              <Link href="/webauthn" className="text-[11px] text-indigo-600 hover:underline">
                → open webauthn tool
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <FeatherIcon icon="settings" size={18} className="text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">Optional tweaks</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">JWT_EXPIRES_IN</code>
                <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">optional</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Override token lifetime (defaults to 30d). Supports values like 5m, 1h, 7d.</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">ALLOWED_REDIRECT_URLS</code>
                <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">optional</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Comma-separated whitelist for redirectUrl. Wildcards like https://*.example.com are supported.</p>
              <div className="bg-gray-50 rounded p-2 mb-1">
                <code className="text-[11px] text-gray-700 break-all">ALLOWED_REDIRECT_URLS=https://app1.test,https://app2.test,https://*.dev.local</code>
              </div>
              <p className="text-[10px] text-gray-500">If omitted only relative paths (same origin) are allowed.</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FeatherIcon icon="alert-triangle" size={18} className="text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1 text-sm">Tips</h4>
              <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                <li>Never commit your .env files — use secrets in Vercel/Fly/Docker</li>
                <li>Rotate JWT_SECRET when collaborators leave</li>
                <li>Add different env files per environment (dev/staging/prod)</li>
                <li>Keep backups of TOTP/WebAuthn values in a safe password manager</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
