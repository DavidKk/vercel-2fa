/**
 * Single source for third-party login copy and code snippets shared between
 * the Getting Started integration page and the Signet MCP skill resource.
 */

/** Flow cards: same titles/descriptions as `/getting-started/integration` */
export const SIGNET_INTEGRATION_FLOW_STEPS = [
  {
    step: '1',
    title: 'Redirect',
    desc: 'Send the browser to /login with redirectUrl (absolute or same-origin path) and optional state.',
  },
  {
    step: '2',
    title: 'Sign in',
    desc: 'User enters password; TOTP if configured; or WebAuthn-only when enabled. Remember me changes JWT lifetime.',
  },
  {
    step: '3',
    title: 'Return',
    desc: '`/login`: token + optional state in **query** (`?token=&state=`). `/oauth` (ECDH): encrypted return in **hash** (`#token=&state=`). Prefer `parseLoginCallbackParams(window.location.href)` from the hosted SDK so one path covers both.',
  },
  {
    step: '4',
    title: 'Verify',
    desc: 'Your backend verifies the JWT (shared secret) or calls /api/auth/verify, then issues your own session.',
  },
] as const

/** Login URL example (replace YOUR_AUTH_HOST with your Signet base, no trailing slash) */
export const SIGNET_LOGIN_URL_EXAMPLE_JS = `const login = new URL('https://YOUR_AUTH_HOST/login')
login.searchParams.set('redirectUrl', 'https://your-app.example.com/auth/callback')
login.searchParams.set('state', crypto.randomUUID())
window.location.href = login.toString()`

/** Option A: verify callback JWT locally with jose */
export const SIGNET_JWT_VERIFY_JOSE_SNIPPET = `import { jwtVerify } from 'jose'

const { payload } = await jwtVerify(
  token,
  new TextEncoder().encode(process.env.JWT_SECRET!)
)
if (payload?.authenticated === true) {
  // issue your own session cookie / API token
}`

/** Option B: POST to Signet verify API */
export const SIGNET_VERIFY_API_FETCH_JS = `const res = await fetch('https://YOUR_AUTH_HOST/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token }),
})
const body = await res.json()
if (body.code === 0 && body.data?.access_token) {
  // trusted login — use body.data.user for display; body.data.access_token for APIs
}`

/** React: start login redirect */
export const SIGNET_REACT_HANDLE_LOGIN_JS = `function handleLogin() {
  const state = crypto.randomUUID()
  sessionStorage.setItem('oauth_state', state)

  const callback = window.location.origin + '/auth/callback'
  const url = new URL('https://YOUR_AUTH_HOST/login')
  url.searchParams.set('redirectUrl', callback)
  url.searchParams.set('state', state)

  window.location.href = url.toString()
}`

/**
 * React: callback — use hosted SDK `parseLoginCallbackParams` on **full href** so `/oauth` hash
 * returns are not missed (reading `location.search` alone is a common bug).
 */
export const SIGNET_REACT_AUTH_CALLBACK_JS = `function AuthCallback() {
  useEffect(() => {
    const run = async () => {
      const signet = await import('https://YOUR_AUTH_HOST/sdk/signet-client.mjs')
      const { token, state } = signet.parseLoginCallbackParams(window.location.href)
      if (!token) return
      if (state !== sessionStorage.getItem('oauth_state')) {
        throw new Error('Invalid state')
      }
      sessionStorage.removeItem('oauth_state')
      await verifyTokenAndCreateSession(token)
      history.replaceState(history.state, '', signet.stripLoginCallbackFromUrl(window.location.href))
    }
    void run()
  }, [])

  return <div>Signing you in...</div>
}`

/** Practices list (same bullets as integration page) */
export const SIGNET_INTEGRATION_PRACTICE_BULLETS = [
  'Whitelist every production callback origin in ALLOWED_REDIRECT_URLS; use wildcards sparingly',
  'Generate a fresh state per attempt; reject callbacks with missing or stale state',
  'For `/oauth` returns, never rely on `useSearchParams()` / query-only parsers — the token is in the **hash** until you use `parseLoginCallbackParams(fullUrl)`',
  'Do not log full JWTs; log correlation ids only',
  'Re-verify on privileged actions if your session is long-lived',
  'Align JWT_EXPIRES_IN with your risk tolerance; Remember me off caps sessions at 1d',
] as const

function flowStepsMarkdown(): string {
  return SIGNET_INTEGRATION_FLOW_STEPS.map((s) => `${s.step}. **${s.title}** — ${s.desc}`).join('\n')
}

