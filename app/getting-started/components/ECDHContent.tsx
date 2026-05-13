import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

import { gettingStartedDoc } from '@/app/getting-started/doc-tokens'

export function ECDHContent() {
  const d = gettingStartedDoc

  return (
    <div className={d.article}>
      <header className="mb-10">
        <h2 className={d.h2}>ECDH for encrypted return</h2>
        <p className={`${d.lead} mb-3`}>
          Optional hardening: instead of putting a raw JWT in the browser query string, the client generates an ephemeral ECDH key pair and sends the public key with login. The
          server derives a shared secret, encrypts the session token payload, and returns ciphertext the browser decrypts locally—reducing exposure to shoulder-surfing, referrer
          leaks, and intermediate proxies that log full URLs.
        </p>
        <p className={`${d.lead} mb-0`}>
          Standard redirect flow without ECDH remains supported. When you are ready to exercise the full OAuth-shaped path, use{' '}
          <Link href="/oauth/playground" className={d.link}>
            OAuth Playground
          </Link>{' '}
          alongside the{' '}
          <Link href="/ecdh" className={d.link}>
            /ecdh
          </Link>{' '}
          key tool.
        </p>
      </header>

      <div className="flex flex-col gap-10">
        <section aria-labelledby="ecdh-when">
          <h3 id="ecdh-when" className={d.docSectionLabel}>
            When it helps
          </h3>
          <div className={d.calloutInfo}>
            <ul className={`${d.listDisc} mb-0`}>
              <li>Callbacks land on shared or less-trusted devices where URL history matters</li>
              <li>You want defense-in-depth on top of HTTPS and short-lived tokens</li>
              <li>
                You already run the OAuth login form that negotiates client keys (same mechanics as <code className={d.codeInline}>/login</code> with ECDH enabled)
              </li>
            </ul>
          </div>
        </section>

        <section aria-labelledby="ecdh-keys">
          <h3 id="ecdh-keys" className={d.docSectionLabel}>
            Generate & store
          </h3>
          <div className={d.cardMuted}>
            <ol className={`${d.listDecimal} mb-4`}>
              <li>
                Open{' '}
                <Link href="/ecdh" className={d.link}>
                  /ecdh
                </Link>{' '}
                and generate a server key pair (PEM)
              </li>
              <li>
                Set <code className={d.codeInline}>ECDH_SERVER_PRIVATE_KEY</code> to the server private PEM. In env files, keep newlines escaped or quoted so the value parses as
                one line—your platform&apos;s secret UI usually handles multiline PEM cleanly.
              </li>
              <li>
                Optional <code className={d.codeInline}>ECDH_SERVER_PUBLIC_KEY</code> for local debugging only; production browsers should fetch the current public key from{' '}
                <code className={d.codeInline}>/api/oauth/public-key</code> so rotation can be centralized
              </li>
            </ol>
            <Link href="/ecdh" className={d.btnPrimary}>
              <FiArrowRight size={14} aria-hidden />
              Open ECDH tool
            </Link>
          </div>
        </section>

        <section aria-labelledby="ecdh-runtime">
          <h3 id="ecdh-runtime" className={d.docSectionLabel}>
            Runtime flow
          </h3>
          <div className={d.card}>
            <ol className={d.listDecimal}>
              <li>Browser creates an ephemeral ECDH key pair for the login attempt</li>
              <li>Client public key is attached to the login (or OAuth) request alongside username, password, and second factor</li>
              <li>Server validates credentials, derives a shared secret from its static private key and the client public key, then encrypts the issued session material</li>
              <li>Response carries encrypted payload; only the browser holding the ephemeral private key can decrypt and obtain the JWT</li>
            </ol>
            <p className={`${d.muted} mt-3 mb-0`}>
              Key rotation and overlap windows are described under Advanced in{' '}
              <Link href="/getting-started/env" className={d.link}>
                Environment variables
              </Link>{' '}
              when you enable KV-backed rotation.
            </p>
          </div>
        </section>

        <section aria-labelledby="ecdh-ops">
          <h3 id="ecdh-ops" className={d.docSectionLabel}>
            Operations
          </h3>
          <div className={d.calloutWarn}>
            <ul className={`${d.calloutWarnBody} list-disc space-y-1`}>
              <li>Never commit the server private key; inject via your host secret manager</li>
              <li>Public keys alone cannot decrypt past traffic without also capturing ciphertext and breaking ECDH</li>
              <li>Plan rotation: provision a new pair, update env, deploy, then retire the old private key after clients have picked up the new public key</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
