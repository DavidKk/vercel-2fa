import type { StoreCredentials } from './types'

export function encodePublicKey(publicKey: Uint8Array<ArrayBufferLike>) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(publicKey).toString('base64')
  }

  return btoa(String.fromCharCode.apply(null, Array.from(publicKey)))
}

export function decodePublicKey(base64Str: string) {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64Str, 'base64'))
  }

  return new Uint8Array(
    atob(base64Str)
      .split('')
      .map((c) => c.charCodeAt(0))
  )
}

export function credentialsToString(credentials: StoreCredentials): string {
  const publicKey = encodePublicKey(credentials.publicKey)
  const credentialsWithBase64 = { ...credentials, publicKey }
  return JSON.stringify(credentialsWithBase64)
}

/**
 * Strip port and normalize host header / hostname for lookups.
 */
export function normalizeRequestHostname(hostHeader: string | null | undefined): string {
  if (!hostHeader) {
    return ''
  }
  return hostHeader.split(',')[0].trim().split(':')[0].toLowerCase()
}

/**
 * WebAuthn: current host may equal rpId or be a subdomain of rpId (rpId is registrable suffix).
 */
export function credentialRpIdMatchesHost(hostname: string, rpId: string): boolean {
  const h = hostname.toLowerCase()
  const r = rpId.toLowerCase()
  if (!h || !r) {
    return false
  }
  return h === r || h.endsWith(`.${r}`)
}

function normalizeOneCredential(parsed: Record<string, unknown>): StoreCredentials | null {
  const credentialID = (typeof parsed.credentialID === 'string' && parsed.credentialID) || (typeof parsed.id === 'string' && parsed.id) || ''
  const publicKeyB64 = typeof parsed.publicKey === 'string' ? parsed.publicKey : ''
  const rpId = typeof parsed.rpId === 'string' ? parsed.rpId : ''
  const username = typeof parsed.username === 'string' ? parsed.username : ''
  if (!credentialID || !publicKeyB64 || !rpId) {
    return null
  }
  try {
    const publicKey = decodePublicKey(publicKeyB64)
    return { credentialID, publicKey, rpId, username }
  } catch {
    return null
  }
}

/**
 * Parse a single-credential JSON (flat object). Returns null for multi-host wrappers — use
 * {@link resolveWebAuthnCredentialsForHost} instead.
 */
export function stringToCredentials(jsonString: string): StoreCredentials | null {
  try {
    const raw = JSON.parse(jsonString) as unknown
    if (Array.isArray(raw) || typeof raw !== 'object' || raw === null) {
      return null
    }
    const parsed = raw as Record<string, unknown>
    if (parsed.byHost != null || parsed.credentials != null) {
      return null
    }
    return normalizeOneCredential(parsed)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('stringToCredentials error: ', err)
    return null
  }
}

/**
 * Resolve the passkey JSON for the current HTTP host. Supports:
 *
 * 1. **Legacy** — one flat object `{ credentialID, publicKey, rpId, username }` (only used when
 *    {@link credentialRpIdMatchesHost} is true for the request host).
 * 2. **`byHost`** — `{ "byHost": { "localhost": { ... }, "vercel-2fa.vercel.app": { ... } } }`
 *    Keys are hostnames (no port, case-insensitive). Each value is a full credential object.
 * 3. **`credentials`** — `{ "credentials": [ { ... }, { ... } ] }` — first entry whose `rpId`
 *    matches the request host wins.
 * 4. **Root array** — `[ { ... }, { ... } ]` — same matching as (3).
 */
export function resolveWebAuthnCredentialsForHost(jsonString: string, requestHostname: string): StoreCredentials | null {
  const nh = normalizeRequestHostname(requestHostname)
  if (!jsonString.trim() || !nh) {
    return null
  }
  try {
    const raw = JSON.parse(jsonString) as unknown

    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (!item || typeof item !== 'object') {
          continue
        }
        const c = normalizeOneCredential(item as Record<string, unknown>)
        if (c && credentialRpIdMatchesHost(nh, c.rpId)) {
          return c
        }
      }
      return null
    }

    if (typeof raw !== 'object' || raw === null) {
      return null
    }
    const parsed = raw as Record<string, unknown>

    if (parsed.byHost != null && typeof parsed.byHost === 'object' && parsed.byHost !== null && !Array.isArray(parsed.byHost)) {
      const byHost = parsed.byHost as Record<string, unknown>
      for (const [key, val] of Object.entries(byHost)) {
        if (normalizeRequestHostname(key) === nh && val && typeof val === 'object') {
          const c = normalizeOneCredential(val as Record<string, unknown>)
          if (c) {
            return c
          }
        }
      }
      for (const val of Object.values(byHost)) {
        if (!val || typeof val !== 'object') {
          continue
        }
        const c = normalizeOneCredential(val as Record<string, unknown>)
        if (c && credentialRpIdMatchesHost(nh, c.rpId)) {
          return c
        }
      }
      return null
    }

    if (Array.isArray(parsed.credentials)) {
      for (const item of parsed.credentials) {
        if (!item || typeof item !== 'object') {
          continue
        }
        const c = normalizeOneCredential(item as Record<string, unknown>)
        if (c && credentialRpIdMatchesHost(nh, c.rpId)) {
          return c
        }
      }
      return null
    }

    const single = normalizeOneCredential(parsed)
    if (!single) {
      return null
    }
    if (credentialRpIdMatchesHost(nh, single.rpId)) {
      return single
    }
    return null
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('resolveWebAuthnCredentialsForHost error: ', err)
    return null
  }
}
