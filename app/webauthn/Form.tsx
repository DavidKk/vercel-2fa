import { startRegistration } from '@simplewebauthn/browser'
import { useRequest } from 'ahooks'
import { ChevronDown } from 'feather-icons-react'
import { useEffect, useRef, useState } from 'react'

import { generateRegisterOptions, verifyRegister } from '@/app/actions/webauthn'
import Alert, { type AlertImperativeHandler } from '@/components/Alert'
import { Spinner } from '@/components/Spinner'
import type { StoreCredentials } from '@/services/webauthn'

export interface FormProps {
  onGenerateCredential: (credentials: StoreCredentials) => void
}

export default function Form(props: FormProps) {
  const { onGenerateCredential } = props
  const [username, setUsername] = useState('')
  const [appName, setAppName] = useState('')
  const [rpId, setRpId] = useState('')

  const formRef = useRef<HTMLFormElement>(null)
  const alertRef = useRef<AlertImperativeHandler>(null)

  const [domainOptions, setDomainOptions] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    const hostname = window.location.hostname
    const options = [{ value: hostname, label: hostname }]
    setDomainOptions(options)

    if (options.length > 0) {
      setRpId(options[0].value)
    }
  }, [])

  const { run: submit, loading: submitting } = useRequest(
    async () => {
      if (!formRef.current?.checkValidity()) {
        formRef.current?.reportValidity()
        return
      }

      const options = await generateRegisterOptions({ appName, rpId, username })
      const credential = await startRegistration({ optionsJSON: options })
      const challenge = options.challenge
      const expectedOrigin = window.location.origin
      const result = await verifyRegister({ challenge, credential, expectedOrigin, expectedRPID: rpId })
      const { credentialID, publicKey } = result
      onGenerateCredential({ credentialID, publicKey, rpId, username })
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
    <form className="flex flex-col flex-1 items-center justify-center p-4 bg-gray-100" ref={formRef}>
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Set Up WebAuthn Authentication</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enhance your account security by setting up WebAuthn authentication. This will allow you to use biometric or security key authentication.
        </p>

        <div className="mb-4">
          <input
            type="text"
            className="w-full flex-grow h-12 text-sm border rounded-md box-border px-3"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoComplete="username"
            autoFocus
          />
        </div>

        <div className="mb-4">
          <input
            type="text"
            className="w-full flex-grow h-12 text-sm border rounded-md box-border px-3"
            placeholder="App Name"
            value={appName}
            onChange={(event) => setAppName(event.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <div className="relative">
            <select
              className="w-full flex-grow h-12 text-sm border rounded-md box-border px-3 appearance-none disabled:text-gray-500 cursor-not-allowed"
              value={rpId}
              onChange={(event) => setRpId(event.target.value)}
              required
              disabled
            >
              {domainOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 opacity-[0.3]" />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          {submitting ? <Spinner /> : 'Generate WebAuthn Credential'}
        </button>

        <div className="flex flex-col gap-2 mt-2">
          <Alert ref={alertRef} />
        </div>
      </div>
    </form>
  )
}
