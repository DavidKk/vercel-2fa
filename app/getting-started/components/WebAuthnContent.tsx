import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

import { gettingStartedDoc } from '@/app/getting-started/doc-tokens'

export function WebAuthnContent() {
  const d = gettingStartedDoc

  return (
    <div className={d.article}>
      <header className="mb-10">
        <h2 className={d.h2}>WebAuthn setup</h2>
        <p className={`${d.lead} mb-3`}>
          Passkeys and platform authenticators (Touch ID, Face ID, Windows Hello, security keys) let users sign in without typing a TOTP code. This host stores one exported
          credential in <code className={d.codeInline}>ACCESS_WEBAUTHN_SECRET</code> and checks assertions on each login.
        </p>
        <p className={`${d.lead} mb-0`}>
          You can run WebAuthn-only flows when the deployment is configured for it, or keep TOTP as a backup—see{' '}
          <Link href="/getting-started/totp" className={d.link}>
            TOTP setup
          </Link>{' '}
          and{' '}
          <Link href="/getting-started/env" className={d.link}>
            Environment variables
          </Link>
          .
        </p>
      </header>

      <div className="flex flex-col gap-10">
        <section aria-labelledby="wa-rpid">
          <h3 id="wa-rpid" className={d.docSectionLabel}>
            Relying party ID (rpId)
          </h3>
          <div className={d.calloutInfo}>
            <p className={`${d.muted} mb-0`}>
              <code className={d.codeInline}>rpId</code> must equal the host users see in the address bar for that deployment (no scheme, no path). Use{' '}
              <code className={d.codeInline}>localhost</code> for local HTTP dev; production must be served over HTTPS with a hostname that exactly matches the registered
              credential. Changing hostname or moving from preview to production URL usually requires registering again and updating env.
            </p>
          </div>
        </section>

        <section aria-labelledby="wa-register">
          <h3 id="wa-register" className={d.docSectionLabel}>
            Register
          </h3>
          <div className={d.cardMuted}>
            <ol className={`${d.listDecimal} mb-4`}>
              <li>
                Open{' '}
                <Link href="/webauthn" className={d.link}>
                  /webauthn
                </Link>
              </li>
              <li>
                Username matches <code className={d.codeInline}>ACCESS_USERNAME</code>
              </li>
              <li>Pick a display name you will recognize later (for example &quot;MacBook Touch ID&quot; or &quot;YubiKey 5C&quot;)</li>
              <li>When the browser prompts, choose platform authenticator, passkey sync (if offered), or a roaming security key</li>
            </ol>
            <Link href="/webauthn" className={d.btnPrimary}>
              <FiArrowRight size={14} aria-hidden />
              Open WebAuthn tool
            </Link>
          </div>
        </section>

        <section aria-labelledby="wa-save">
          <h3 id="wa-save" className={d.docSectionLabel}>
            Save credential JSON
          </h3>
          <div className={d.card}>
            <p className={`${d.muted} mb-3`}>
              After registration, copy the exported JSON object into <code className={d.codeInline}>ACCESS_WEBAUTHN_SECRET</code> as a single line. It includes Base64 fields such
              as <code className={d.codeInline}>credentialID</code> and <code className={d.codeInline}>publicKey</code> plus <code className={d.codeInline}>rpId</code> and{' '}
              <code className={d.codeInline}>username</code> for sanity checks.
            </p>
            <div className={d.preBox}>
              {`{
  "credentialID": "...",
  "publicKey": "...",
  "rpId": "localhost",
  "username": "admin"
}`}
            </div>
            <p className={`${d.muted} mt-3 mb-0`}>
              On Vercel, paste via the dashboard or CLI; escape quotes if your shell requires it. Treat this blob like a password—anyone with it can mint assertions if they also
              know your password and can reach the login page.
            </p>
          </div>
        </section>

        <section aria-labelledby="wa-notes">
          <h3 id="wa-notes" className={d.docSectionLabel}>
            Operations & recovery
          </h3>
          <div className={d.calloutWarn}>
            <ul className={`${d.calloutWarnBody} list-disc space-y-1`}>
              <li>HTTPS is required in production; localhost is exempt for development only</li>
              <li>
                Credentials are device-bound — new laptop or browser profile needs a new registration (and env update) unless you use synced passkeys from the same platform account
              </li>
              <li>Keep TOTP configured as fallback when hardware is lost or unavailable</li>
              <li>If login fails after a domain change, re-run registration on the new origin and replace the env JSON</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
