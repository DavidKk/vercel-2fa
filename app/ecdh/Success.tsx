'use client'

import FeatherIcon from 'feather-icons-react'
import { useState } from 'react'

export interface SuccessProps {
  keys: {
    privateKey: string
    publicKey: string
    publicKeyBase64: string
  }
}

export default function Success(props: SuccessProps) {
  const { keys } = props
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy:', error)
    }
  }

  const formatKeyForEnv = (key: string) => {
    return key.replace(/\n/g, '\\n')
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-4xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">ECDH Key Pair Generated Successfully!</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6 text-center">Your ECDH key pair has been generated. Copy the keys below and add them to your environment variables.</p>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
          <h2 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Important Security Notice</h2>
          <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
            <li>The private key must be kept secret and never exposed</li>
            <li>Do not commit keys to version control</li>
            <li>Store keys securely in environment variables</li>
            <li>The public key is automatically shared with clients via the API endpoint</li>
          </ul>
        </div>

        {/* Private Key */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Private Key (PEM Format) - <span className="text-red-600">KEEP SECRET</span>
            </label>
            <button onClick={() => handleCopy(formatKeyForEnv(keys.privateKey), 'privateKey')} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
              {copiedField === 'privateKey' ? (
                <>
                  <FeatherIcon icon="check" size={16} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FeatherIcon icon="copy" size={16} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <code className="text-xs break-all whitespace-pre-wrap font-mono">{keys.privateKey}</code>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Add to <code className="bg-gray-100 px-1 rounded">ECDH_SERVER_PRIVATE_KEY</code> in your <code className="bg-gray-100 px-1 rounded">.env.local</code>
          </p>
        </div>

        {/* Public Key (PEM) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Public Key (PEM Format)</label>
            <button onClick={() => handleCopy(formatKeyForEnv(keys.publicKey), 'publicKey')} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
              {copiedField === 'publicKey' ? (
                <>
                  <FeatherIcon icon="check" size={16} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FeatherIcon icon="copy" size={16} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <code className="text-xs break-all whitespace-pre-wrap font-mono">{keys.publicKey}</code>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Add to <code className="bg-gray-100 px-1 rounded">ECDH_SERVER_PUBLIC_KEY</code> in your <code className="bg-gray-100 px-1 rounded">.env.local</code>
          </p>
        </div>

        {/* Environment Variable Configuration */}
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-indigo-900">.env.local Configuration</h3>
            <button
              onClick={() =>
                handleCopy(
                  `# Server-side keys (PEM format)
ECDH_SERVER_PRIVATE_KEY="${formatKeyForEnv(keys.privateKey)}"
ECDH_SERVER_PUBLIC_KEY="${formatKeyForEnv(keys.publicKey)}"`,
                  'envConfig'
                )
              }
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
              type="button"
            >
              {copiedField === 'envConfig' ? (
                <>
                  <FeatherIcon icon="check" size={14} />
                  <span className="uppercase tracking-wide">Copied</span>
                </>
              ) : (
                <>
                  <FeatherIcon icon="copy" size={14} />
                  <span className="uppercase tracking-wide">Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-xs bg-white p-3 rounded border border-indigo-200 overflow-auto">
            <code>{`# Server-side keys (PEM format)
ECDH_SERVER_PRIVATE_KEY="${formatKeyForEnv(keys.privateKey)}"
ECDH_SERVER_PUBLIC_KEY="${formatKeyForEnv(keys.publicKey)}"`}</code>
          </pre>
          <p className="text-xs text-indigo-900 mt-2">
            These values are the actual environment variables used by this project. Copy them directly into your <code className="bg-indigo-100 px-1 rounded">.env.local</code>.
            <br />
            <strong>Note:</strong> The public key is automatically shared with clients via the <code className="bg-indigo-100 px-1 rounded">/api/oauth/public-key</code> endpoint.
            No client-side environment variable is needed.
          </p>
        </div>
      </div>
    </div>
  )
}
