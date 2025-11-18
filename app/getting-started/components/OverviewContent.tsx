import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'

export function OverviewContent() {
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

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-purple-100 rounded-lg p-1.5">
              <FeatherIcon icon="key" size={20} className="text-purple-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">ECDH Key Exchange</h3>
          </div>
          <p className="text-gray-600 text-xs mb-3">Secure OAuth token encryption using Elliptic Curve Diffie-Hellman.</p>
          <Link href="/ecdh" className="text-purple-600 hover:text-purple-700 text-xs font-medium">
            Generate Key Pair →
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
              <li>Generate ECDH key pair if using encrypted OAuth flow (optional)</li>
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
