import { useMemo } from 'react'
import { FiAlertTriangle, FiCheck, FiCopy, FiShield } from 'react-icons/fi'

import { appUi } from '@/components/ui/app-tokens'
import { credentialsToString, type StoreCredentials } from '@/services/webauthn'

export interface SuccessProps {
  credentials: StoreCredentials
  onVerify: () => void
}

export default function Success(props: SuccessProps) {
  const { credentials, onVerify } = props

  const credentialStr = useMemo(() => {
    if (!credentials) {
      return ''
    }

    return credentialsToString(credentials)
  }, [credentials])

  return (
    <div className={appUi.pageShell}>
      <div className={`${appUi.card} w-full max-w-2xl`}>
        <div className="mb-8 flex flex-col items-center text-center">
          <div className={`${appUi.iconBox} mb-5`}>
            <FiCheck size={18} aria-hidden />
          </div>
          <p className={`${appUi.sectionLabel} mb-2`}>Registered</p>
          <h1 className={`${appUi.pageTitle} mb-3`}>WebAuthn setup complete</h1>
          <p className={`${appUi.lead} max-w-md`}>Your credential is ready. Save the exported JSON in your server environment before enabling WebAuthn login.</p>
        </div>

        <div className={`${appUi.calloutInfo} mb-5`}>
          <div className="mb-3 flex items-center gap-2">
            <FiShield size={18} className="text-[var(--nav-brand-text)]" aria-hidden />
            <h2 className={appUi.panelTitle}>Important information</h2>
          </div>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-[var(--app-header-text)]">
            <li>Your device is now registered for WebAuthn authentication</li>
            <li>You can use biometric or security key authentication</li>
            <li>Make sure to keep your device secure</li>
          </ul>
        </div>

        <div className="mb-5 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={appUi.fieldLabel}>Credential JSON</span>
            <span className={appUi.badgeDanger}>Secret</span>
          </div>
          <pre className={appUi.codeBlock}>
            <code className="break-all whitespace-pre-wrap">{credentialStr}</code>
          </pre>
        </div>

        <div className={`${appUi.calloutWarn} mb-6`}>
          <div className="mb-2 flex items-center gap-2">
            <FiAlertTriangle size={18} className={appUi.warnTitle} aria-hidden />
            <span className={appUi.warnTitle}>Store securely</span>
          </div>
          <p className={appUi.warnBody}>
            Paste this JSON into <code className={appUi.codeInline}>ACCESS_WEBAUTHN_SECRET</code>. Treat it like a credential and keep it out of repositories.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={onVerify} className={appUi.btnPrimary} type="button">
            <FiCheck size={16} aria-hidden />
            Verify authentication
          </button>
          <button onClick={() => navigator.clipboard.writeText(credentialStr)} className={appUi.btnSecondary} type="button">
            <FiCopy size={16} aria-hidden />
            Copy JSON
          </button>
        </div>
      </div>
    </div>
  )
}
