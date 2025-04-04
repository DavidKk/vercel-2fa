import { useRequest } from 'ahooks'
import { useRef, useState } from 'react'
import { Spinner } from '@/components/Spinner'
import Alert, { type AlertImperativeHandler } from '@/components/Alert'
import { generate2fa } from '@/app/actions/totp'

export interface FormProps {
  onGenerate2fa: (payload: { qrCode: string; secret: string }) => void
}

export default function Form(props: FormProps) {
  const { onGenerate2fa } = props
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

      const { qrCode, secret } = await generate2fa({ username, appName })
      onGenerate2fa({ qrCode, secret })
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
        <h1 className="text-2xl font-bold mb-4 text-center">Set Up Two-Factor Authentication</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enhance your account security by setting up two-factor authentication (2FA). This will require a one-time password (OTP) from an authenticator app during login.
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
          {submitting ? <Spinner /> : 'Generate QR Code'}
        </button>

        <div className="flex flex-col gap-2 mt-2">
          <Alert ref={alertRef} />
        </div>
      </div>
    </form>
  )
}
