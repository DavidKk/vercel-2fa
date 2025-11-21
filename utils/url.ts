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
 * @param redirectUrl - The URL to validate
 * @param currentHost - Optional current host (e.g., 'localhost:3000') to allow same-host /oauth/test
 * @returns true if the URL is allowed, false otherwise
 */
export function isAllowedRedirectUrl(redirectUrl: string, currentHost?: string): boolean {
  // Allow relative paths (same origin redirects), but only for specific safe paths
  if (redirectUrl.startsWith('/')) {
    // Only allow known safe paths to prevent open redirect vulnerabilities
    const safePaths = ['/oauth/test', '/oauth', '/login']
    return safePaths.some((path) => redirectUrl.startsWith(path))
  }

  let targetUrl: URL
  try {
    targetUrl = new URL(redirectUrl)
  } catch {
    return false
  }

  // Always allow /oauth/test on the same host
  if (currentHost && targetUrl.pathname === '/oauth/test') {
    const targetHost = targetUrl.host.toLowerCase()
    const currentHostLower = currentHost.toLowerCase()
    // Match exact host or handle port variations
    if (targetHost === currentHostLower) {
      return true
    }
    // Handle cases where one has port and the other doesn't (e.g., localhost vs localhost:3000)
    const targetHostname = targetUrl.hostname.toLowerCase()
    const currentHostname = currentHostLower.split(':')[0]
    if (targetHostname === currentHostname || targetHostname === 'localhost' || currentHostname === 'localhost') {
      return true
    }
  }

  const hostname = targetUrl.hostname.toLowerCase()
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.endsWith('.local')

  // During local development we allow localhost style URLs even without whitelist
  if (isLocalHost && process.env.NODE_ENV !== 'production') {
    return true
  }

  // Get allowed redirect URLs from environment
  const allowedUrls = process.env.ALLOWED_REDIRECT_URLS

  // If no whitelist configured, only allow relative paths
  if (!allowedUrls) {
    return false
  }

  try {
    const allowedList = allowedUrls.split(',').map((url) => url.trim())

    // Check if the redirect URL matches any allowed URL or pattern
    for (const allowed of allowedList) {
      try {
        // Support wildcard patterns like https://*.example.com
        if (allowed.includes('*')) {
          const allowedPattern = allowed.replace(/\./g, '\\.').replace(/\*/g, '.*')
          const regex = new RegExp(`^${allowedPattern}$`)
          if (regex.test(targetUrl.origin) || regex.test(redirectUrl)) {
            return true
          }
        } else {
          // Exact origin match
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
