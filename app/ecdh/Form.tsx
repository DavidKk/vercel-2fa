'use client'

import { useRequest } from 'ahooks'
import { useRef } from 'react'
import { FiKey, FiLoader } from 'react-icons/fi'

import { generateECDHKeyPair } from '@/app/actions/ecdh'
import { gettingStartedDoc } from '@/app/getting-started/doc-tokens'
import Alert, { type AlertImperativeHandler } from '@/components/Alert'

import { toolBtnPrimary, toolPageCardNarrow, toolPageLead, toolPageShell, toolPageTitle } from './ui'

export interface FormProps {
  onGenerate: (keys: { privateKey: string; publicKey: string; publicKeyBase64: string }) => void
}

export default function Form(props: FormProps) {
  const { onGenerate } = props
  const alertRef = useRef<AlertImperativeHandler>(null)
  const d = gettingStartedDoc

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
    <div className={toolPageShell}>
      <div className={`${d.card} ${toolPageCardNarrow} flex flex-col items-center px-5 py-8 sm:px-8 sm:py-10`}>
        <div className={`${d.iconBox} mb-5`}>
          <FiKey size={18} aria-hidden />
        </div>
        <h1 className={`${toolPageTitle} mb-3`}>ECDH key pair</h1>
        <p className={`${toolPageLead} mb-8`}>
          Generate a P-256 ECDH server key pair for encrypting OAuth-style token payloads. The private key stays on the server; clients fetch the public key from{' '}
          <code className={d.codeInline}>/api/oauth/public-key</code> in production.
        </p>

        <button onClick={submit} disabled={submitting} className={toolBtnPrimary} type="button">
          {submitting ? (
            <>
              <FiLoader size={16} className="animate-spin" aria-hidden />
              Generating…
            </>
          ) : (
            <>
              <FiKey size={16} aria-hidden />
              Generate key pair
            </>
          )}
        </button>

        <div className="mt-4 flex w-full flex-col gap-2">
          <Alert ref={alertRef} />
        </div>
      </div>
    </div>
  )
}
