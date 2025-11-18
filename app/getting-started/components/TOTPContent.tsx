import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'

export function TOTPContent() {
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
          <li>Add a label so you can recognise the account (e.g. "Personal Auth")</li>
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
          <li>Enter it in the "Verify" section on the TOTP page</li>
          <li>Click Verify — you should see "Token is valid"</li>
        </ol>
        <p className="text-[11px] text-purple-700 mt-2">Once TOTP works you can turn it on for login.</p>
      </div>
    </div>
  )
}
