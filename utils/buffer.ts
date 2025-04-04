/**
 * Converts an ArrayBuffer to a string
 * @param data ArrayBuffer to convert
 */
export function convertArrayBufferToString(data: ArrayBuffer) {
  if (typeof window !== 'undefined') {
    return new TextDecoder().decode(data)
  }

  return Buffer.from(data).toString()
}

/**
 * Converts an ArrayBuffer to a JSON object
 * @param data ArrayBuffer to convert
 * @return JSON object
 */
export function convertArrayBufferToJson<T>(data: ArrayBuffer): T {
  const text = convertArrayBufferToString(data)
  return JSON.parse(text)
}

/**
 * Converts a string to an Base64Url encoded string
 * @param data string to convert
 * @return Base64Url encoded string
 */
export function arrayBufferToBase64Url(buffer: ArrayBuffer) {
  if (typeof window !== 'undefined') {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  return Buffer.from(buffer).toString('base64url')
}

/**
 * Converts a Base64Url encoded string to an ArrayBuffer
 * @param base64 Base64Url encoded string to convert
 * @return ArrayBuffer
 */
export function base64UrlToArrayBuffer(base64: string) {
  if (typeof window !== 'undefined') {
    const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    const buffer = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i)
    }

    return buffer.buffer
  }

  return Buffer.from(base64, 'base64url')
}
