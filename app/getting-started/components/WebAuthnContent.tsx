import Link from 'next/link'

export function WebAuthnContent() {
  return (
    <div className="prose max-w-none prose-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Set up WebAuthn</h2>

      <p className="text-gray-600 text-sm mb-4">
        WebAuthn gives you "touch once to login" convenience using fingerprints, Face ID, Windows Hello, or hardware keys such as YubiKey. It is perfect when you want max security
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
          <li>Give it a display name (e.g. "MacBook Touch ID")</li>
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
