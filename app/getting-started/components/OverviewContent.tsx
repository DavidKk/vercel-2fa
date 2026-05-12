import Link from 'next/link'
import { FiAlertTriangle, FiArrowRight, FiCheck, FiInfo, FiKey, FiShield, FiSmartphone } from 'react-icons/fi'

import { gettingStartedDoc } from '@/app/getting-started/doc-tokens'

export function OverviewContent() {
  const {
    article,
    h2,
    h4,
    lead,
    muted,
    link,
    linkWithArrow,
    codeInline,
    iconBox,
    docSectionLabel,
    docGridTwoCol,
    calloutInfo,
    calloutWarn,
    calloutWarnTitle,
    calloutWarnBody,
    listDecimal,
    listDisc,
    cardMuted,
  } = gettingStartedDoc

  const guideLinks = [
    { href: '/getting-started/totp', label: 'TOTP Setup', hint: 'Base32 secret and QR' },
    { href: '/getting-started/webauthn', label: 'WebAuthn Setup', hint: 'Passkeys / security keys' },
    { href: '/getting-started/ecdh', label: 'ECDH Setup', hint: 'Encrypted token return' },
    { href: '/getting-started/integration', label: 'Project Integration', hint: 'Redirect flow and JWT' },
    { href: '/getting-started/env', label: 'Environment Variables', hint: 'All env keys explained' },
  ] as const

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

      <section className="mb-10" aria-labelledby="overview-tools">
        <h3 id="overview-tools" className={docSectionLabel}>
          Built-in tools
        </h3>
        <div className="overflow-hidden rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] shadow-sm">
          <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto md:grid md:grid-cols-3 md:overflow-visible md:snap-none md:divide-x md:divide-y-0 md:divide-[var(--app-header-border)]">
            <div className="flex min-w-[min(17.5rem,calc(100vw-2.75rem))] shrink-0 snap-start flex-col border-[var(--app-header-border)] p-5 max-md:border-r max-md:last:border-r-0 md:min-w-0 md:border-r-0">
              <div className="mb-3 flex items-center gap-2">
                <div className={iconBox}>
                  <FiSmartphone size={20} aria-hidden />
                </div>
                <h4 className={h4}>TOTP</h4>
              </div>
              <p className={`${muted} mb-2 flex-1`}>RFC 6238 time-based codes from any authenticator app.</p>
              <p className={`${muted} mb-4`}>
                Generate a Base32 secret, copy it into <code className={codeInline}>ACCESS_TOTP_SECRET</code>, then verify codes on the tool page before enabling login.
              </p>
              <Link href="/totp" className={`${link} ${linkWithArrow} text-xs`}>
                Open TOTP
                <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
              </Link>
            </div>
            <div className="flex min-w-[min(17.5rem,calc(100vw-2.75rem))] shrink-0 snap-start flex-col border-[var(--app-header-border)] p-5 max-md:border-r max-md:last:border-r-0 md:min-w-0 md:border-r-0">
              <div className="mb-3 flex items-center gap-2">
                <div className={iconBox}>
                  <FiShield size={20} aria-hidden />
                </div>
                <h4 className={h4}>WebAuthn</h4>
              </div>
              <p className={`${muted} mb-2 flex-1`}>Platform authenticators and roaming security keys.</p>
              <p className={`${muted} mb-4`}>
                RP ID must match the deployed hostname. Export the JSON credential into <code className={codeInline}>ACCESS_WEBAUTHN_SECRET</code>; you can keep TOTP as a fallback.
              </p>
              <Link href="/webauthn" className={`${link} ${linkWithArrow} text-xs`}>
                Register credential
                <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
              </Link>
            </div>
            <div className="flex min-w-[min(17.5rem,calc(100vw-2.75rem))] shrink-0 snap-start flex-col border-[var(--app-header-border)] p-5 max-md:border-r max-md:last:border-r-0 md:min-w-0 md:border-r-0">
              <div className="mb-3 flex items-center gap-2">
                <div className={iconBox}>
                  <FiKey size={20} aria-hidden />
                </div>
                <h4 className={h4}>ECDH</h4>
              </div>
              <p className={`${muted} mb-2 flex-1`}>Optional encryption for OAuth-style return payloads.</p>
              <p className={`${muted} mb-4`}>
                Used when the browser sends an ephemeral public key with login or{' '}
                <Link href="/oauth" className={link}>
                  OAuth
                </Link>{' '}
                flows so only that client can decrypt the session token.
              </p>
              <Link href="/ecdh" className={`${link} ${linkWithArrow} text-xs`}>
                Open ECDH
                <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
              </Link>
            </div>
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

      <div className={docGridTwoCol}>
        <section aria-labelledby="overview-checklist" className="min-w-0">
          <h3 id="overview-checklist" className={docSectionLabel}>
            First-time setup
          </h3>
          <div className={calloutInfo}>
            <div className="flex items-start gap-2">
              <FiInfo size={18} className="mt-0.5 shrink-0 text-[var(--nav-brand-text)]" aria-hidden />
              <div>
                <h4 className={`${h4} mb-2`}>Checklist</h4>
                <ol className={`${listDecimal} mb-0`}>
                  <li>
                    <strong className="text-[var(--nav-brand-text)]">Env core:</strong> set <code className={codeInline}>ACCESS_USERNAME</code>,{' '}
                    <code className={codeInline}>ACCESS_PASSWORD</code>, <code className={codeInline}>JWT_SECRET</code> (≥32 chars), and at least one of{' '}
                    <code className={codeInline}>ACCESS_TOTP_SECRET</code> or <code className={codeInline}>ACCESS_WEBAUTHN_SECRET</code>. See{' '}
                    <Link href="/getting-started/env" className={link}>
                      Environment variables
                    </Link>
                    .
                  </li>
                  <li>
                    <strong className="text-[var(--nav-brand-text)]">Second factor:</strong> create TOTP material on{' '}
                    <Link href="/totp" className={link}>
                      /totp
                    </Link>{' '}
                    and/or register WebAuthn on{' '}
                    <Link href="/webauthn" className={link}>
                      /webauthn
                    </Link>
                    , then paste values into env and redeploy.
                  </li>
                  <li>
                    <strong className="text-[var(--nav-brand-text)]">ECDH (optional):</strong> only if you use encrypted return from login/OAuth — generate keys on{' '}
                    <Link href="/ecdh" className={link}>
                      /ecdh
                    </Link>{' '}
                    and set <code className={codeInline}>ECDH_SERVER_PRIVATE_KEY</code>.
                  </li>
                  <li>
                    <strong className="text-[var(--nav-brand-text)]">Callbacks:</strong> if <code className={codeInline}>redirectUrl</code> points to another origin, list those
                    URLs in <code className={codeInline}>ALLOWED_REDIRECT_URLS</code> (comma-separated; wildcards supported). Same-origin relative paths work without the list.
                  </li>
                  <li>
                    <strong className="text-[var(--nav-brand-text)]">Integrate:</strong> send users to <code className={codeInline}>/login?redirectUrl=…&amp;state=…</code>{' '}
                    (URL-encode the callback). After sign-in they return with <code className={codeInline}>token</code> and optional <code className={codeInline}>state</code>.
                    Verify JWT with <code className={codeInline}>jose</code> or POST to <code className={codeInline}>/api/auth/verify</code> — see{' '}
                    <Link href="/getting-started/integration" className={link}>
                      Project Integration
                    </Link>
                    .
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="overview-why" className="min-w-0">
          <h3 id="overview-why" className={docSectionLabel}>
            Why centralize
          </h3>
          <div className="rounded-xl border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] p-4">
            <ul className="space-y-3">
              {[
                { title: 'One place to rotate secrets', desc: 'JWT signing key and admin password change here; apps only validate tokens.' },
                { title: 'Stable identity claims', desc: 'Issued tokens include iss, sub, username, preferred_username, and optional email for your UI.' },
                { title: 'Safer redirects', desc: 'Host allowlist blocks open redirects; pair with a random state on each login.' },
                { title: 'Playground for OAuth', desc: 'Use /oauth/playground to exercise flows without wiring a separate client first.' },
              ].map(({ title, desc }) => (
                <li className="flex items-start gap-2" key={title}>
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--app-header-border)] bg-[var(--app-header-bg)]">
                    <FiCheck size={14} className="text-[var(--nav-brand-text)]" aria-hidden />
                  </div>
                  <div>
                    <p className={`${h4} mb-0.5`}>{title}</p>
                    <p className={muted}>{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="mb-10" aria-labelledby="overview-jwt">
        <h3 id="overview-jwt" className={docSectionLabel}>
          Session JWT (what apps should read)
        </h3>
        <div className={cardMuted}>
          <p className={`${muted} mb-3`}>
            After a successful password / TOTP / WebAuthn path, this service issues a signed JWT. Your callback should treat it like an opaque credential until verified.
          </p>
          <p className={`${muted} mb-2 font-semibold text-[var(--nav-brand-text)]`}>Claims you can rely on (when present)</p>
          <ul className={`${listDisc} mb-3`}>
            <li>
              <code className={codeInline}>authenticated</code> — must be true for a completed login
            </li>
            <li>
              <code className={codeInline}>iss</code> — issuer; overridable with <code className={codeInline}>OAUTH_ISSUER</code>
            </li>
            <li>
              <code className={codeInline}>sub</code> — stable subject for the configured admin user
            </li>
            <li>
              <code className={codeInline}>username</code> / <code className={codeInline}>preferred_username</code> — from <code className={codeInline}>ACCESS_USERNAME</code>
            </li>
            <li>
              <code className={codeInline}>email</code> — only when <code className={codeInline}>ACCESS_EMAIL</code> is set
            </li>
            <li>
              <code className={codeInline}>iat</code> / <code className={codeInline}>exp</code> — standard time bounds; session length follows Remember me and{' '}
              <code className={codeInline}>JWT_EXPIRES_IN</code>
            </li>
          </ul>
          <p className={muted}>
            Inspect a decoded sample at{' '}
            <Link href="/login/blank" className={link}>
              /login/blank
            </Link>{' '}
            with <code className={codeInline}>redirectUrl=/login/blank</code> after configuring env.
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
