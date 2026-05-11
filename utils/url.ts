/** validate URL */
export function isValidUrl(url: string) {
  if (!url.includes('.')) {
    return false
  }

  try {
    new URL(url.startsWith('http') ? url : `http://${url}`)
    return true
  } catch {
    return false
  }
}

export function tryGetDomain(url: string) {
  if (!url.includes('.')) {
    return ''
  }

  try {
    const uri = new URL(url.startsWith('http') ? url : `http://${url}`)
    return uri.hostname
  } catch {
    return ''
  }
}

export function matchUrl(pattern: string, url: string) {
  const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')
  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(url)
}

/**
 * Build a base URL from the incoming Host header for same-origin checks (supports bracketed IPv6).
 */
function baseUrlFromHostHeader(host: string): URL | null {
  let scheme: 'http' | 'https' = 'http'
  if (process.env.NODE_ENV === 'production') {
    scheme = 'https'
    try {
      const { hostname } = new URL(`http://${host}`)
      const h = hostname.toLowerCase()
      if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h.endsWith('.local')) {
        scheme = 'http'
      }
    } catch {
      scheme = 'https'
    }
  }
  try {
    return new URL(`${scheme}://${host}`)
  } catch {
    return null
  }
}

/**
 * Validate if a redirect URL is allowed based on environment configuration.
 * Allows absolute URLs (origin checked against whitelist / same host) and same-origin root-relative paths.
 * @param redirectUrl - Absolute URL or same-app path starting with a single `/` (not `//`)
 * @param currentHost - Optional Host header value (e.g. `app.example.com` or `localhost:3000`); required for root-relative URLs
 * @returns True if the redirect URL is allowed, false otherwise
 */
export function isAllowedRedirectUrl(redirectUrl: string, currentHost?: string): boolean {
  // Handle empty or invalid URLs
  if (!redirectUrl || typeof redirectUrl !== 'string') {
    return false
  }

  // Same-app relative paths (e.g. /login/blank). Reject protocol-relative "//host" and backslash tricks.
  if (redirectUrl.startsWith('/')) {
    if (redirectUrl.startsWith('//') || redirectUrl.includes('\\')) {
      return false
    }
    if (!currentHost) {
      return false
    }
    const base = baseUrlFromHostHeader(currentHost)
    if (!base) {
      return false
    }
    try {
      const resolved = new URL(redirectUrl, base)
      return resolved.hostname === base.hostname
    } catch {
      return false
    }
  }

  let targetUrl: URL
  try {
    targetUrl = new URL(redirectUrl)
  } catch {
    return false
  }

  const hostname = targetUrl.hostname.toLowerCase()
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.endsWith('.local')

  // During local development we allow localhost style URLs even without whitelist
  if (isLocalHost && process.env.NODE_ENV !== 'production') {
    return true
  }

  // Allow same-host absolute URLs (default behavior - no whitelist needed)
  if (currentHost) {
    const currentHostname = currentHost.toLowerCase().split(':')[0] // Remove port if present
    if (hostname === currentHostname) {
      return true
    }
  }

  // Get allowed redirect URLs from environment (for cross-origin redirects)
  const allowedUrls = process.env.ALLOWED_REDIRECT_URLS

  // If no whitelist configured, only allow same-host URLs (already checked above)
  if (!allowedUrls) {
    return false
  }

  try {
    const allowedList = allowedUrls.split(',').map((url) => url.trim())

    // Check if the redirect URL's origin matches any allowed origin or pattern
    // OAuth 2.0 best practice: validate by origin (protocol + domain + port), not by full URL path
    for (const allowed of allowedList) {
      try {
        // Support wildcard patterns like https://*.example.com
        if (allowed.includes('*')) {
          const allowedPattern = allowed.replace(/\./g, '\\.').replace(/\*/g, '.*')
          const regex = new RegExp(`^${allowedPattern}$`)
          // Match origin only (protocol + domain + port), not full URL
          if (regex.test(targetUrl.origin)) {
            return true
          }
        } else {
          // Exact origin match (protocol + domain + port)
          const allowedUrl = new URL(allowed)
          if (targetUrl.origin === allowedUrl.origin) {
            return true
          }
        }
      } catch {
        // Skip invalid patterns
        continue
      }
    }

    return false
  } catch {
    return false
  }
}
