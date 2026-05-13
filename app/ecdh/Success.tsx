'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FiAlertTriangle, FiArrowRight, FiCheck, FiCopy, FiFileText, FiKey, FiLink2, FiLock, FiRefreshCw, FiShare2 } from 'react-icons/fi'

import { gettingStartedDoc } from '@/app/getting-started/doc-tokens'

import { toolBtnPrimary, toolBtnSecondary, toolPageCardWide, toolPageShell } from './ui'

export interface SuccessProps {
  keys: {
    privateKey: string
    publicKey: string
    publicKeyBase64: string
  }
  onReset: () => void
}

function formatKeyForEnv(key: string): string {
  return key.replace(/\n/g, '\\n')
}

function buildEnvFile(keys: SuccessProps['keys']): string {
  return `# Server PEM (quote multiline for .env)
ECDH_SERVER_PRIVATE_KEY="${formatKeyForEnv(keys.privateKey)}"
ECDH_SERVER_PUBLIC_KEY="${formatKeyForEnv(keys.publicKey)}"`
}

interface CopyIconButtonProps {
  copied: boolean
  onClick: () => void
  label: string
  size?: 'sm' | 'md'
}

function CopyIconButton(props: CopyIconButtonProps) {
  const { copied, onClick, label, size = 'md' } = props
  const isSm = size === 'sm'
  const iconSize = isSm ? 12 : 14
  const box =
    'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-[var(--app-header-border)] bg-[var(--app-header-bg)] font-medium text-[var(--nav-brand-text)] transition-colors hover:bg-[var(--nav-link-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)]'
  const sizing = isSm ? 'min-h-7 px-2 py-0.5 text-[11px]' : 'min-h-8 px-2.5 py-1 text-xs'

  return (
    <button type="button" onClick={onClick} className={`${box} ${sizing}`}>
      {copied ? <FiCheck size={iconSize} aria-hidden /> : <FiCopy size={iconSize} aria-hidden />}
      {copied ? 'Copied' : label}
    </button>
  )
}

interface KeyPanelProps {
  title: string
  description: string
  envKey: string
  pem: string
  variant: 'secret' | 'public'
  copiedField: string | null
  fieldId: string
  onCopy: (text: string, fieldId: string) => void
}

function KeyPanel(props: KeyPanelProps) {
  const { title, description, envKey, pem, variant, copiedField, fieldId, onCopy } = props
  const d = gettingStartedDoc
  const labelPill = variant === 'secret' ? <span className={`${d.pillRequired} shrink-0`}>Secret</span> : <span className={`${d.pillOptional} shrink-0`}>Public PEM</span>

  const VariantIcon = variant === 'secret' ? FiLock : FiShare2

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] p-5 shadow-sm" aria-labelledby={`${fieldId}-heading`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className={d.iconBox}>
            <VariantIcon size={18} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <h2 id={`${fieldId}-heading`} className="text-base font-semibold tracking-tight text-[var(--nav-brand-text)]">
                {title}
              </h2>
              {labelPill}
            </div>
            <p className={`${d.muted} text-[13px] leading-relaxed`}>{description}</p>
            <p className={`${d.muted} mt-2 text-[13px]`}>
              Env: <code className={d.codeInline}>{envKey}</code>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 sm:pt-0.5">
          <CopyIconButton copied={copiedField === fieldId} onClick={() => onCopy(formatKeyForEnv(pem), fieldId)} label="Copy" />
        </div>
      </div>
      <div className="min-h-0 max-h-48 flex-1 overflow-auto rounded-lg border border-[var(--app-header-border)] bg-[var(--background)] p-3 font-mono text-[11px] leading-relaxed text-[var(--foreground)]">
        <code className="whitespace-pre">{pem}</code>
      </div>
    </section>
  )
}

