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
    desc: 'Browser lands on redirectUrl with token=… and the same state you sent (if any).',
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

/** React: callback page read token + state */
export const SIGNET_REACT_AUTH_CALLBACK_JS = `function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const state = params.get('state')

    if (!token) return
    if (state !== sessionStorage.getItem('oauth_state')) {
      throw new Error('Invalid state')
    }
    sessionStorage.removeItem('oauth_state')

    void verifyTokenAndCreateSession(token)
  }, [])

  return <div>Signing you in...</div>
}`

/** Practices list (same bullets as integration page) */
export const SIGNET_INTEGRATION_PRACTICE_BULLETS = [
  'Whitelist every production callback origin in ALLOWED_REDIRECT_URLS; use wildcards sparingly',
  'Generate a fresh state per attempt; reject callbacks with missing or stale state',
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
| **ECDH OAuth-style** | \`YOUR_AUTH_HOST/oauth?...\` | Encrypted payload (see playground / ECDH docs) | Client keypair, \`ECDH_SERVER_PRIVATE_KEY\` on Signet, \`/api/oauth/public-key\` |

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

After the user completes 2FA on Signet, the browser lands on:

\`{redirectUrl}?token=<jwt>&state=<same-state-if-sent>\`

Handler checklist:

1. Read \`token\` and optional \`state\` from the query string.
2. If you sent \`state\`, require a match with the value stored at login start; else reject.
3. **Do not** treat \`token\` as a long-lived session secret by itself — exchange it for **your** session after verification (see below).
4. Clear \`token\` from the URL (replaceState) after reading to avoid leaking in referrers.

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

1. \`signet_get_integration_guide\` — routes, env list, copy-paste verify snippet (\`framework\`: \`generic\` | \`nextjs\`).
2. \`signet_build_login_url\` — canonical URL for a given \`redirectUrl\` / \`state\` / ECDH flags.
3. \`signet_validate_redirect_url\` — confirm allowlist will accept the callback URL.
4. \`signet_get_env_checklist\` — required keys for TOTP/WebAuthn/ECDH/replay.

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

## 中文速览

- **定位**：Signet 是「单管理员账号 + TOTP / WebAuthn」的托管登录站；业务系统**不保存**管理员密码，只做跳转、回跳带短期 JWT、校验后**自建会话**。
- **主路径**：浏览器访问 \`YOUR_AUTH_HOST/login?redirectUrl=…&state=…\` → 用户在本站完成密码与第二因子 → 浏览器回到 \`redirectUrl?token=…&state=…\` → 用共享 \`JWT_SECRET\` 验签，或 **POST** \`YOUR_AUTH_HOST/api/auth/verify\`（浏览器需 HTTPS、\`Origin\` 符合白名单）→ 用返回的 \`data\` 签发业务会话。
- **跨域**：回调站点的 origin 必须出现在 Signet 的 \`ALLOWED_REDIRECT_URLS\` 中。
- **与英文关系**：流程、代码块、实践列表与站内「Project integration」及上文英文章节一致；**带真实域名的 URL** 请用本 MCP 的 \`signet_build_login_url\` / \`signet_get_integration_guide\`（内含当前部署 \`origin\`）。
- **不要用 MCP 做**：代填密码、代过 2FA、冒充真人操作。
`
}
