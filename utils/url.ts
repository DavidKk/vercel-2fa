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
 * Validate if a redirect URL is allowed based on environment configuration
 * Follows OAuth 2.0 best practices: validates by origin (protocol + domain + port), not by path
 * @param redirectUrl - The URL to validate (must be absolute URL with host)
 * @param currentHost - Optional current host (e.g., 'vercel-2fa.vercel.app') to allow same-host URLs
 * @returns true if the URL is allowed, false otherwise
 */
export function isAllowedRedirectUrl(redirectUrl: string, currentHost?: string): boolean {
  // Handle empty or invalid URLs
  if (!redirectUrl || typeof redirectUrl !== 'string') {
    return false
  }

  // OAuth redirect URLs must be absolute URLs (with host), relative paths are not allowed
  if (redirectUrl.startsWith('/')) {
    return false
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
