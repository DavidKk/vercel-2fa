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

export function stringToCredentials(jsonString: string): StoreCredentials | null {
  try {
    const parsed = JSON.parse(jsonString)
    if (!parsed.credentialID || !parsed.publicKey || !parsed.rpId) {
      return null
    }

    const publicKey = decodePublicKey(parsed.publicKey)
    return { ...parsed, publicKey }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('stringToCredentials error: ', err)
    return null
  }
}
