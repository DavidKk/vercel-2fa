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
  const [decodedBase64, setDecodedBase64] = useState<string>('')
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const [isDecoding, setDecoding] = useState(false)

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

  const handleDecodeBase64 = async () => {
    try {
      setDecoding(true)
      if (!keys.publicKeyBase64) {
        throw new Error('Public key is empty')
      }

      const cleaned = keys.publicKeyBase64.trim()
      const decoded = atob(cleaned)
      setDecodedBase64(decoded)
      setDecodeError(null)

      const container = document.querySelector<HTMLElement>('.ecdh-decode-result')
      if (container) {
        requestAnimationFrame(() => {
          container.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setDecodeError(`[ECDH] Failed to decode base64 public key: ${message}`)
      setDecodedBase64('')
      // eslint-disable-next-line no-console
      console.error('[ECDH] Failed to decode base64 public key:', error)
    } finally {
      setDecoding(false)
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
            <li>The public key (base64) is safe to expose in client-side code</li>
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

        {/* Public Key (Base64) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Public Key (Base64 SPKI Format) - Client-side</label>
            <div className="flex items-center gap-3">
              <button onClick={() => handleDecodeBase64()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700" type="button" disabled={isDecoding}>
                {isDecoding ? (
                  <>
                    <FeatherIcon icon="loader" size={16} className="animate-spin" />
                    <span>Decoding...</span>
                  </>
                ) : (
                  <>
                    <FeatherIcon icon="code" size={16} />
                    <span>Decode Base64</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleCopy(keys.publicKeyBase64, 'publicKeyBase64')}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                type="button"
              >
                {copiedField === 'publicKeyBase64' ? (
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
          </div>
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <code className="text-xs break-all font-mono">{keys.publicKeyBase64}</code>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Add to <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_ECDH_SERVER_PUBLIC_KEY</code> in your <code className="bg-gray-100 px-1 rounded">.env.local</code>
          </p>
          {decodedBase64 && (
            <div className="ecdh-decode-result mt-3 bg-green-50 border border-green-200 p-3 rounded-md">
              <p className="text-xs font-medium text-green-800 mb-1">Decoded Result (PEM preview)</p>
              <pre className="text-xs text-green-900 whitespace-pre-wrap break-all">{decodedBase64}</pre>
            </div>
          )}
          {decodeError && (
            <div className="mt-3 bg-red-50 border border-red-200 p-3 rounded-md">
              <p className="text-xs font-medium text-red-800 mb-1">Decode Failed</p>
              <p className="text-xs text-red-700 break-all">{decodeError}</p>
            </div>
          )}
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
ECDH_SERVER_PUBLIC_KEY="${formatKeyForEnv(keys.publicKey)}"

# Client-side public key (base64 SPKI format)
NEXT_PUBLIC_ECDH_SERVER_PUBLIC_KEY="${keys.publicKeyBase64}"`,
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
ECDH_SERVER_PUBLIC_KEY="${formatKeyForEnv(keys.publicKey)}"

# Client-side public key (base64 SPKI format)
NEXT_PUBLIC_ECDH_SERVER_PUBLIC_KEY="${keys.publicKeyBase64}"`}</code>
          </pre>
          <p className="text-xs text-indigo-900 mt-2">
            These values are the actual environment variables used by this project. Copy them directly into your <code className="bg-indigo-100 px-1 rounded">.env.local</code>.
          </p>
        </div>
      </div>
    </div>
  )
}
