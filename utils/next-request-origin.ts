import type { NextRequest } from 'next/server'

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '')
}

/**
 * Public origin (scheme + host, no path) for the incoming request.
 * Prefer {@link process.env.SIGNET_PUBLIC_ORIGIN} when set (canonical URL for MCP / docs).
 * Otherwise prefer `x-forwarded-*` when behind a reverse proxy (e.g. Vercel).
 */
export function getPublicOriginFromNextRequest(req: NextRequest): string {
  const fromEnv = process.env.SIGNET_PUBLIC_ORIGIN?.trim()
  if (fromEnv) {
    return trimTrailingSlashes(fromEnv)
  }

  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = forwardedHost || req.headers.get('host')?.trim()
  if (!host) {
    return req.nextUrl.origin
  }

  const rawProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const proto = rawProto === 'http' || rawProto === 'https' ? rawProto : req.nextUrl.protocol === 'https:' ? 'https' : 'http'

  return `${proto}://${host}`
}
