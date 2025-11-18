import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'

export function EnvironmentContent() {
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

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <FeatherIcon icon="key" size={18} className="text-purple-600" />
            <h3 className="text-base font-semibold text-gray-900">ECDH Key Exchange (for encrypted OAuth flow)</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">ECDH_SERVER_PRIVATE_KEY</code>
                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">required if using ECDH</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                Server's ECDH private key (PEM format) for secure token encryption. Required for production if using ECDH-encrypted OAuth flow.
              </p>
              <div className="bg-gray-50 rounded p-2 mb-1">
                <code className="text-[11px] text-gray-700 break-all">ECDH_SERVER_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"</code>
              </div>
              <Link href="/ecdh" className="text-[11px] text-indigo-600 hover:underline">
                → open ecdh key generator
              </Link>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">ECDH_SERVER_PUBLIC_KEY</code>
                <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">debug only</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Server's ECDH public key (PEM format) for debugging. Not required for production - only needed for local testing.</p>
              <div className="bg-gray-50 rounded p-2 mb-1">
                <code className="text-[11px] text-gray-700 break-all">ECDH_SERVER_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"</code>
              </div>
              <p className="text-[10px] text-gray-500">Only needed for debugging. In production, only the private key is required.</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">NEXT_PUBLIC_ECDH_SERVER_PUBLIC_KEY</code>
                <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">debug only</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                Server's ECDH public key (base64 SPKI format) for client-side debugging. Not required for production - only needed for local testing.
              </p>
              <div className="bg-gray-50 rounded p-2 mb-1">
                <code className="text-[11px] text-gray-700 break-all">NEXT_PUBLIC_ECDH_SERVER_PUBLIC_KEY="base64-encoded-spki-format-public-key"</code>
              </div>
              <p className="text-[10px] text-gray-500">Only needed for debugging. In production, the public key is shared with clients separately.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-[11px] text-blue-800">
              <strong>Note:</strong> For production, only <code>ECDH_SERVER_PRIVATE_KEY</code> is required. The public keys are only needed for local debugging and testing.
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
                <li>For ECDH, only store the private key in production — public keys are for debugging only</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
