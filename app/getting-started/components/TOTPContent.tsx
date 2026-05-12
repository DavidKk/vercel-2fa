import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

import { gettingStartedDoc } from '@/app/getting-started/doc-tokens'

export function TOTPContent() {
  const d = gettingStartedDoc

  return (
    <div className={d.article}>
      <header className="mb-10">
        <h2 className={d.h2}>TOTP setup</h2>
        <p className={`${d.lead} mb-3`}>
          RFC 6238 time-based one-time passwords work with any authenticator app (Google Authenticator, Microsoft Authenticator, Authy, 1Password, and others). You generate a
          secret once, store it in the server environment, pair your phone, then confirm codes on the tool page before relying on login.
        </p>
        <p className={`${d.lead} mb-0`}>
          At least one second factor is required for this deployment: configure TOTP here, or WebAuthn in{' '}
          <Link href="/getting-started/webauthn" className={d.link}>
            WebAuthn setup
          </Link>
          , or both for redundancy.
        </p>
      </header>

      <div className="flex flex-col gap-10">
        <section aria-labelledby="totp-prereq">
          <h3 id="totp-prereq" className={d.docSectionLabel}>
            Prerequisites
          </h3>
          <div className={d.calloutInfo}>
            <ul className={`${d.listDisc} mb-0`}>
              <li>
                <code className={d.codeInline}>ACCESS_USERNAME</code> and <code className={d.codeInline}>ACCESS_PASSWORD</code> must already be set so the TOTP tool can bind the
                secret to the same admin identity as login.
              </li>
              <li>Server and phone clocks should be accurate within a typical 30-second window; large drift causes valid-looking codes to fail.</li>
            </ul>
          </div>
        </section>

        <section aria-labelledby="totp-generate">
          <h3 id="totp-generate" className={d.docSectionLabel}>
            Generate
          </h3>
          <div className={d.cardMuted}>
            <ol className={`${d.listDecimal} mb-4`}>
              <li>
                Open{' '}
                <Link href="/totp" className={d.link}>
                  /totp
                </Link>
              </li>
              <li>
                Use the same admin username as <code className={d.codeInline}>ACCESS_USERNAME</code>
              </li>
              <li>Add a label (for example &quot;Personal auth&quot;) so you can tell this entry apart in your authenticator</li>
              <li>Click Generate — the page shows a QR and a Base32 secret string</li>
            </ol>
            <Link href="/totp" className={d.btnPrimary}>
              <FiArrowRight size={14} aria-hidden />
              Open TOTP tool
            </Link>
          </div>
        </section>

        <section aria-labelledby="totp-store">
          <h3 id="totp-store" className={d.docSectionLabel}>
            Store & pair
          </h3>
          <div className={d.card}>
            <p className={`${d.muted} mb-3`}>
              Scan the QR with your authenticator, or type the Base32 secret manually. The secret never leaves your control if you only paste it into env and your password manager—
              do not embed it in client-side code or public repos.
            </p>
            <p className={`${d.muted} mb-3`}>
              Put the secret string into <code className={d.codeInline}>ACCESS_TOTP_SECRET</code> (single line, no spaces). See{' '}
              <Link href="/getting-started/env" className={d.link}>
                Environment variables
              </Link>{' '}
              for the full list of keys.
            </p>
            <div className={d.preBox}>
              <span className="text-[var(--app-header-text)]">Example · </span>
              ACCESS_TOTP_SECRET=JBSWY3DPEHPK3PXP
            </div>
          </div>
        </section>

        <section aria-labelledby="totp-test">
          <h3 id="totp-test" className={d.docSectionLabel}>
            Test & go live
          </h3>
          <div className={d.cardMuted}>
            <ol className={`${d.listDecimal} mb-4`}>
              <li>Redeploy or restart your dev server so the new env is picked up</li>
              <li>
                Copy the 6-digit code from your authenticator and use Verify on <code className={d.codeInline}>/totp</code>
              </li>
              <li>
                Complete a full{' '}
                <Link href="/login" className={d.link}>
                  /login
                </Link>{' '}
                run-through with password + TOTP before pointing production apps at this host
              </li>
            </ol>
            <p className={`${d.muted} mb-0`}>
              If verification fails immediately after pairing, wait for the next 30s window, confirm the account in the app matches this site label, and check system time on both
              devices.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
