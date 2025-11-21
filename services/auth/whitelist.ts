import { textUnauthorized } from '@/initializer/response'

type CorsMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'

const allowedOriginPatterns = parseAllowedOrigins()
const hasWhitelist = allowedOriginPatterns.length > 0

function parseAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_REDIRECT_URLS
  if (!raw) {
    return []
  }
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function isLocalhostHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.endsWith('.local')
}

function normalizeOrigin(origin: string) {
  try {
    const url = new URL(origin)
    return url.origin
  } catch {
    return null
  }
}

function matchPattern(pattern: string, origin: string) {
  if (!pattern) {
    return false
  }

  if (pattern.includes('*')) {
    const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\\\*/g, '.*')
    const regex = new RegExp(`^${escaped}$`, 'i')
    return regex.test(origin)
  }

  try {
    const url = new URL(pattern)
    return url.origin.toLowerCase() === origin.toLowerCase()
  } catch {
    return pattern.toLowerCase() === origin.toLowerCase()
  }
}

export function isOriginAllowed(origin?: string | null) {
  if (!origin) {
    return true
  }

  const normalizedOrigin = normalizeOrigin(origin)
  if (!normalizedOrigin) {
    return false
  }

  if (!hasWhitelist) {
    if (process.env.NODE_ENV !== 'production') {
      try {
        const { hostname } = new URL(normalizedOrigin)
        return isLocalhostHostname(hostname.toLowerCase())
      } catch {
        return false
      }
    }
    return false
  }

  return allowedOriginPatterns.some((pattern) => matchPattern(pattern, normalizedOrigin))
}

export function assertOriginAllowed(origin?: string | null, message = 'origin is not allowed') {
  if (origin && !isOriginAllowed(origin)) {
    throw textUnauthorized(message)
  }
}

interface BuildCorsHeadersOptions {
  methods?: CorsMethod[]
  allowCredentials?: boolean
  allowHeaders?: string
  maxAgeSeconds?: number
}

export function buildCorsHeaders(origin?: string | null, options?: BuildCorsHeadersOptions) {
  const headers = new Headers()
  headers.set('Access-Control-Allow-Methods', (options?.methods ?? ['GET', 'OPTIONS']).join(', '))
  headers.set('Access-Control-Allow-Headers', options?.allowHeaders ?? 'Content-Type, Authorization')
  headers.set('Access-Control-Max-Age', (options?.maxAgeSeconds ?? 86400).toString())

  if (origin && isOriginAllowed(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    if (options?.allowCredentials) {
      headers.set('Access-Control-Allow-Credentials', 'true')
    }

    headers.append('Vary', 'Origin')
  }

  return headers
}
