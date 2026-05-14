import Link from 'next/link'
import { FiAlertCircle, FiAlertTriangle, FiArrowRight, FiKey, FiSettings, FiShield } from 'react-icons/fi'

import { gettingStartedDoc } from '@/app/getting-started/doc-tokens'

export function EnvironmentContent() {
  const d = gettingStartedDoc

  const envLine = 'break-all font-mono text-[11px] text-[var(--foreground)]'

  return (
    <div className={d.article}>
      <header className="mb-10">
        <h2 className={d.h2}>Environment variables</h2>
        <p className={`${d.lead} mb-0`}>
          Copy into <code className={d.codeInline}>.env.local</code> or your host secret manager. Required keys boot the admin login; everything else depends on which features you
          enable.
        </p>
      </header>

      <div className={d.docGridTwoCol}>
        <div className="flex min-w-0 flex-col gap-10">
          <section aria-labelledby="env-required">
            <h3 id="env-required" className={d.docSectionLabel}>
              Required
            </h3>
            <div className={`${d.card} min-w-0`}>
              <div className="mb-3 flex items-center gap-2">
                <FiAlertCircle size={18} className="text-red-600 dark:text-red-400" aria-hidden />
                <h4 className={d.h4}>Core auth</h4>
              </div>
              <div className="space-y-4 text-sm">
                {[
                  { key: 'ACCESS_USERNAME', desc: 'Admin username on the login form', example: 'admin' },
                  { key: 'ACCESS_PASSWORD', desc: 'Strong password for that account', example: 'your-secure-password' },
                  { key: 'JWT_SECRET', desc: '≥32 chars; signs session JWTs', example: 'your-super-secret-jwt-key-minimum-32-characters' },
                ].map(({ key, desc, example }) => (
                  <div key={key}>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <code className={d.codeBadge}>{key}</code>
                      <span className={d.pillRequired}>required</span>
                    </div>
                    <p className={`${d.muted} mb-1`}>{desc}</p>
                    <div className={`${d.docEnvSnippet} bg-[var(--nav-link-hover-bg)]`}>
                      <code className={envLine}>
                        {key}={example}
                      </code>
                    </div>
                  </div>
                ))}
                <div className={`${d.calloutInfo} text-[11px] text-[var(--app-header-text)]`}>
                  Generate JWT secret:
                  <div className={`${d.docEnvSnippet} mt-2 bg-[var(--background)]`}>
                    <code className={envLine}>{`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`}</code>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="env-2fa">
            <h3 id="env-2fa" className={d.docSectionLabel}>
              Second factor (one or more)
            </h3>
            <div className={`${d.cardMuted} min-w-0`}>
              <div className="mb-3 flex items-center gap-2">
                <FiShield size={18} className="text-[var(--nav-brand-text)]" aria-hidden />
                <h4 className={d.h4}>TOTP or WebAuthn</h4>
              </div>
              <div className="space-y-5 text-sm">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <code className={d.codeBadge}>ACCESS_TOTP_SECRET</code>
                    <span className={d.pillOptional}>optional</span>
                  </div>
                  <p className={`${d.muted} mb-1`}>Base32 string from /totp.</p>
                  <div className={`${d.docEnvSnippet} mb-2 bg-[var(--background)]`}>
                    <code className={`font-mono ${envLine}`}>ACCESS_TOTP_SECRET=JBSWY3DPEHPK3PXP</code>
                  </div>
                  <Link href="/totp" className={`${d.link} ${d.linkWithArrow} mt-3 text-xs`}>
                    Open TOTP
                    <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
                  </Link>
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <code className={d.codeBadge}>ACCESS_WEBAUTHN_SECRET</code>
                    <span className={d.pillOptional}>optional</span>
                  </div>
                  <p className={`${d.muted} mb-1`}>JSON from /webauthn (credentialID, Base64 publicKey, rpId, username).</p>
                  <div className={`${d.docEnvSnippet} mb-2 bg-[var(--background)]`}>
                    <code className={envLine}>{'ACCESS_WEBAUTHN_SECRET={"credentialID":"...","publicKey":"...","rpId":"...","username":"..."}'}</code>
                    <p className={`${d.muted} mt-2 mb-0`}>
                      多域名： <code className={d.codeInline}>{'{"byHost":{"localhost":{...},"your.domain":{...}}}'}</code>
                    </p>
                  </div>
                  <Link href="/webauthn" className={`${d.link} ${d.linkWithArrow} mt-3 text-xs`}>
                    Open WebAuthn
                    <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-10">
          <section aria-labelledby="env-optional">
            <h3 id="env-optional" className={d.docSectionLabel}>
              Session & redirects
            </h3>
            <div className={`${d.card} min-w-0`}>
              <div className="mb-3 flex items-center gap-2">
                <FiSettings size={18} className="text-[var(--nav-brand-text)]" aria-hidden />
                <h4 className={d.h4}>Optional</h4>
              </div>
              <div className="space-y-5 text-sm">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <code className={d.codeBadge}>JWT_EXPIRES_IN</code>
                    <span className={d.pillOptional}>optional</span>
                  </div>
                  <p className={d.muted}>
                    Used when Remember me is checked (e.g. <code className={d.codeInline}>5m</code>, <code className={d.codeInline}>12h</code>,{' '}
                    <code className={d.codeInline}>30d</code>; defaults to <code className={d.codeInline}>30d</code> if unset). If Remember me is unchecked on the login form, the
                    session JWT always expires in one day regardless of this value.
                  </p>
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <code className={d.codeBadge}>ACCESS_EMAIL</code>
                    <span className={d.pillOptional}>optional</span>
                  </div>
                  <p className={`${d.muted} mb-1`}>
                    Adds <code className={d.codeInline}>email</code> to the JWT for UIs.
                  </p>
                  <div className={`${d.docEnvSnippet} bg-[var(--nav-link-hover-bg)]`}>
                    <code className={envLine}>ACCESS_EMAIL=you@example.com</code>
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <code className={d.codeBadge}>ALLOWED_REDIRECT_URLS</code>
                    <span className={d.pillOptional}>optional</span>
                  </div>
                  <p className={`${d.muted} mb-1`}>
                    Comma-separated callback bases (scheme + host + optional port). Wildcards such as <code className={d.codeInline}>https://*.example.com</code> are supported. The
                    same list is also used to decide which <code className={d.codeInline}>Origin</code> headers may call <code className={d.codeInline}>/api/auth/verify</code> from
                    the browser (HTTPS required in production).
                  </p>
                  <div className={`${d.docEnvSnippet} bg-[var(--nav-link-hover-bg)]`}>
                    <code className={envLine}>ALLOWED_REDIRECT_URLS=https://app1.test,https://*.dev.local</code>
                  </div>
                  <p className="mt-1 text-[10px] text-[var(--app-header-text)]">
                    If omitted, only same-origin relative <code className={d.codeInline}>redirectUrl</code> values are allowed, and verify calls without a matching allowlist may be
                    rejected for cross-site origins.
                  </p>
                  <Link href="/getting-started/integration" className={`${d.link} ${d.linkWithArrow} mt-2 inline-flex text-xs`}>
                    Integration · verify & redirects
                    <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="env-ecdh">
            <h3 id="env-ecdh" className={d.docSectionLabel}>
              ECDH (encrypted return)
            </h3>
            <div className={`${d.cardMuted} min-w-0`}>
              <div className="mb-3 flex items-center gap-2">
                <FiKey size={18} className="text-[var(--nav-brand-text)]" aria-hidden />
                <h4 className={d.h4}>Keys</h4>
              </div>
              <div className="space-y-5 text-sm">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <code className={d.codeBadge}>ECDH_SERVER_PRIVATE_KEY</code>
                    <span className={d.pillOptional}>when using ECDH</span>
                  </div>
                  <p className={`${d.muted} mb-1`}>Server PEM for deriving shared secrets.</p>
                  <div className={`${d.docEnvSnippet} mb-2 bg-[var(--background)]`}>
                    <code className={envLine}>ECDH_SERVER_PRIVATE_KEY=&quot;-----BEGIN PRIVATE KEY-----&quot;…&quot;-----END PRIVATE KEY-----&quot;</code>
                  </div>
                  <Link href="/ecdh" className={`${d.link} ${d.linkWithArrow} mt-3 text-xs`}>
                    Open ECDH
                    <FiArrowRight size={14} className="shrink-0 opacity-90" aria-hidden />
                  </Link>
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <code className={d.codeBadge}>ECDH_SERVER_PUBLIC_KEY</code>
                    <span className={d.pillOptional}>debug</span>
                  </div>
                  <p className={d.muted}>
                    Local PEM convenience only. Production clients should call <code className={d.codeInline}>/api/oauth/public-key</code>.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="mb-10" aria-labelledby="env-advanced">
        <h3 id="env-advanced" className={d.docSectionLabel}>
          Advanced · replay protection, issuer, ECDH rotation
        </h3>
        <p className={`${d.lead} mb-4`}>
          These keys are optional. Enable them when you need stricter token hygiene, stable OIDC-style <code className={d.codeInline}>iss</code> /{' '}
          <code className={d.codeInline}>sub</code>, or automated ECDH key rollover backed by Upstash Redis (REST).
        </p>
        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          <div className={d.card}>
            <h4 className={`${d.h4} mb-3`}>Token replay & identity</h4>
            <div className="space-y-4 text-sm">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <code className={d.codeBadge}>ENABLE_TOKEN_REPLAY_PROTECTION</code>
                  <span className={d.pillOptional}>optional</span>
                </div>
                <p className={d.muted}>
                  Set to <code className={d.codeInline}>1</code> or <code className={d.codeInline}>true</code> to record used JWT <code className={d.codeInline}>jti</code> values
                  in Upstash Redis so the same callback token cannot be posted twice. Requires <code className={d.codeInline}>AUTH_KV_REST_API_URL</code> /{' '}
                  <code className={d.codeInline}>AUTH_KV_REST_API_TOKEN</code> (or <code className={d.codeInline}>UPSTASH_REDIS_REST_*</code> / legacy{' '}
                  <code className={d.codeInline}>KV_REST_API_*</code> pairs). After verification, the original token is marked used; the new{' '}
                  <code className={d.codeInline}>access_token</code> from <code className={d.codeInline}>/api/auth/verify</code> is for your downstream APIs—plan expiry and
                  rotation there separately.
                </p>
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <code className={d.codeBadge}>OAUTH_ISSUER</code>
                  <span className={d.pillOptional}>optional</span>
                </div>
                <p className={d.muted}>
                  Overrides the <code className={d.codeInline}>iss</code> claim when you want a stable issuer instead of deriving it from the deployment URL.
                </p>
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <code className={d.codeBadge}>USER_SUB_SALT</code>
                  <span className={d.pillOptional}>optional</span>
                </div>
                <p className={d.muted}>
                  Salt for deriving the configured user&apos;s <code className={d.codeInline}>sub</code>. If unset, the first 32 characters of{' '}
                  <code className={d.codeInline}>JWT_SECRET</code> are used—set an explicit salt when rotating JWT signing keys without changing subject identifiers.
                </p>
              </div>
            </div>
          </div>
          <div className={d.cardMuted}>
            <h4 className={`${d.h4} mb-3`}>ECDH key rotation (Redis)</h4>
            <div className="space-y-4 text-sm">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <code className={d.codeBadge}>ENABLE_KEY_ROTATION</code>
                  <span className={d.pillOptional}>optional</span>
                </div>
                <p className={d.muted}>
                  Set to <code className={d.codeInline}>1</code> or <code className={d.codeInline}>true</code> to rotate server ECDH keys using the same Redis credentials as replay
                  protection.
                </p>
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <code className={d.codeBadge}>KEY_ROTATION_TTL_SECONDS</code>
                  <span className={d.pillOptional}>optional</span>
                </div>
                <p className={d.muted}>Lifetime of a key pair in seconds (default seven days).</p>
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <code className={d.codeBadge}>KEY_ROTATION_TRANSITION_SECONDS</code>
                  <span className={d.pillOptional}>optional</span>
                </div>
                <p className={d.muted}>Overlap window where old and new public keys may both be advertised (default one day).</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="env-tips">
        <h3 id="env-tips" className={d.docSectionLabel}>
          Ops tips
        </h3>
        <div className={d.calloutWarn}>
          <div className="flex items-start gap-3">
            <FiAlertTriangle size={18} className={`mt-0.5 shrink-0 ${d.calloutWarnTitle}`} aria-hidden />
            <ul className={`${d.calloutWarnBody} list-disc space-y-1`}>
              <li>Never commit real env files; use Vercel / platform env UI or sealed CI secrets</li>
              <li>
                Rotate <code className={d.codeInline}>JWT_SECRET</code> and all derived sessions when you suspect compromise
              </li>
              <li>Separate secrets per environment (preview vs production)</li>
              <li>Store TOTP Base32 and WebAuthn JSON exports in a password manager, not tickets or chat</li>
              <li>
                After changing <code className={d.codeInline}>ACCESS_TOTP_SECRET</code> or WebAuthn JSON, confirm login once on a staging URL before promoting
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
