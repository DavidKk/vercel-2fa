import { useRequest } from 'ahooks'
import { useRef, useState } from 'react'
import { FiLoader, FiSmartphone, FiUser } from 'react-icons/fi'

import Alert, { type AlertImperativeHandler } from '@/components/Alert'
import { appUi } from '@/components/ui/app-tokens'
import { generateTOTPSecret } from '@/utils/totp'

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

      const { qrCode, secret } = await generateTOTPSecret({ username, appName })
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
    <form className={appUi.pageShell} ref={formRef}>
      <div className={`${appUi.card} w-full max-w-lg`}>
        <div className="mb-8 flex flex-col items-center text-center">
          <div className={`${appUi.iconBox} mb-5`}>
            <FiSmartphone size={18} aria-hidden />
          </div>
          <p className={`${appUi.sectionLabel} mb-2`}>Authenticator app</p>
          <h1 className={`${appUi.pageTitle} mb-3`}>TOTP QR code</h1>
          <p className={`${appUi.lead} max-w-md`}>
            Generate a Base32 secret and QR code for the same account you use to sign in. Store the secret in your server environment after pairing.
          </p>
        </div>

        <div className="mb-4 space-y-1.5">
          <label htmlFor="totp-username" className={appUi.fieldLabel}>
            Username
          </label>
          <input
            id="totp-username"
            type="text"
            className={appUi.control}
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoComplete="username"
            autoFocus
          />
        </div>

        <div className="mb-6 space-y-1.5">
          <label htmlFor="totp-app-name" className={appUi.fieldLabel}>
            App name
          </label>
          <input
            id="totp-app-name"
            type="text"
            className={appUi.control}
            placeholder="Personal auth"
            value={appName}
            onChange={(event) => setAppName(event.target.value)}
            required
          />
        </div>

        <button onClick={submit} disabled={submitting} className={appUi.btnPrimary} type="button">
          {submitting ? (
            <>
              <FiLoader size={16} className="animate-spin" aria-hidden />
              Generating...
            </>
          ) : (
            <>
              <FiUser size={16} aria-hidden />
              Generate QR code
            </>
          )}
        </button>

        <div className="mt-4 flex flex-col gap-2">
          <Alert ref={alertRef} />
        </div>
      </div>
    </form>
  )
}
