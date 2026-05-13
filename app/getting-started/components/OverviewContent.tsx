import Link from 'next/link'
import { FiAlertTriangle, FiArrowRight, FiCheck, FiInfo, FiKey, FiShield, FiSmartphone } from 'react-icons/fi'

import { gettingStartedDoc } from '@/app/getting-started/doc-tokens'
import { McpInstallPanel } from '@/components/mcp/McpInstallPanel'

export type OverviewContentProps = {
  /** Public origin for MCP install deep links (from the server request). */
  requestOrigin?: string
}

/**
 * Renders the Getting Started overview tab: product summary, MCP install, and links to setup guides.
 * @param requestOrigin Optional request origin forwarded to {@link McpInstallPanel}
 * @returns Overview article content
 */
export function OverviewContent({ requestOrigin }: OverviewContentProps) {
  const { article, h2, h4, lead, muted, link, linkWithArrow, codeInline, iconBox, docSectionLabel, calloutInfo, calloutWarn, calloutWarnTitle, calloutWarnBody, cardMuted } =
    gettingStartedDoc

  const guideLinks = [
    { href: '/getting-started/totp', label: 'TOTP Setup', hint: 'Base32 secret and QR' },
    { href: '/getting-started/webauthn', label: 'WebAuthn Setup', hint: 'Passkeys / security keys' },
    { href: '/getting-started/ecdh', label: 'ECDH Setup', hint: 'Encrypted token return' },
    { href: '/getting-started/integration', label: 'Project Integration', hint: 'Redirect flow and JWT' },
    { href: '/getting-started/env', label: 'Environment Variables', hint: 'All env keys explained' },
  ] as const

  const setupSteps = [
    {
      title: 'Core environment',
      body: 'Set the admin login and signing secret. Use a 32+ character JWT secret.',
      refs: [
        { label: 'Username', value: 'ACCESS_USERNAME' },
        { label: 'Password', value: 'ACCESS_PASSWORD' },
        { label: 'Signing key', value: 'JWT_SECRET' },
      ],
      action: (
        <Link href="/getting-started/env" className={`${link} ${linkWithArrow}`}>
          Environment variables
          <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
        </Link>
      ),
    },
    {
      title: 'Choose a second factor',
      body: 'Add at least one second-factor secret before enabling login.',
      refs: [
        { label: 'TOTP', value: 'ACCESS_TOTP_SECRET' },
        { label: 'WebAuthn', value: 'ACCESS_WEBAUTHN_SECRET' },
      ],
      action: (
        <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Link href="/totp" className={`${link} ${linkWithArrow}`}>
            Open TOTP
            <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
          </Link>
          <Link href="/webauthn" className={`${link} ${linkWithArrow}`}>
            Register WebAuthn
            <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
          </Link>
        </span>
      ),
    },
    {
      title: 'Optional encrypted return',
      body: 'Use this only for encrypted login or OAuth callbacks.',
      refs: [{ label: 'Server secret', value: 'ECDH_SERVER_PRIVATE_KEY' }],
      action: (
        <Link href="/ecdh" className={`${link} ${linkWithArrow}`}>
          Open ECDH
          <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
        </Link>
      ),
    },
    {
      title: 'Callback allowlist',
      body: 'For cross-origin callbacks, list owned origins. Same-origin relative paths work without an allowlist.',
      refs: [{ label: 'Allowlist', value: 'ALLOWED_REDIRECT_URLS' }],
      action: (
        <Link href="/getting-started/integration" className={`${link} ${linkWithArrow}`}>
          Redirect contract
          <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
        </Link>
      ),
    },
    {
      title: 'Wire the consumer app',
      body: 'Send users to the login route, then verify the returned token in your app.',
      refs: [
        { label: 'Login', value: '/login?redirectUrl=...' },
        { label: 'JWT', value: 'token' },
        { label: 'Verify API', value: '/api/auth/verify' },
      ],
      action: (
        <Link href="/getting-started/integration" className={`${link} ${linkWithArrow}`}>
          Project integration
          <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
        </Link>
      ),
    },
  ] as const

  const centralizeReasons = [
    { title: 'One place to rotate secrets', desc: 'JWT signing key and admin password change here; apps only validate tokens.' },
    { title: 'Stable identity claims', desc: 'Issued tokens include iss, sub, username, preferred_username, and optional email for your UI.' },
    { title: 'Safer redirects', desc: 'Host allowlist blocks open redirects; pair with a random state on each login.' },
    { title: 'Playground for OAuth', desc: 'Use /oauth/playground to exercise flows without wiring a separate client first.' },
  ] as const

  const toolCards = [
    {
      title: 'TOTP',
      icon: FiSmartphone,
      description: 'RFC 6238 time-based codes from any authenticator app.',
      note: 'Generate a Base32 secret, then verify codes on the tool page before enabling login.',
      metaLabel: 'Env output',
      metaValue: 'ACCESS_TOTP_SECRET',
      href: '/totp',
      action: 'Open TOTP',
    },
    {
      title: 'WebAuthn',
      icon: FiShield,
      description: 'Platform authenticators and roaming security keys.',
      note: 'RP ID must match the deployed hostname. Export the JSON credential and keep TOTP as a fallback.',
      metaLabel: 'Env output',
      metaValue: 'ACCESS_WEBAUTHN_SECRET',
      href: '/webauthn',
      action: 'Register credential',
    },
    {
      title: 'ECDH',
      icon: FiKey,
      description: 'Optional encryption for OAuth-style return payloads.',
      note: 'Used when the browser sends an ephemeral public key so only that client can decrypt the session token.',
      metaLabel: 'Server secret',
      metaValue: 'ECDH_SERVER_PRIVATE_KEY',
      href: '/ecdh',
      action: 'Open ECDH',
    },
  ] as const

  const jwtClaims = [
    { claim: 'authenticated', desc: 'Must be true for a completed login.' },
    { claim: 'iss', desc: 'Issuer. Override with OAUTH_ISSUER when you need a stable external identity provider URL.' },
    { claim: 'sub', desc: 'Stable subject for the configured admin user.' },
    { claim: 'username / preferred_username', desc: 'Human-readable identity from ACCESS_USERNAME.' },
    { claim: 'email', desc: 'Included only when ACCESS_EMAIL is set.' },
    { claim: 'iat / exp', desc: 'Standard time bounds. Session length follows Remember me and JWT_EXPIRES_IN.' },
  ] as const

  const monoText = 'font-mono text-[11px] leading-relaxed text-[var(--nav-brand-text)]'

  return (
    <div className={article}>
      <header className="mb-10">
        <h2 className={h2}>Personal auth hub</h2>
        <p className={`${lead} mb-3`}>
          Deploy this app once, then point every small project at the same admin login. You keep one username, password, second factor, and JWT signing key — consumers only verify
          the token (or call the verify API) instead of shipping their own credential store.
        </p>
        <p className={`${lead} mb-0`}>Typical uses: personal dashboards, internal tools, staging apps, and OAuth-style redirects where you already trust this host.</p>
      </header>

      <section id="mcp" className="mb-10 scroll-mt-28" aria-labelledby="mcp-install-title">
        <McpInstallPanel requestOrigin={requestOrigin} />
      </section>

      <section className="mb-10" aria-labelledby="overview-tools">
        <h3 id="overview-tools" className={docSectionLabel}>
          Built-in tools
        </h3>
        <div className="overflow-hidden rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] shadow-sm">
          <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto md:grid md:grid-cols-3 md:overflow-visible md:snap-none md:divide-x md:divide-y-0 md:divide-[var(--app-header-border)]">
            {toolCards.map(({ title, icon: ToolIcon, description, note, metaLabel, metaValue, href, action }) => (
              <div
                key={title}
                className="flex min-w-[min(17.5rem,calc(100vw-2.75rem))] shrink-0 snap-start flex-col border-[var(--app-header-border)] p-5 max-md:border-r max-md:last:border-r-0 md:min-w-0 md:border-r-0"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className={iconBox}>
                    <ToolIcon size={20} aria-hidden />
                  </div>
                  <h4 className={h4}>{title}</h4>
                </div>
                <p className={`${muted} mb-2`}>{description}</p>
                <p className={`${muted} mb-4 flex-1`}>{note}</p>
                <div className="mb-4 border-t border-[var(--app-header-border)] pt-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-header-text)]">{metaLabel}</p>
                  <p className={`${monoText} break-all`}>{metaValue}</p>
                </div>
                <Link href={href} className={`${link} ${linkWithArrow} text-xs`}>
                  {action}
                  <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-10" aria-labelledby="overview-guide-index">
        <h3 id="overview-guide-index" className={docSectionLabel}>
          In this guide
        </h3>
        <div className={`${calloutInfo} space-y-2`}>
          <p className={`${muted} mb-0`}>Each topic has its own URL so you can bookmark or share it.</p>
          <ul className="space-y-2 text-sm text-[var(--app-header-text)]">
            {guideLinks.map(({ href, label, hint }) => (
              <li key={href}>
                <Link href={href} className={`${link} font-medium`}>
                  {label}
                </Link>
                <span className={muted}> — {hint}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-10" aria-labelledby="overview-checklist">
        <h3 id="overview-checklist" className={docSectionLabel}>
          First-time setup
        </h3>
        <div className="overflow-hidden rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] shadow-sm">
          <div className="border-b border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] px-5 py-4">
            <div className="flex items-start gap-3">
              <div className={iconBox}>
                <FiInfo size={18} aria-hidden />
              </div>
              <div>
                <h4 className={`${h4} mb-1`}>Setup path</h4>
                <p className={muted}>Follow these in order. Each step points to the page or tool that owns the details.</p>
              </div>
            </div>
          </div>

          <ol className="divide-y divide-[var(--app-header-border)]">
            {setupSteps.map(({ title, body, refs, action }, index) => (
              <li key={title} className="grid gap-3 px-5 py-4 sm:grid-cols-[2.75rem_minmax(0,1fr)_auto] sm:items-start sm:gap-4">
                <div className="flex size-8 items-center justify-center rounded-full border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] text-xs font-semibold text-[var(--nav-brand-text)]">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <h4 className={`${h4} mb-1`}>{title}</h4>
                  <p className={`${muted} mb-3 text-[13px]`}>{body}</p>
                  <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                    {refs.map(({ label, value }) => (
                      <div key={`${title}-${value}`} className="min-w-0">
                        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--app-header-text)]">{label}</p>
                        <p className={`${monoText} break-all`}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-xs sm:pt-1">{action}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mb-10" aria-labelledby="overview-why">
        <h3 id="overview-why" className={docSectionLabel}>
          Why centralize
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {centralizeReasons.map(({ title, desc }) => (
            <div key={title} className="rounded-xl border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--app-header-border)] bg-[var(--app-header-bg)]">
                  <FiCheck size={14} className="text-[var(--nav-brand-text)]" aria-hidden />
                </div>
                <p className={`${h4} mb-0`}>{title}</p>
              </div>
              <p className={`${muted} pl-8`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10" aria-labelledby="overview-jwt">
        <h3 id="overview-jwt" className={docSectionLabel}>
          Session JWT (what apps should read)
        </h3>
        <div className={cardMuted}>
          <p className={`${muted} mb-3`}>
            After a successful password / TOTP / WebAuthn path, this service issues a signed JWT. Your callback should treat it like an opaque credential until verified.
          </p>
          <p className={`${muted} mb-3 font-semibold text-[var(--nav-brand-text)]`}>Claims you can rely on</p>
          <dl className="mb-4 overflow-hidden rounded-lg border border-[var(--app-header-border)] bg-[var(--app-header-bg)]">
            {jwtClaims.map(({ claim, desc }) => (
              <div key={claim} className="grid gap-1 border-b border-[var(--app-header-border)] px-4 py-3 last:border-b-0 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-4">
                <dt className={`${monoText} break-words`}>{claim}</dt>
                <dd className={muted}>{desc}</dd>
              </div>
            ))}
          </dl>
          <p className={muted}>
            Inspect a decoded sample at{' '}
            <Link href="/login/blank" className={link}>
              /login/blank
            </Link>{' '}
            with <span className={monoText}>redirectUrl=/login/blank</span> after configuring env.
          </p>
        </div>
      </section>

      <section aria-labelledby="overview-security">
        <h3 id="overview-security" className={docSectionLabel}>
          Security
        </h3>
        <div className={calloutWarn}>
          <div className="flex items-start gap-2">
            <FiAlertTriangle size={18} className={`mt-0.5 shrink-0 ${calloutWarnTitle}`} aria-hidden />
            <div>
              <h4 className={`${calloutWarnTitle} mb-1.5`}>Reminders</h4>
              <ul className={`${calloutWarnBody} list-disc space-y-0.5`}>
                <li>
                  Never ship <code className={codeInline}>JWT_SECRET</code> to browsers or public repos
                </li>
                <li>Use long random passwords in production; rotate when people leave</li>
                <li>Only whitelist redirect origins you control; prefer HTTPS for callbacks</li>
                <li>Keep server time accurate for TOTP (NTP); skew breaks verification</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
