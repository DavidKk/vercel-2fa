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
 * @returns true if the URL is allowed, false otherwise
 */
export function isAllowedRedirectUrl(redirectUrl: string): boolean {
  // Allow relative paths (same origin redirects)
  if (redirectUrl.startsWith('/')) {
    return true
  }

  // Get allowed redirect URLs from environment
  const allowedUrls = process.env.ALLOWED_REDIRECT_URLS

  // If no whitelist configured, only allow relative paths
  if (!allowedUrls) {
    return false
  }

  try {
    const targetUrl = new URL(redirectUrl)
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
    // Invalid URL format
    return false
  }
}
