import { startRegistration } from '@simplewebauthn/browser'
import { useRequest } from 'ahooks'
import { useEffect, useRef, useState } from 'react'
import { FiChevronDown, FiLoader, FiShield, FiUser } from 'react-icons/fi'

import { generateRegisterOptions, verifyRegister } from '@/app/actions/webauthn'
import Alert, { type AlertImperativeHandler } from '@/components/Alert'
import { appUi } from '@/components/ui/app-tokens'
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
    <form className={appUi.pageShell} ref={formRef}>
      <div className={`${appUi.card} w-full max-w-lg`}>
        <div className="mb-8 flex flex-col items-center text-center">
          <div className={`${appUi.iconBox} mb-5`}>
            <FiShield size={18} aria-hidden />
          </div>
          <p className={`${appUi.sectionLabel} mb-2`}>Passkey / security key</p>
          <h1 className={`${appUi.pageTitle} mb-3`}>WebAuthn credential</h1>
          <p className={`${appUi.lead} max-w-md`}>Register a platform authenticator or hardware key, then export the credential JSON into your server environment.</p>
        </div>

        <div className="mb-4 space-y-1.5">
          <label htmlFor="webauthn-username" className={appUi.fieldLabel}>
            Username
          </label>
          <input
            id="webauthn-username"
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

        <div className="mb-4 space-y-1.5">
          <label htmlFor="webauthn-app-name" className={appUi.fieldLabel}>
            Display name
          </label>
          <input
            id="webauthn-app-name"
            type="text"
            className={appUi.control}
            placeholder="MacBook Touch ID"
            value={appName}
            onChange={(event) => setAppName(event.target.value)}
            required
          />
        </div>

        <div className="mb-6 space-y-1.5">
          <label htmlFor="webauthn-rpid" className={appUi.fieldLabel}>
            Relying party ID
          </label>
          <div className="relative">
            <select id="webauthn-rpid" className={`${appUi.control} appearance-none pr-9`} value={rpId} onChange={(event) => setRpId(event.target.value)} required disabled>
              {domainOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FiChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nav-icon-muted)] opacity-60" aria-hidden />
          </div>
        </div>

        <button onClick={submit} disabled={submitting} className={appUi.btnPrimary} type="button">
          {submitting ? (
            <>
              <FiLoader size={16} className="animate-spin" aria-hidden />
              Registering...
            </>
          ) : (
            <>
              <FiUser size={16} aria-hidden />
              Register credential
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
