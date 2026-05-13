import Link from 'next/link'
import { FiCheckCircle, FiShield } from 'react-icons/fi'

import { gettingStartedDoc } from '@/app/getting-started/doc-tokens'
import {
  SIGNET_INTEGRATION_FLOW_STEPS,
  SIGNET_INTEGRATION_PRACTICE_BULLETS,
  SIGNET_JWT_VERIFY_JOSE_SNIPPET,
  SIGNET_LOGIN_URL_EXAMPLE_JS,
  SIGNET_REACT_AUTH_CALLBACK_JS,
  SIGNET_REACT_HANDLE_LOGIN_JS,
  SIGNET_VERIFY_API_FETCH_JS,
} from '@/services/mcp/signetIntegrationShared'

export function IntegrationContent() {
  const d = gettingStartedDoc

  const steps = [...SIGNET_INTEGRATION_FLOW_STEPS]

  return (
    <div className={d.article}>
      <header className="mb-10">
        <h2 className={d.h2}>Integrate your apps</h2>
        <p className={`${d.lead} mb-3`}>
          Treat this host as the identity provider: your app only needs a login link, a callback route, and token verification. No password storage in consumer services.
        </p>
        <p className={`${d.lead} mb-0`}>
          For interactive OAuth-style experiments, use{' '}
          <Link href="/oauth/playground" className={d.link}>
            OAuth Playground
          </Link>
          ; the steps below focus on the <code className={d.codeInline}>/login</code> redirect contract.
        </p>
      </header>

      <section className="mb-10" aria-labelledby="integration-flow">
        <h3 id="integration-flow" className={d.docSectionLabel}>
          Flow
        </h3>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:min-w-0 md:grid-cols-2 md:gap-3 md:overflow-visible md:pb-0 md:snap-none lg:grid-cols-4">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="min-w-[12rem] shrink-0 snap-start rounded-xl border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] p-4 md:min-w-0">
              <div className="mb-2 flex size-8 items-center justify-center rounded-full border border-[var(--app-header-border)] bg-[var(--app-header-bg)] text-xs font-bold text-[var(--nav-brand-text)]">
                {step}
              </div>
              <h4 className={`${d.h4} mb-1`}>{title}</h4>
              <p className="text-xs leading-relaxed text-[var(--app-header-text)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10" aria-labelledby="integration-query">
        <h3 id="integration-query" className={d.docSectionLabel}>
          Login URL and query parameters
        </h3>
        <div className={`${d.cardMuted} mb-4`}>
          <p className={`${d.muted} mb-3`}>
            Always URL-encode <code className={d.codeInline}>redirectUrl</code>. Example pattern:
          </p>
          <div className={d.preBox}>{SIGNET_LOGIN_URL_EXAMPLE_JS}</div>
          <ul className={`${d.listDisc} mt-3 mb-0`}>
            <li>
              <strong className="text-[var(--nav-brand-text)]">redirectUrl</strong> — where to send the user after success; must pass{' '}
              <Link href="/getting-started/env" className={d.link}>
                redirect allowlist
              </Link>{' '}
              rules when cross-origin.
            </li>
            <li>
              <strong className="text-[var(--nav-brand-text)]">state</strong> — optional but recommended; echo it back so your callback can detect CSRF or replay.
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10" aria-labelledby="integration-verify">
        <h3 id="integration-verify" className={d.docSectionLabel}>
          Verify tokens
        </h3>
        <div className={d.gridTwoCol}>
          <div className={d.card}>
            <h4 className={`${d.h4} mb-2`}>Option A · Shared secret</h4>
            <p className={`${d.muted} mb-3`}>
              Use the same <code className={d.codeInline}>JWT_SECRET</code> as this deployment. Verify <code className={d.codeInline}>authenticated</code>, expiry, and optionally{' '}
              <code className={d.codeInline}>iss</code>/<code className={d.codeInline}>sub</code> to match your policy.
            </p>
            <div className={d.preBox}>{SIGNET_JWT_VERIFY_JOSE_SNIPPET}</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[var(--app-header-text)]">
              <FiCheckCircle size={14} className="shrink-0 text-[var(--nav-brand-text)]" aria-hidden />
              <span>Lowest latency when the consumer is also yours</span>
            </div>
          </div>

          <div className={d.cardMuted}>
            <h4 className={`${d.h4} mb-2`}>Option B · Verify API</h4>
            <p className={`${d.muted} mb-3`}>
              POST JSON <code className={d.codeInline}>{'{ token, audience?, scope? }'}</code> to <code className={d.codeInline}>/api/auth/verify</code>. The route checks{' '}
              <code className={d.codeInline}>Origin</code> against your redirect allowlist, requires HTTPS for browser calls, and returns the standard envelope:{' '}
              <code className={d.codeInline}>code === 0</code> with <code className={d.codeInline}>data</code> shaped like an OAuth token response (
              <code className={d.codeInline}>access_token</code>, <code className={d.codeInline}>token_type</code>, <code className={d.codeInline}>expires_in</code>,{' '}
              <code className={d.codeInline}>user</code>, optional <code className={d.codeInline}>claims</code>).
            </p>
            <div className={d.preBox}>{SIGNET_VERIFY_API_FETCH_JS}</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[var(--app-header-text)]">
              <FiShield size={14} className="shrink-0 text-[var(--nav-brand-text)]" aria-hidden />
              <span>
                No <code className={d.codeInline}>JWT_SECRET</code> in the consumer; this host performs verification
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10" aria-labelledby="integration-react">
        <h3 id="integration-react" className={d.docSectionLabel}>
          React sketch
        </h3>
        <div className={d.card}>
          <p className={`${d.muted} mb-4`}>
            Replace <code className={d.codeInline}>YOUR_AUTH_HOST</code> with your deployed auth base (no trailing slash). Keep state server-side or in{' '}
            <code className={d.codeInline}>sessionStorage</code> only for the duration of the redirect.
          </p>
          <div className="space-y-6">
            <div>
              <p className={`${d.muted} mb-2 font-semibold text-[var(--nav-brand-text)]`}>Start login</p>
              <div className={d.preBox}>{SIGNET_REACT_HANDLE_LOGIN_JS}</div>
            </div>
            <div>
              <p className={`${d.muted} mb-2 font-semibold text-[var(--nav-brand-text)]`}>Callback route</p>
              <div className={d.preBox}>{SIGNET_REACT_AUTH_CALLBACK_JS}</div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="integration-practices">
        <h3 id="integration-practices" className={d.docSectionLabel}>
          Practices
        </h3>
        <div className={d.calloutWarn}>
          <ul className={`${d.calloutWarnBody} list-disc space-y-1`}>
            {SIGNET_INTEGRATION_PRACTICE_BULLETS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
