'use client'

import { useEffect, useState } from 'react'

import { exportPrivateKey, exportPublicKey, generateECDHKeyPair } from '@/utils/ecdh-client'

const CLIENT_PUBLIC_KEY_STORAGE = 'oauth_client_public_key'
const CLIENT_PRIVATE_KEY_STORAGE = 'oauth_client_private_key'

export function ECDHKeyPair() {
  const [temporaryPublicKey, setTemporaryPublicKey] = useState<string | null>(null)
  const [temporaryPrivateKey, setTemporaryPrivateKey] = useState<string | null>(null)
  const [generatingKeys, setGeneratingKeys] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const existingPublicKey = sessionStorage.getItem(CLIENT_PUBLIC_KEY_STORAGE)
    const existingPrivateKey = sessionStorage.getItem(CLIENT_PRIVATE_KEY_STORAGE)

    if (existingPublicKey && existingPrivateKey) {
      setTemporaryPublicKey(existingPublicKey)
      setTemporaryPrivateKey(existingPrivateKey)
    }
  }, [])

  const handleGenerateKeys = async () => {
    setGeneratingKeys(true)
    try {
      const keyPair = await generateECDHKeyPair()
      const publicKeyBase64 = await exportPublicKey(keyPair)
      const privateKeyBase64 = await exportPrivateKey(keyPair)
      sessionStorage.setItem(CLIENT_PUBLIC_KEY_STORAGE, publicKeyBase64)
      sessionStorage.setItem(CLIENT_PRIVATE_KEY_STORAGE, privateKeyBase64)
      setTemporaryPublicKey(publicKeyBase64)
      setTemporaryPrivateKey(privateKeyBase64)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to generate temporary key pair', err)
    } finally {
      setGeneratingKeys(false)
    }
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-gray-900">ECDH Key Pair</h2>
        <p className="text-xs text-gray-500">Auto-generated on login, or create manually.</p>
      </div>

      <button
        type="button"
        onClick={handleGenerateKeys}
        disabled={generatingKeys}
        className="w-full bg-indigo-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generatingKeys ? 'Generating...' : 'Generate New Key Pair'}
      </button>

      <div className="flex flex-col gap-2 text-xs">
        <div className="flex flex-col gap-1">
          <label className="text-gray-500">Public Key</label>
          <pre className="rounded-md bg-gray-900 text-gray-100 px-3 py-2 text-sm overflow-auto break-all max-h-24">{temporaryPublicKey || 'Not generated yet'}</pre>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-gray-500">Private Key</label>
          <pre className="rounded-md bg-gray-900 text-gray-100 px-3 py-2 text-sm overflow-auto break-all max-h-24">{temporaryPrivateKey || 'Not generated yet'}</pre>
        </div>
      </div>
    </section>
  )
}
