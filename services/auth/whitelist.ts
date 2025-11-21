import type { NextRequest } from 'next/server'

type CorsMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'

/**
 * Extract current server origin from NextRequest
 * Uses headers (host + x-forwarded-proto) which works in all environments including Vercel
 */
export function getCurrentOrigin(req: NextRequest): string | null {
  const host = req.headers.get('host')
  if (!host) {
    return null
  }

  // Check X-Forwarded-Proto header (set by reverse proxies/load balancers like Vercel)
  let protocol = req.headers.get('x-forwarded-proto')
  if (!protocol) {
    // Fallback: check request URL protocol or default based on environment
    try {
      const url = new URL(req.url)
      protocol = url.protocol.replace(':', '')
    } catch {
      // Default to https in production, http in development
      protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    }
  }

  return `${protocol}://${host}`
}

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

/**
 * Check if an IP address is a local/private IP address
 * @param ip - IP address to check
 * @returns true if local/private IP, false otherwise
 */
function isLocalIp(ip: string): boolean {
  // IPv4 localhost
  if (ip === '127.0.0.1' || ip === '::1') {
    return true
  }

  // IPv4 private ranges
  // 10.0.0.0/8
  if (/^10\./.test(ip)) {
    return true
  }
  // 172.16.0.0/12
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) {
    return true
  }
  // 192.168.0.0/16
  if (/^192\.168\./.test(ip)) {
    return true
  }
  // 169.254.0.0/16 (link-local)
  if (/^169\.254\./.test(ip)) {
    return true
  }

  // IPv6 local/private ranges
  // fc00::/7 (unique local address)
  if (/^fc[0-9a-f]{2}:/.test(ip.toLowerCase())) {
    return true
  }
  // fe80::/10 (link-local)
  if (/^fe[89ab][0-9a-f]:/.test(ip.toLowerCase())) {
    return true
  }

  return false
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

export function isOriginAllowed(origin?: string | null, currentOrigin?: string | null) {
  if (!origin) {
    return true
  }

  const normalizedOrigin = normalizeOrigin(origin)
  if (!normalizedOrigin) {
    return false
  }

  // Allow same-origin requests (even without whitelist) - works in both dev and production
  if (currentOrigin) {
    try {
      const currentOriginNormalized = normalizeOrigin(currentOrigin)
      if (currentOriginNormalized && normalizedOrigin.toLowerCase() === currentOriginNormalized.toLowerCase()) {
        return true
      }
    } catch {
      // If parsing fails, continue to other checks
    }
  }

  // Allow localhost in all environments (for local development)
  try {
    const { hostname } = new URL(normalizedOrigin)
    if (isLocalhostHostname(hostname.toLowerCase())) {
      return true
    }
  } catch {
    // If parsing fails, continue to other checks
  }

  // If no whitelist configured, only allow same-origin and localhost (already checked above)
  if (!hasWhitelist) {
    return false
  }

  return allowedOriginPatterns.some((pattern) => matchPattern(pattern, normalizedOrigin))
}

/**
 * Check if origin is allowed
 * @param origin - Origin to check
 * @param currentOrigin - Optional current server origin for same-origin comparison
 * @returns true if origin is allowed, false otherwise
 */
export function assertOriginAllowed(origin?: string | null, currentOrigin?: string | null): boolean {
  if (!origin) {
    return true
  }
  return isOriginAllowed(origin, currentOrigin)
}

interface BuildCorsHeadersOptions {
  methods?: CorsMethod[]
  allowCredentials?: boolean
  allowHeaders?: string
  maxAgeSeconds?: number
}

export function buildCorsHeaders(origin?: string | null, options?: BuildCorsHeadersOptions & { currentOrigin?: string | null }) {
  const headers = new Headers()
  headers.set('Access-Control-Allow-Methods', (options?.methods ?? ['GET', 'OPTIONS']).join(', '))
  headers.set('Access-Control-Allow-Headers', options?.allowHeaders ?? 'Content-Type, Authorization')
  headers.set('Access-Control-Max-Age', (options?.maxAgeSeconds ?? 86400).toString())

  if (origin && isOriginAllowed(origin, options?.currentOrigin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    if (options?.allowCredentials) {
      headers.set('Access-Control-Allow-Credentials', 'true')
    }

    headers.append('Vary', 'Origin')
  }

  return headers
}

/**
 * Check if the request is using HTTPS
 * @param req - NextRequest object
 * @returns true if HTTPS, false otherwise
 */
export function isHttps(req: NextRequest): boolean {
  // Check X-Forwarded-Proto header (set by reverse proxies/load balancers)
  const forwardedProto = req.headers.get('x-forwarded-proto')
  if (forwardedProto) {
    return forwardedProto.toLowerCase() === 'https'
  }

  // Check the request URL protocol
  try {
    const url = new URL(req.url)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Check if HTTPS is required for the given origin
 * - In development: Always allow HTTP (no HTTPS required)
 * - In production: Require HTTPS, except for localhost and local IP addresses
 */
export function isHttpsRequired(origin?: string | null): boolean {
  // In development, always allow HTTP
  if (process.env.NODE_ENV !== 'production') {
    return false
  }

  // In production, require HTTPS unless origin is localhost or local IP
  if (!origin) {
    return true // Require HTTPS if no origin provided
  }

  try {
    const url = new URL(origin)
    const hostname = url.hostname.toLowerCase()

    // Allow HTTP for localhost hostnames
    if (isLocalhostHostname(hostname)) {
      return false
    }

    // Allow HTTP for local/private IP addresses
    if (isLocalIp(hostname)) {
      return false
    }

    // For all other origins in production, require HTTPS
    return true
  } catch {
    // Invalid origin format, require HTTPS for safety
    return true
  }
}

/**
 * Check if the request is using HTTPS (if required)
 * @param req - NextRequest object
 * @param origin - Optional origin header to check
 * @returns true if HTTPS is valid (either not required or using HTTPS), false otherwise
 */
export function assertHttpsRequired(req: NextRequest, origin?: string | null): boolean {
  if (!isHttpsRequired(origin)) {
    // HTTPS not required (e.g., localhost in development)
    return true
  }

  return isHttps(req)
}