function practicesMarkdown(): string {
  return SIGNET_INTEGRATION_PRACTICE_BULLETS.map((line) => `- ${line}`).join('\n')
}

/**
 * Builds the full markdown body for the Signet MCP skill resource (English + Chinese summary).
 * @returns Markdown string for `resources/read`
 */
export function getSignetMcpSkillMarkdown(): string {
  return `# Signet — third-party login (agent integration)

## What this service is

- **Hosted IdP for one configured admin user** (ACCESS_USERNAME / ACCESS_PASSWORD) plus **TOTP and/or WebAuthn** as second factor.
- Your consumer app **never stores** that password. You only: **redirect → callback with a short-lived JWT → verify → issue your own session**.
- **Not** multi-tenant user signup; tokens identify the configured Signet user.

Use **live URLs** from this MCP session: call \`signet_get_integration_guide\`, \`signet_build_login_url\`, \`signet_validate_redirect_url\`, \`signet_get_env_checklist\` (they use the deployment \`origin\`). Below, **YOUR_AUTH_HOST** is your Signet base URL with scheme and host, **no trailing slash** (same placeholder as the in-app integration guide).

---

## Quick flow (matches in-app Getting Started)

${flowStepsMarkdown()}

---

## Choose a return mode

| Mode | Path | Callback carries | Consumer needs |
|------|------|------------------|----------------|
| **Direct JWT** (default) | \`YOUR_AUTH_HOST/login?...\` | Query \`token\` (+ optional \`state\`) | Verify JWT locally with shared \`JWT_SECRET\`, **or** POST to \`/api/auth/verify\` |
| **ECDH OAuth-style** | \`YOUR_AUTH_HOST/oauth?...\` | **Hash** \`#token=…&state=…\` (encrypted payload; decrypt client-side) | Client keypair, \`ECDH_SERVER_PRIVATE_KEY\` on Signet, \`/api/oauth/public-key\`; **must** parse \`window.location.href\`, not query-only |

Most integrations use **direct JWT** unless you explicitly need encrypted return.

---

## Step 1 — Build the login URL

Required query params:

| Param | Required | Notes |
|-------|----------|--------|
| \`redirectUrl\` | Yes | **URL-encoded**. Where the browser goes after success. Cross-origin **must** match \`ALLOWED_REDIRECT_URLS\` on Signet. Same-origin relative paths allowed when host matches. |
| \`state\` | Strongly recommended | Opaque CSRF value; Signet echoes it on the callback. Compare in your callback before trusting \`token\`. |

Example (browser redirect) — **same snippet as** \`/getting-started/integration\`:

\`\`\`javascript
${SIGNET_LOGIN_URL_EXAMPLE_JS}
\`\`\`

**Before shipping:** run \`signet_validate_redirect_url\` with the same \`redirectUrl\` you will use in production.

---

## Step 2 — Callback route (consumer app)

**Direct \`/login\`:** browser lands on \`{redirectUrl}?token=<jwt>&state=…\` (query only — **server** Route Handlers can read \`request.url\` search params).

**\`/oauth\` (ECDH):** Signet redirects with \`token\` / \`state\` in the **URL hash** (\`#…\`). **The hash is never sent to the server.** Client code must read \`window.location.href\` (or hash) on the callback page; \`useSearchParams()\` alone will miss the token.

**Recommended:** load \`YOUR_AUTH_HOST/sdk/signet-client.mjs\` and use \`parseLoginCallbackParams(window.location.href)\` (or \`getLoginCallbackFromWindow()\`). After handling the callback, clear sensitive query/hash keys with \`stripLoginCallbackFromUrl(window.location.href)\` before \`replaceState\`.

Handler checklist:

1. Parse \`token\` / \`state\` with the SDK (or equivalent hash-aware parser); do **not** assume query-only.
2. If you sent \`state\`, require a match with the value stored at login start; else reject.
3. Exchange the verified identity for **your** session (\`/api/auth/verify\` or local JWT verify) — do not treat the callback token as a long-lived browser session by itself.
4. Strip sensitive params from the address bar (\`history.replaceState\`) after reading.

---

## Hosted SDK — Next.js / bundler notes

- **URL:** \`YOUR_AUTH_HOST/sdk/signet-client.mjs\` (CORS \`*\` on \`/sdk/*\` from this deployment).
- **Browser:** \`await import(url)\` works; with Webpack/Next client bundles use \`import(/* webpackIgnore: true */ url)\` so the bundler does not try to resolve the remote specifier at build time.
- **Route Handlers (Node):** you may \`await import(/* webpackIgnore: true */ sdkUrl)\` once and cache the module promise (same helpers as the browser). Avoid duplicating \`parseLoginCallbackParams\` / \`verifyTokenAtAuthCenter\` in the consumer repo when you can import the hosted file.
- **Consumer env (typical):** \`NEXT_PUBLIC_VERCEL_2FA_ORIGIN\` (Signet base, no trailing slash) for the browser; \`VERCEL_2FA_ORIGIN\` for server-only verify if you do not expose the public var; optional \`NEXT_PUBLIC_SIGNET_SDK_URL\` if the \`.mjs\` is on a CDN.

### SDK exports (single module)

| Export | Role |
|--------|------|
| \`normalizeAuthCenterOrigin\` | Trim trailing slash on Signet base URL |
| \`getVerifyApiUrl\` / \`getOAuthPublicKeyUrl\` | Canonical \`/api/auth/verify\` and \`/api/oauth/public-key\` URLs |
| \`buildLoginUrl\` / \`buildOAuthLoginUrl\` | Build \`/login\` or \`/oauth\` start URLs |
| \`parseLoginCallbackParams\` | Read \`token\` / \`state\` from full URL string, \`#hash\`, \`?query\`, or \`URLSearchParams\` |
| \`getLoginCallbackFromWindow\` | Browser helper = parse on \`location.href\` |
| \`stripLoginCallbackFromUrl\` | Remove Signet \`token\` & \`state\` from **both** query and hash (safe \`replaceState\` target) |
| \`isLoginCallbackTokenInHash\` | Returns true when \`token\` appears in the hash (typical \`/oauth\` return) |
| \`verifyTokenAtAuthCenter\` | \`POST\` JSON to verify endpoint |

---

## Reference implementation — \`vercel-web-scripts\` (MagickMonkey)

Public repo pattern (keep names in sync when copying ideas):

- \`lib/signet-sdk-url.ts\` — resolves \`getSignetSdkModuleUrl()\` from env.
- \`lib/load-signet-sdk.ts\` — cached \`loadSignetSdk()\` wrapping dynamic import + \`webpackIgnore\`.
- \`/auth/vercel-2fa/callback\` Route Handler — \`await loadSignetSdk()\` then \`parseLoginCallbackParams(searchParams)\` + \`verifyTokenAtAuthCenter\` for **\`/login\`** return (query-only on server).
- OAuth hook — \`buildOAuthLoginUrl\` from SDK for launch; \`parseLoginCallbackParams(window.location.href)\` after load for **hash** returns; \`stripLoginCallbackFromUrl\` after success to scrub the address bar.

---

## Step 3 — Verify the callback token

### Option A — Verify locally (you hold \`JWT_SECRET\`)

- Same secret as Signet’s \`JWT_SECRET\`.
- Validate signature, \`exp\`, and \`payload.authenticated === true\`.
- Prefer validating \`sub\` / username against your policy (token should match configured Signet user).

Snippet (same as in-app guide):

\`\`\`typescript
${SIGNET_JWT_VERIFY_JOSE_SNIPPET}
\`\`\`

### Option B — POST \`YOUR_AUTH_HOST/api/auth/verify\` (no secret in consumer)

**Contract:**

- \`POST\` JSON body: \`{ "token": "<callback-jwt>", "audience"?: "your-app", "scope"?: "..." }\`
- **Browser / CORS:** \`Origin\` must be allowed (aligned with redirect allowlist rules). **HTTPS required** for browser calls to verify.
- Success envelope (typical): \`{ "code": 0, "data": { ... } }\` where \`data\` includes OAuth-like fields, e.g.:
  - \`access_token\` — new JWT for your APIs / session bootstrap
  - \`token_type\`: \`Bearer\`
  - \`expires_in\` — seconds
  - \`user\` — \`sub\`, \`username\`, \`email\`, etc.
  - optional \`claims\`

On non-zero \`code\` or 401-style responses, treat as failed login; show a safe error and do not issue an app session.

Snippet (same as in-app guide):

\`\`\`javascript
${SIGNET_VERIFY_API_FETCH_JS}
\`\`\`

---

## Step 4 — Issue **your** app session

- Map \`data.user\` (and optionally \`data.access_token\`) to **your** cookie/session or API token store.
- **One-time use:** if Signet has **token replay protection** enabled, the **callback** JWT may only be consumed once at verify — design UX so double-submit does not confuse users.

---

## React sketches (same as in-app guide)

**Start login**

\`\`\`tsx
${SIGNET_REACT_HANDLE_LOGIN_JS}
\`\`\`

**Callback route**

\`\`\`tsx
${SIGNET_REACT_AUTH_CALLBACK_JS}
\`\`\`

---

## Operator env checklist (Signet deployment)

Minimum to run Signet:

- \`ACCESS_USERNAME\`, \`ACCESS_PASSWORD\`, \`JWT_SECRET\` (32+ chars)
- At least one of \`ACCESS_TOTP_SECRET\` **or** \`ACCESS_WEBAUTHN_SECRET\`

For **cross-origin** callbacks from your apps:

- \`ALLOWED_REDIRECT_URLS\` — comma-separated origins/patterns (supports wildcards like \`https://*.example.com\` per product docs)

For **ECDH /oauth** return path additionally:

- \`ECDH_SERVER_PRIVATE_KEY\` (and clients fetch server public key via \`GET YOUR_AUTH_HOST/api/oauth/public-key\`)

Optional / advanced:

- \`JWT_EXPIRES_IN\`, \`ACCESS_EMAIL\`, \`OAUTH_ISSUER\`, \`USER_SUB_SALT\`
- Replay protection: \`ENABLE_TOKEN_REPLAY_PROTECTION\`, \`AUTH_KV_REST_API_URL\`, \`AUTH_KV_REST_API_TOKEN\`

Use \`signet_get_env_checklist\` with the same flags you plan to enable.

---

## MCP tools (use in order when helping a developer)

1. \`signet_get_integration_guide\` — routes, hosted SDK URL, pitfalls, \`vercel-web-scripts\`-style notes, verify snippet (\`framework\`: \`generic\` | \`nextjs\`).
2. \`signet_build_login_url\` — canonical URL for a given \`redirectUrl\` / \`state\` / ECDH flags.
3. \`signet_validate_redirect_url\` — confirm allowlist will accept the callback URL.
4. \`signet_get_env_checklist\` — required keys for TOTP/WebAuthn/ECDH/replay.

---

## Pitfalls (real bugs we have seen)

| Pitfall | Symptom | Fix |
|--------|---------|-----|
| OAuth return, query-only parser | Callback page “does nothing” | Use \`parseLoginCallbackParams(window.location.href)\` or read \`location.hash\` |
| Next \`useSearchParams()\` only | Same as above for \`/oauth\` | Hash is not in search params |
| Server Route Handler expects hash | Token always missing | Only query reaches the server for top-level navigation; use \`/login\` for server-side callback or handle OAuth on the client first |
| \`redirectUrl\` not allowlisted | 400 / blocked redirect | Set \`ALLOWED_REDIRECT_URLS\` on Signet; run \`signet_validate_redirect_url\` |
| Browser \`POST /api/auth/verify\` without HTTPS | Rejected | Use HTTPS in production for browser-origin calls |

---

## Practices (same as in-app guide)

${practicesMarkdown()}

---

## Security boundaries (do not skip)

- **Never** ask the Signet MCP to complete 2FA, enter passwords, or impersonate the human user.
- Snippets are **scaffolding** — the consumer app owns authorization, session length, and CSRF policy.
- Prefer **HTTPS** for all callback origins in production; align \`secure\` cookie flags with your environment.
- Do **not** log full JWTs in app logs; use correlation ids.

---

## Human docs (deeper narrative)

In-app: **Getting started → Project integration** (\`/getting-started/integration\`) and **Environment variables** (\`/getting-started/env\`).

---

## Quick reference

- **Role**: Signet is a hosted login hub (single admin account + TOTP / WebAuthn). Consumer apps **do not store** the admin password; they redirect, receive a short-lived JWT on return, verify it, then **issue their own session**.
- **\`/login\`**: return uses **query** \`?token=&state=\`; Route Handlers can read \`URL\` search params.
- **\`/oauth\` (ECDH)**: return uses **hash** \`#token=&state=\`; **not** visible to the server on top-level navigation; parse the **full** \`href\` (e.g. \`parseLoginCallbackParams(window.location.href)\`), not only \`useSearchParams()\`.
- **Hosted SDK**: \`YOUR_AUTH_HOST/sdk/signet-client.mjs\` (exports include \`stripLoginCallbackFromUrl\`, \`getVerifyApiUrl\`, etc.; see MCP \`sdkExports\`); same usage pattern as **vercel-web-scripts** \`lib/load-signet-sdk.ts\`.
- **Cross-origin**: callback URLs must be in Signet \`ALLOWED_REDIRECT_URLS\`; use MCP \`signet_validate_redirect_url\` when unsure.
- **Do not use MCP for**: entering passwords, completing 2FA, or impersonating a human.
`
}
