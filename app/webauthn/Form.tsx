import { useRequest } from 'ahooks'
import { useRef, useState } from 'react'
import { Spinner } from '@/components/Spinner'
import Alert, { type AlertImperativeHandler } from '@/components/Alert'

export interface FormProps {
  onGenerateCredential: (payload: { credential: string }) => void
}

export default function Form(props: FormProps) {
  const { onGenerateCredential } = props
  const [username, setUsername] = useState('')
  const [appName, setAppName] = useState('')

  const formRef = useRef<HTMLFormElement>(null)
  const alertRef = useRef<AlertImperativeHandler>(null)

  const { run: submit, loading: submitting } = useRequest(
    async () => {
      if (!formRef.current?.checkValidity()) {
        formRef.current?.reportValidity()
        return
      }

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32),
        rp: {
          name: appName || 'Vercel 2FA Demo',
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(16),
          name: username,
          displayName: `${appName}-${username}`,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        timeout: 60000,
        attestation: 'direct',
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
        },
      }

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })

      if (!credential) {
        throw new Error('Failed to create credential')
      }

      onGenerateCredential({
        credential: JSON.stringify(credential, null, 2),
      })
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
