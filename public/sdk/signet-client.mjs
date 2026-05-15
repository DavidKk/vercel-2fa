/**
 * Signet — minimal browser + Node (Next.js) integration helpers.
 * Hosted as static ESM; browsers can dynamic-import it directly.
 * In plain Node/Next.js Route Handlers, fetch once and import from a data: URL.
 */

/** Query + hash keys used on Signet login callbacks */
const LOGIN_CALLBACK_PARAM_KEYS = ['token', 'state']

/**
 * Normalize auth center base URL (no trailing slash).
 * @param {string} origin - Base URL (e.g. https://your-signet.example.com)
 * @returns {string}
 */
export function normalizeAuthCenterOrigin(origin) {
  return String(origin || '').replace(/\/+$/, '')
}

/**
 * Full URL for `POST /api/auth/verify` on the auth center.
 * @param {string} authCenterOrigin - Auth center base URL
 * @returns {string}
 */
export function getVerifyApiUrl(authCenterOrigin) {
  const base = normalizeAuthCenterOrigin(authCenterOrigin)
  return `${base}/api/auth/verify`
}

/**
 * Full URL for `GET /api/oauth/public-key` (ECDH flows).
 * @param {string} authCenterOrigin - Auth center base URL
 * @returns {string}
 */
export function getOAuthPublicKeyUrl(authCenterOrigin) {
  const base = normalizeAuthCenterOrigin(authCenterOrigin)
  return `${base}/api/oauth/public-key`
}

/**
 * Build login URL for the unified /login flow (password + 2FA at auth center).
 * @param {object} options - Options
 * @param {string} options.authCenterOrigin - Auth center base URL
 * @param {string} options.redirectUrl - Absolute callback URL on your app (must be allowlisted server-side)
 * @param {string} [options.state] - Optional CSRF state (your app should validate on callback)
 * @returns {string} Full login URL
 */
export function buildLoginUrl(options) {
  const { authCenterOrigin, redirectUrl, state } = options
  const base = normalizeAuthCenterOrigin(authCenterOrigin)
  const url = new URL('/login', `${base}/`)
  url.searchParams.set('redirectUrl', redirectUrl)
  if (state != null && state !== '') {
    url.searchParams.set('state', String(state))
  }
  return url.toString()
}

/**
 * Build `/oauth` URL for ECDH-encrypted return (cross-site redirect uses `#token=` / `#state=` on your callback).
 * @param {object} options - Options
 * @param {string} options.authCenterOrigin - Auth center base URL
 * @param {string} options.redirectUrl - Absolute callback URL (allowlisted); Signet will encodeURIComponent this in the query
 * @param {string} options.state - CSRF state (validate on callback)
 * @param {string} options.clientPublicKey - Base64 SPKI client ECDH public key
 * @param {string} [options.callbackOrigin] - Optional postMessage origin for popup flow
 * @returns {string} Full `/oauth` URL
 */
export function buildOAuthLoginUrl(options) {
  const { authCenterOrigin, redirectUrl, state, clientPublicKey, callbackOrigin } = options
  const base = normalizeAuthCenterOrigin(authCenterOrigin)
  const url = new URL('/oauth', `${base}/`)
  url.searchParams.set('redirectUrl', encodeURIComponent(redirectUrl))
  if (state != null && state !== '') {
    url.searchParams.set('state', String(state))
  }
  if (clientPublicKey != null && clientPublicKey !== '') {
    url.searchParams.set('clientPublicKey', String(clientPublicKey))
  }
  if (callbackOrigin != null && callbackOrigin !== '') {
    url.searchParams.set('callbackOrigin', String(callbackOrigin))
  }
  return url.toString()
}

/**
 * Parse token and state from callback after redirect from auth center.
 * - **`/login`**: token and state are in the **query** (`?token=&state=`).
 * - **`/oauth`** (cross-site): token and state are in the **hash** (`#token=&state=`); query is tried second.
 *
 * When `input` is `URLSearchParams`, only query keys are read (no hash context).
 *
 * @param {URLSearchParams | string} input - Full callback URL, `?query`, `#hash`, or `URLSearchParams`
 * @returns {{ token: string | null, state: string | null }}
 */