export default function Success(props: SuccessProps) {
  const { keys, onReset } = props
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const d = gettingStartedDoc

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // eslint-disable-next-line no-console
      console.error('Clipboard write failed')
    }
  }

  const envFile = buildEnvFile(keys)

  return (
    <div className={`${toolPageShell} items-stretch justify-start py-8 sm:py-10`}>
      <div className={`${toolPageCardWide} mx-auto flex min-h-0 flex-col gap-6 px-1 sm:px-0`}>
        <header className="flex flex-col gap-5 border-b border-[var(--app-header-border)] pb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="flex min-w-0 gap-3 sm:gap-4">
            <div className={d.iconBox}>
              <FiKey size={18} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className={`${d.docSectionLabel} mb-1.5`}>Result</p>
              <h1 className="mb-2 text-xl font-semibold tracking-tight text-[var(--nav-brand-text)] sm:text-2xl">Keys generated</h1>
              <p className={`${d.muted} max-w-prose text-[13px] leading-relaxed sm:text-sm`}>
                Add the private key to your host secrets. The public PEM in <code className={d.codeInline}>.env</code> is optional (debug); production clients use{' '}
                <code className={d.codeInline}>/api/oauth/public-key</code>.
              </p>
              <Link href="/getting-started/env" className={`${d.link} ${d.linkWithArrow} mt-3 inline-flex text-sm`}>
                Environment variables reference
                <FiArrowRight size={16} className="shrink-0 opacity-90" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:min-w-[12rem]">
            <button type="button" className={toolBtnPrimary} onClick={() => handleCopy(envFile, 'envAll')}>
              {copiedField === 'envAll' ? (
                <>
                  <FiCheck size={16} aria-hidden />
                  Copied .env block
                </>
              ) : (
                <>
                  <FiCopy size={16} aria-hidden />
                  Copy .env block
                </>
              )}
            </button>
            <button type="button" className={toolBtnSecondary} onClick={onReset}>
              <FiRefreshCw size={16} aria-hidden />
              Generate another pair
            </button>
          </div>
        </header>

        <div className="rounded-xl border border-[var(--app-header-border)] border-l-4 border-l-amber-400 bg-[var(--app-header-bg)] p-4 shadow-sm" role="status">
          <div className="mb-2 flex items-center gap-2">
            <FiAlertTriangle className="shrink-0 text-amber-700 dark:text-amber-300" size={17} aria-hidden />
            <span className="text-sm font-semibold text-[var(--nav-brand-text)]">Security</span>
          </div>
          <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-[var(--app-header-text)]">
            <li>Never commit the private key or push it to a repository.</li>
            <li>
              Store <code className={d.codeInline}>ECDH_SERVER_PRIVATE_KEY</code> in your platform secret manager.
            </li>
            <li>Rotate keys on a schedule if your threat model requires it.</li>
          </ul>
        </div>

        <div className={d.gridTwoCol}>
          <KeyPanel
            title="Private key"
            description="Server-only. Used to derive shared secrets with client ephemeral keys."
            envKey="ECDH_SERVER_PRIVATE_KEY"
            pem={keys.privateKey}
            variant="secret"
            copiedField={copiedField}
            fieldId="privatePem"
            onCopy={handleCopy}
          />
          <KeyPanel
            title="Public key"
            description="PEM form for local .env only. Prefer the public-key API in production."
            envKey="ECDH_SERVER_PUBLIC_KEY"
            pem={keys.publicKey}
            variant="public"
            copiedField={copiedField}
            fieldId="publicPem"
            onCopy={handleCopy}
          />
        </div>

        <section className={`${d.cardMuted} p-5`} aria-labelledby="env-snippet-heading">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <FiFileText className="mt-0.5 shrink-0 text-[var(--nav-brand-text)]" size={18} aria-hidden />
              <div className="min-w-0">
                <h2 id="env-snippet-heading" className="text-base font-semibold text-[var(--nav-brand-text)]">
                  .env snippet
                </h2>
                <p className={`${d.muted} mt-1 text-[13px] sm:text-xs`}>
                  Single block you can paste into <code className={d.codeInline}>.env.local</code>.
                </p>
              </div>
            </div>
            <CopyIconButton copied={copiedField === 'envSnippet'} onClick={() => handleCopy(envFile, 'envSnippet')} label="Copy" size="sm" />
          </div>
          <pre className="max-w-full overflow-x-auto rounded-lg border border-[var(--app-header-border)] bg-[var(--background)] p-3 font-mono text-[11px] leading-relaxed text-[var(--foreground)]">
            {envFile}
          </pre>
        </section>

        <section className={`${d.cardMuted} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`} aria-labelledby="b64-note">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <FiLink2 className="shrink-0 text-[var(--nav-brand-text)]" size={18} aria-hidden />
            <div className="min-w-0">
              <p id="b64-note" className={`${d.muted} m-0 text-[13px] leading-5 sm:text-xs`}>
                <span className="font-semibold text-[var(--nav-brand-text)]">SPKI (Base64)</span> for wire protocols when your client needs the compact public key (not the PEM env
                form).
              </p>
            </div>
          </div>
          <CopyIconButton copied={copiedField === 'spki64'} onClick={() => handleCopy(keys.publicKeyBase64, 'spki64')} label="Copy Base64" size="sm" />
        </section>
      </div>
    </div>
  )
}
