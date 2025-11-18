'use client'

import { useRequest } from 'ahooks'
import { useRef } from 'react'

import { generateECDHKeyPair } from '@/app/actions/ecdh'
import Alert, { type AlertImperativeHandler } from '@/components/Alert'
import { Spinner } from '@/components/Spinner'

export interface FormProps {
  onGenerate: (keys: { privateKey: string; publicKey: string; publicKeyBase64: string }) => void
}

export default function Form(props: FormProps) {
  const { onGenerate } = props
  const alertRef = useRef<AlertImperativeHandler>(null)

  const { run: submit, loading: submitting } = useRequest(
    async () => {
      const keys = await generateECDHKeyPair()
      onGenerate(keys)
    },
    {
      manual: true,
      debounceWait: 500,
      onError: (error) => {
        alertRef.current?.show(error.message, { type: 'error' })
      },
    }
  )

  return (
    <form className="flex flex-col flex-1 items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Generate ECDH Key Pair</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Generate a new ECDH (Elliptic Curve Diffie-Hellman) key pair for secure OAuth token encryption.
          <br />
          The private key must be kept secret, while the public key can be safely shared.
        </p>

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          {submitting ? <Spinner /> : 'Generate Key Pair'}
        </button>

        <div className="flex flex-col gap-2 mt-2">
          <Alert ref={alertRef} />
        </div>
      </div>
    </form>
  )
}