export function parseLoginCallbackParams(input) {
  if (typeof input === 'string') {
    const raw = String(input).trim()
    if (raw.startsWith('#')) {
      const hp = new URLSearchParams(raw.slice(1))
      const th = hp.get('token')
      if (th) {
        return { token: th || null, state: hp.get('state') || null }
      }
    }
    try {
      const u = new URL(raw)
      const hash = u.hash.replace(/^#/, '')
      if (hash) {
        const hp = new URLSearchParams(hash)
        const th = hp.get('token')
        if (th) {
          return { token: th || null, state: hp.get('state') || null }
        }
      }
      const params = u.searchParams
      const token = params.get('token')
      const state = params.get('state')
      return { token: token || null, state: state || null }
    } catch {
      const params = new URLSearchParams(raw.startsWith('?') ? raw : `?${raw}`)
      const token = params.get('token')
      const state = params.get('state')
      return { token: token || null, state: state || null }
    }
  }

  const params = input
  const token = params.get('token')
  const state = params.get('state')
  return {
    token: token || null,
    state: state || null,
  }
}

/**
 * POST token to auth center /api/auth/verify (no JWT secret required on your server).
 * Server-side fetch needs no Origin header (allowed). Browser calls require HTTPS + allowed Origin on auth center.
 * @param {object} options - Options
 * @param {string} options.authCenterOrigin - Auth center base URL
 * @param {string} options.token - JWT from login redirect
 * @param {string} [options.audience] - Optional OAuth audience
 * @param {string} [options.scope] - Optional OAuth scope
 * @param {typeof fetch} [options.fetch] - Fetch implementation (default globalThis.fetch)
 * @returns {Promise<{ ok: boolean, status: number, response: object | null, error?: string }>}
 */
export async function verifyTokenAtAuthCenter(options) {
  const { authCenterOrigin, token, audience, scope, fetch: fetchImpl = globalThis.fetch } = options
  const verifyUrl = getVerifyApiUrl(authCenterOrigin)
  /** @type {Record<string, unknown>} */
  const body = { token }
  if (audience != null) body.audience = audience
  if (scope != null) body.scope = scope

  let res
  try {
    res = await fetchImpl(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, status: 0, response: null, error: msg }
  }

  /** @type {object | null} */
  let json = null
  try {
    json = await res.json()
  } catch {
    json = null
  }

  const code = json && typeof json.code === 'number' ? json.code : -1
  const ok = res.ok && code === 0
  const message = json && typeof json.message === 'string' ? json.message : res.statusText || 'verify failed'

  return {
    ok,
    status: res.status,
    response: json,
    error: ok ? undefined : message,
  }
}

/**
 * Read token/state from the current browser location (no-op on non-browser runtimes).
 * @returns {{ token: string | null, state: string | null }}
 */
export function getLoginCallbackFromWindow() {
  if (typeof globalThis.location === 'undefined' || !globalThis.location.href) {
    return { token: null, state: null }
  }
  return parseLoginCallbackParams(globalThis.location.href)
}

/**
 * Remove Signet callback `token` and `state` from both query and hash (safe for `history.replaceState`).
 * @param {string} href - Full page URL (e.g. `window.location.href`)
 * @returns {string} Sanitized absolute URL
 */
export function stripLoginCallbackFromUrl(href) {
  const u = new URL(String(href))
  for (const key of LOGIN_CALLBACK_PARAM_KEYS) {
    u.searchParams.delete(key)
  }
  const rawHash = u.hash.replace(/^#/, '')
  if (rawHash) {
    const hp = new URLSearchParams(rawHash)
    for (const key of LOGIN_CALLBACK_PARAM_KEYS) {
      hp.delete(key)
    }
    const rest = hp.toString()
    u.hash = rest ? `#${rest}` : ''
  }
  return u.toString()
}

/**
 * Whether `href` carries a `token` in the **hash** (typical `/oauth` ECDH return).
 * @param {string} href - Full URL or fragment
 * @returns {boolean}
 */
export function isLoginCallbackTokenInHash(href) {
  const raw = String(href || '').trim()
  try {
    const u = raw.includes('://') ? new URL(raw) : new URL(raw, 'http://local.invalid/')
    const hash = u.hash.replace(/^#/, '')
    if (!hash) return false
    const th = new URLSearchParams(hash).get('token')
    return Boolean(th)
  } catch {
    if (raw.startsWith('#')) {
      return Boolean(new URLSearchParams(raw.slice(1)).get('token'))
    }
    return false
  }
}
