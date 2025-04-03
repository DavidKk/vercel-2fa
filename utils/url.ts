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
