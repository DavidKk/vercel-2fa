import Link from 'next/link'
import { FiArrowRight, FiBookOpen, FiCheckCircle, FiKey, FiLink2, FiLock, FiLogIn, FiPlayCircle, FiShield, FiSmartphone } from 'react-icons/fi'

import { generate } from '@/components/Meta'
import { appUi } from '@/components/ui/app-tokens'

const { generateMetadata } = generate({
  title: 'Signet · Two-Factor Authentication',
  description: 'A compact self-hosted authentication center for TOTP, WebAuthn, JWT sessions, and encrypted OAuth-style redirects.',
})

export { generateMetadata }

const toolLinks = [
  {
    title: 'TOTP QR code',
    desc: 'Generate a Base32 secret and QR code for authenticator apps.',
    href: '/totp',
    action: 'Open TOTP',
    icon: FiSmartphone,
  },
  {
    title: 'WebAuthn credential',
    desc: 'Register a passkey or hardware security key and export the credential JSON.',
    href: '/webauthn',
    action: 'Open WebAuthn',
    icon: FiShield,
  },
  {
    title: 'ECDH key pair',
    desc: 'Create the server key pair used for encrypted OAuth token return.',
    href: '/ecdh',
    action: 'Open ECDH',
    icon: FiKey,
  },
]

const docsLinks = [
  { title: 'Environment variables', href: '/getting-started/env', desc: 'Required secrets, redirect allowlists, session settings, and ECDH options.' },
  { title: 'Project integration', href: '/getting-started/integration', desc: 'Verify callback tokens and wire Signet into downstream apps.' },
  { title: 'Auth methods', href: '/getting-started/overview', desc: 'Understand how password, second factor, JWT, and redirects fit together.' },
]

const flowSteps = [
  { label: 'Redirect', desc: 'App sends the user to Signet with a callback URL.' },
  { label: 'Verify', desc: 'Signet checks password plus TOTP or WebAuthn.' },
  { label: 'Return', desc: 'A JWT is returned directly or through encrypted OAuth payloads.' },
  { label: 'Trust', desc: 'Your app verifies the token and creates its own session.' },
]

