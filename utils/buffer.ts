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
