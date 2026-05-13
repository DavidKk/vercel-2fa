import { FiAlertTriangle, FiCheckCircle, FiCopy, FiSmartphone } from 'react-icons/fi'

import { appUi } from '@/components/ui/app-tokens'

export interface QrcodeProps {
  qrCode: string
  secret: string
  onVerify: () => void
}

export default function Qrcode(props: QrcodeProps) {
  const { qrCode, secret, onVerify } = props

  return (
    <div className={appUi.pageShell}>
      <div className={`${appUi.card} w-full max-w-lg`}>
        <div className="mb-8 flex flex-col items-center text-center">
          <div className={`${appUi.iconBox} mb-5`}>
            <FiSmartphone size={18} aria-hidden />
          </div>
          <p className={`${appUi.sectionLabel} mb-2`}>Pair device</p>
          <h1 className={`${appUi.pageTitle} mb-3`}>Scan TOTP QR code</h1>
          <p className={`${appUi.lead} max-w-md`}>Add this account to your authenticator app, then keep the secret in your server environment.</p>
        </div>

        <div className={`${appUi.cardMuted} mb-5 flex flex-col items-center p-5`}>
          <img src={qrCode} alt="QR code for authenticator app pairing" className="size-56 rounded-lg bg-white p-3 shadow-sm" />
        </div>

        <div className={`${appUi.calloutWarn} mb-5`}>
          <div className="mb-2 flex items-center gap-2">
            <FiAlertTriangle size={18} className={appUi.warnTitle} aria-hidden />
            <span className={appUi.warnTitle}>Store securely</span>
          </div>
          <p className={appUi.warnBody}>
            This secret can generate valid one-time passwords. Store it in <code className={appUi.codeInline}>ACCESS_TOTP_SECRET</code> and do not commit it.
          </p>
        </div>

        <div className="mb-6 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className={appUi.fieldLabel}>Secret</span>
            <span className={appUi.badge}>Base32</span>
          </div>
          <div className={`${appUi.codeBlock} max-h-none break-all`}>{secret}</div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={onVerify} className={appUi.btnPrimary} type="button">
            <FiCheckCircle size={16} aria-hidden />
            Verify authentication
          </button>
          <button onClick={() => navigator.clipboard.writeText(secret)} className={appUi.btnSecondary} type="button">
            <FiCopy size={16} aria-hidden />
            Copy secret
          </button>
        </div>
      </div>
    </div>
  )
}
