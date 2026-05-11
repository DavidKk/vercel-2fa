/**
 * Vercel 2FA — minimal browser + Node (Next.js) integration helpers.
 * Hosted as static ESM; use with Next.js experimental.urlImports or any ESM bundler.
 */

/**
 * Normalize auth center base URL (no trailing slash).
 * @param {string} origin - Base URL (e.g. https://your-2fa.example.com)
 * @returns {string}
 */
export function normalizeAuthCenterOrigin(origin) {
  return String(origin || '').replace(/\/+$/, '')
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
 * Parse token and state from callback query string (after redirect from auth center).
 * @param {URLSearchParams | string} input - searchParams or full URL string
 * @returns {{ token: string | null, state: string | null }}
 */
export function parseLoginCallbackParams(input) {
  let params
  if (typeof input === 'string') {
    try {
      params = new URL(input).searchParams
    } catch {
      params = new URLSearchParams(input.startsWith('?') ? input : `?${input}`)
    }
  } else {
    params = input
  }
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
  const base = normalizeAuthCenterOrigin(authCenterOrigin)
  const verifyUrl = `${base}/api/auth/verify`
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
