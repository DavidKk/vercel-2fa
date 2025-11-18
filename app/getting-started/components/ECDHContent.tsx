import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'

export function ECDHContent() {
  return (
    <div className="prose max-w-none prose-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Set up ECDH Key Exchange</h2>

      <p className="text-gray-600 text-sm mb-4">
        ECDH (Elliptic Curve Diffie-Hellman) enables secure OAuth token encryption. The server generates a permanent key pair, and clients use temporary keys to establish encrypted
        communication channels.
      </p>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-indigo-900 mb-2">🔑 Step 1 · Generate key pair</h3>
        <ol className="text-indigo-800 text-sm space-y-1 list-decimal list-inside mb-3">
          <li>
            Visit{' '}
            <Link href="/ecdh" className="text-indigo-600 hover:underline font-medium">
              /ecdh
            </Link>
          </li>
          <li>Click "Generate Key Pair"</li>
          <li>Wait for the system to generate a new ECDH key pair</li>
        </ol>
        <Link href="/ecdh" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm">
          <FeatherIcon icon="arrow-right" size={14} />
          open ecdh tool
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-blue-900 mb-2">💾 Step 2 · Store private key</h3>
        <p className="text-blue-800 text-xs mb-3">After generation, you'll see three key values. For production, you only need the private key:</p>
        <ul className="text-blue-800 space-y-1 list-disc list-inside text-xs mb-3">
          <li>
            <strong>Private Key (PEM Format)</strong> — Copy into <code>ECDH_SERVER_PRIVATE_KEY</code> (required for production)
          </li>
          <li>
            <strong>Public Key (PEM Format)</strong> — Only needed for debugging, copy into <code>ECDH_SERVER_PUBLIC_KEY</code>
          </li>
          <li>
            <strong>Public Key (Base64 SPKI Format)</strong> — Only needed for debugging, copy into <code>NEXT_PUBLIC_ECDH_SERVER_PUBLIC_KEY</code>
          </li>
        </ul>
        <div className="bg-white rounded border border-blue-200 p-3">
          <p className="text-[11px] font-mono text-gray-700 break-all">ECDH_SERVER_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"</p>
        </div>
        <p className="text-[11px] text-blue-700 mt-2">
          <strong>Note:</strong> The public keys are only needed for debugging. In production, only the private key is required. The public key is shared with clients separately.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h3 className="text-base font-semibold text-green-900 mb-2">🔐 Step 3 · How it works</h3>
        <p className="text-green-800 text-xs mb-3">ECDH enables secure token encryption:</p>
        <ol className="text-green-800 text-xs space-y-1 list-decimal list-inside">
          <li>Client generates a temporary key pair in the browser</li>
          <li>Client sends its public key to the server</li>
          <li>Server uses its private key + client's public key to derive a shared secret</li>
          <li>Server encrypts the OAuth token with the shared secret</li>
          <li>Client decrypts the token using its temporary private key</li>
        </ol>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-yellow-900 mb-2">⚠️ Important Notes</h3>
        <ul className="text-yellow-800 text-xs space-y-1 list-disc list-inside">
          <li>Keep the private key secret — never expose or commit to version control</li>
          <li>Public keys are safe to share — they cannot be used to derive the private key</li>
          <li>
            For production, only <code>ECDH_SERVER_PRIVATE_KEY</code> is required
          </li>
          <li>
            The public keys (<code>ECDH_SERVER_PUBLIC_KEY</code> and <code>NEXT_PUBLIC_ECDH_SERVER_PUBLIC_KEY</code>) are only needed for debugging
          </li>
          <li>Rotate keys periodically for enhanced security</li>
        </ul>
      </div>
    </div>
  )
}