export default function Home() {
  return (
    <main className="flex min-h-[calc(100dvh-var(--header-height))] flex-1 flex-col bg-[var(--nav-link-hover-bg)]">
      <section className="border-b border-[var(--app-header-border)] bg-[var(--app-header-bg)]">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
          <div className="min-w-0">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] px-3 py-1 text-xs font-medium text-[var(--app-header-text)]">
              <FiLock size={14} aria-hidden />
              Self-hosted auth gateway
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--nav-brand-text)] sm:text-5xl">One small sign-in center for trusted apps</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--app-header-text)]">
              Signet centralizes password login, TOTP, WebAuthn, JWT sessions, redirect allowlists, and encrypted OAuth-style callbacks without turning every project into an auth
              project.
            </p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              <Link href="/login?redirectUrl=/login/blank" className={`${appUi.btnPrimary} sm:w-auto`}>
                <FiLogIn size={16} aria-hidden />
                Try sign in
              </Link>
              <Link href="/getting-started/overview" className={`${appUi.btnSecondary} sm:w-auto`}>
                <FiBookOpen size={16} aria-hidden />
                Read docs
              </Link>
            </div>
          </div>

          <div className={`${appUi.cardCompact} min-w-0`}>
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--app-header-border)] pb-4">
              <div>
                <p className={appUi.sectionLabel}>Auth surface</p>
                <h2 className={`${appUi.panelTitle} mt-1`}>Configured capabilities</h2>
              </div>
              <div className={appUi.iconBox}>
                <FiShield size={18} aria-hidden />
              </div>
            </div>
            <div className="space-y-3">
              {[
                ['Second factor', 'TOTP or WebAuthn'],
                ['Session token', 'JWT with expiry'],
                ['Redirect safety', 'Allowlist + state'],
                ['OAuth return', 'ECDH encrypted payload'],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 rounded-lg border border-[var(--app-header-border)] bg-[var(--background)] px-3 py-2.5">
                  <span className={appUi.muted}>{label}</span>
                  <span className="truncate text-xs font-medium text-[var(--nav-brand-text)]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={appUi.sectionLabel}>Tools</p>
              <h2 className={`${appUi.panelTitle} mt-1`}>Set up the pieces Signet needs</h2>
            </div>
            <Link href="/oauth/playground" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--nav-brand-text)] hover:underline">
              Open playground
              <FiArrowRight size={14} aria-hidden />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Authentication tools">
            {toolLinks.map(({ title, desc, href, action, icon: Icon }) => (
              <Link key={href} href={href} className={`${appUi.cardCompact} group flex min-w-0 flex-col gap-4 transition-colors hover:bg-[var(--nav-link-hover-bg)]`}>
                <div className="flex items-center justify-between gap-3">
                  <div className={appUi.iconBox}>
                    <Icon size={18} aria-hidden />
                  </div>
                  <FiArrowRight size={16} className="shrink-0 text-[var(--nav-icon-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 className={`${appUi.panelTitle} mb-1`}>{title}</h2>
                  <p className={appUi.muted}>{desc}</p>
                </div>
                <span className="mt-auto text-xs font-medium text-[var(--nav-brand-text)]">{action}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className={`${appUi.cardCompact} min-w-0`}>
            <div className="mb-5 flex items-start gap-3">
              <div className={appUi.iconBox}>
                <FiLink2 size={18} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className={`${appUi.sectionLabel} mb-1.5`}>OAuth playground</p>
                <h2 className={`${appUi.panelTitle} mb-1`}>Test the encrypted callback flow</h2>
                <p className={appUi.lead}>Launch a local OAuth-style flow, generate client keys in the browser, and inspect the callback verification result.</p>
              </div>
            </div>
            <Link href="/oauth/playground" className={`${appUi.btnSecondary} sm:w-auto`}>
              <FiPlayCircle size={16} aria-hidden />
              Open playground
            </Link>
          </div>

          <div className={`${appUi.cardCompact} min-w-0`}>
            <p className={`${appUi.sectionLabel} mb-3`}>Runtime guardrails</p>
            <ul className="space-y-3">
              {['Redirect allowlist blocks open redirects.', 'JWT sessions can be verified by downstream apps.', 'ECDH protects token return payloads.'].map((item) => (
                <li key={item} className="flex gap-2 text-xs leading-relaxed text-[var(--app-header-text)]">
                  <FiCheckCircle size={14} className="mt-0.5 shrink-0 text-[var(--nav-brand-text)]" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${appUi.cardCompact} grid grid-cols-1 gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]`}>
          <div>
            <p className={`${appUi.sectionLabel} mb-1.5`}>How it works</p>
            <h2 className={`${appUi.panelTitle} mb-2`}>One gateway, many apps</h2>
            <p className={appUi.lead}>Keep sign-in logic centralized while each app owns its final session.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {flowSteps.map(({ label, desc }, index) => (
              <div key={label} className="rounded-lg border border-[var(--app-header-border)] bg-[var(--background)] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--nav-link-active-bg)] text-xs font-semibold text-[var(--nav-brand-text)]">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-[var(--nav-brand-text)]">{label}</h3>
                </div>
                <p className={appUi.muted}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Documentation shortcuts">
          {docsLinks.map(({ title, href, desc }) => (
            <Link key={href} href={href} className={`${appUi.cardCompact} group flex min-w-0 flex-col gap-3 transition-colors hover:bg-[var(--nav-link-hover-bg)]`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className={appUi.panelTitle}>{title}</h2>
                <FiArrowRight size={16} className="shrink-0 text-[var(--nav-icon-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden />
              </div>
              <p className={appUi.muted}>{desc}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
