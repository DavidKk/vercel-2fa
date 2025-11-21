'use client'

import { useOAuthFlowContext } from '@/services/oauth/client'

export function ECDHKeyPair() {
  const { keyPair } = useOAuthFlowContext()
  const { publicKey, privateKey, loading, error, generate } = keyPair

  const handleGenerateKeys = async () => {
    try {
      await generate()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to generate temporary key pair', err)
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
        disabled={loading}
        className="w-full bg-indigo-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generating...' : 'Generate New Key Pair'}
      </button>

      <div className="flex flex-col gap-2 text-xs">
        <div className="flex flex-col gap-1">
          <label className="text-gray-500">Public Key</label>
          {error && <span className="text-xs text-red-600">{error}</span>}
          <pre className="rounded-md bg-gray-900 text-gray-100 px-3 py-2 text-sm overflow-auto break-all max-h-24">{publicKey || 'Not generated yet'}</pre>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-gray-500">Private Key</label>
          <pre className="rounded-md bg-gray-900 text-gray-100 px-3 py-2 text-sm overflow-auto break-all max-h-24">{privateKey || 'Not generated yet'}</pre>
        </div>
      </div>
    </section>
  )
}
