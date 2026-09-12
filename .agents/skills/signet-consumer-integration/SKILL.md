---
name: signet-consumer-integration
description: Signet (vercel-2fa) consumer integration — hosted signet-client.mjs, HTTP MCP tools, alignment with vercel-web-scripts. Use for Signet onboarding, /oauth hash flows, MCP signet_*, stripLoginCallbackFromUrl.
---

# Signet consumer integration

## Read first

1. This repo **`README.zh-CN.md`** — unified login service, static ESM SDK (Chinese narrative; English in `README.md`).
2. When **`/api/mcp`** is available, call tools to fetch the **deployed `origin`**, **`sdkExports`**, and **`mcpExamples`** so you do not hard-code the wrong host or miss parameters.

## Hosted SDK (`…/sdk/signet-client.mjs`)

| Export                                     | Purpose                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| `normalizeAuthCenterOrigin`                | Trim trailing `/` on Signet base URL                                      |
| `getVerifyApiUrl` / `getOAuthPublicKeyUrl` | Full URLs for verify + ECDH public-key endpoints                          |
| `buildLoginUrl` / `buildOAuthLoginUrl`     | Start `/login` or `/oauth`                                                |
| `parseLoginCallbackParams`                 | Read `token` / `state` from **full URL / hash / query / URLSearchParams** |
| `getLoginCallbackFromWindow`               | Browser: parse `location.href`                                            |
| `stripLoginCallbackFromUrl`                | Remove `token`/`state` from query **and** hash; pair with `replaceState`  |
| `isLoginCallbackTokenInHash`               | Detect typical `/oauth` hash callback                                     |
| `verifyTokenAtAuthCenter`                  | `POST /api/auth/verify`                                                   |

**Loading the SDK (match vercel-web-scripts `loadSignetSdk`):**

- **Browser**: `import(/* webpackIgnore: true */ sdkUrl)` where `sdkUrl` may be `https://…/signet-client.mjs`; **cache** the same Promise.
- **Node (App Router Route Handler)**: `import()` **does not** support `https:` — use **`fetch(sdkUrl)` → `data:text/javascript;base64,…` → `import(dataUrl)`**, or skip loading the SDK on the server and **`POST`** `/api/auth/verify` on the auth center with URLs you build yourself.

## Security (consumer)

1. **`state`**: compare callback `state` to the **pre-launch** value in constant time for `/login` and `/oauth`; server callbacks must read **HttpOnly** or an agreed store (the demo uses **non-HttpOnly** cookies for `document.cookie`; **first-party XSS** can read `state` — mitigate with CSP and code quality).
2. **`/login` `token` in query**: appears in **history, reverse-proxy logs, Referrer**; establish a local session quickly and **strip** the URL (`stripLoginCallbackFromUrl`); short-lived JWT reduces risk.
3. **`ALLOWED_REDIRECT_URLS`**: the auth center must enforce an allowlist; misconfigured origins leak tokens to the wrong site.
4. **`/oauth` ECDH**: ephemeral client keys live in **sessionStorage**; **first-party XSS** can steal keys — CSP, dependency review, HTTPS.
5. **Env**: if `getSignetAuthCenterOrigin` / `NEXT_PUBLIC_SIGNET_SDK_URL` point to a malicious host, tokens may be **POSTed to an attacker** — verify domains before deploy.

## MCP tools and sample `arguments`

Call **`signet_get_integration_guide`** once for `hostedSdkUrl`, `sdkExports`, `mcpExamples`, `pitfalls`.

Typical payloads (paste into MCP `arguments`):

```json
{
  "name": "signet_get_integration_guide",
  "arguments": { "framework": "nextjs", "encryptedReturn": true }
}
```

```json
{
  "name": "signet_build_login_url",
  "arguments": {
    "redirectUrl": "https://your-app.example.com/auth/callback",
    "state": "550e8400-e29b-41d4-a716-446655440000",
    "encryptedReturn": false
}
```

```json
{
  "name": "signet_validate_redirect_url",
  "arguments": { "redirectUrl": "https://your-app.example.com/auth/callback" }
}
```

When `encryptedReturn: true`, **`signet_build_login_url`** must include **`clientPublicKey`** (see tool schema).

## Alignment with vercel-web-scripts

- `lib/signet-sdk-url.ts` — `getSignetSdkModuleUrl()`
- `lib/load-signet-sdk.ts` — `loadSignetSdk()`
- `/auth/vercel-2fa/callback` — `/login` return: server `parseLoginCallbackParams(searchParams)` + `verifyTokenAtAuthCenter`
- OAuth — `buildOAuthLoginUrl`; callback `parseLoginCallbackParams(href)`; on success **`await stripLoginCallbackFromUrl`** (via SDK)

## Anti-patterns

1. `/oauth` callback uses only `useSearchParams()` → token never appears.
2. Route Handler reads token from hash via `request.url` → **impossible** for top-level navigation.
3. Missing `ALLOWED_REDIRECT_URLS` → cross-origin callback rejected.
4. Node Route Handler `import('https://…/signet-client.mjs')` → **`ERR_UNSUPPORTED_ESM_URL_SCHEME`**.

## Do not

Do not ask the AI to **enter passwords, complete 2FA, or impersonate the user** on Signet.

## Keep in sync when editing

- `public/sdk/signet-client.mjs`
- `services/mcp/signetIntegrationShared.ts` (MCP skill + Getting Started snippets)
- `services/mcp/signetTools.ts`
- `README.md` / `README.zh-CN.md` (static ESM SDK, Next.js / Node loading)
- This SKILL
