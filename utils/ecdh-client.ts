/**
 * ECDH (Elliptic Curve Diffie-Hellman) utility functions for client-side
 * Used for secure key exchange and encryption/decryption in browser
 */

/**
 * Generate ECDH key pair in browser
 * @returns Promise resolving to CryptoKeyPair
 */
export async function generateECDHKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256', // prime256v1
    },
    true, // extractable, needed to export public key
    ['deriveKey', 'deriveBits']
  )
}

/**
 * Export public key to base64 SPKI format
 * @param keyPair - ECDH key pair
 * @returns Base64 encoded public key (SPKI format)
 */
export async function exportPublicKey(keyPair: CryptoKeyPair): Promise<string> {
  const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey)
  return arrayBufferToBase64(publicKeyBuffer)
}

/**
 * Export private key to base64 PKCS#8 format
 * @param keyPair - ECDH key pair
 * @returns Base64 encoded private key (PKCS#8 format)
 */
export async function exportPrivateKey(keyPair: CryptoKeyPair): Promise<string> {
  const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
  return arrayBufferToBase64(privateKeyBuffer)
}

/**
 * Import private key from base64 PKCS#8 format
 * @param privateKeyBase64 - Base64 encoded private key (PKCS#8 format)
 * @returns CryptoKey private key
 */
export async function importPrivateKey(privateKeyBase64: string): Promise<CryptoKey> {
  if (!privateKeyBase64) {
    throw new Error('Private key base64 string is empty')
  }

  let privateKeyBuffer: ArrayBuffer
  try {
    privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64)
  } catch (error) {
    throw new Error(`Failed to decode private key: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  try {
    return await window.crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      false, // not extractable after import
      ['deriveKey', 'deriveBits']
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const bufferLength = privateKeyBuffer.byteLength
    const base64Preview = privateKeyBase64.substring(0, 50) + (privateKeyBase64.length > 50 ? '...' : '')
    throw new Error(
      `Failed to import private key: ${errorMessage}. ` +
        `Base64 input length: ${privateKeyBase64.length}, ` +
        `Decoded buffer length: ${bufferLength} bytes, ` +
        `Base64 preview: "${base64Preview}"`
    )
  }
}

/**
 * Import public key from base64 SPKI format
 * @param publicKeyBase64 - Base64 encoded public key (SPKI format)
 * @returns CryptoKey public key
 */
export async function importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
  if (!publicKeyBase64) {
    throw new Error('Public key base64 string is empty')
  }

  let publicKeyBuffer: ArrayBuffer
  try {
    publicKeyBuffer = base64ToArrayBuffer(publicKeyBase64)
  } catch (error) {
    throw new Error(`Failed to decode public key: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  try {
    return await window.crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      false, // not extractable
      []
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const bufferLength = publicKeyBuffer.byteLength
    const base64Preview = publicKeyBase64.substring(0, 50) + (publicKeyBase64.length > 50 ? '...' : '')
    throw new Error(
      `Failed to import public key: ${errorMessage}. ` +
        `Base64 input length: ${publicKeyBase64.length}, ` +
        `Decoded buffer length: ${bufferLength} bytes, ` +
        `Base64 preview: "${base64Preview}"`
    )
  }
}

/**
 * Derive shared key using ECDH
 * @param privateKey - Client's private key
 * @param serverPublicKey - Server's public key (SPKI format, base64 encoded)
 * @returns Shared key as CryptoKey for AES-GCM
 */
export async function deriveSharedKey(privateKey: CryptoKey, serverPublicKey: string): Promise<CryptoKey> {
  const importedServerPublicKey = await importPublicKey(serverPublicKey)

  return await window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: importedServerPublicKey,
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false, // not extractable
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt data using AES-256-GCM with shared key
 * @param data - Data to encrypt (string)
 * @param sharedKey - Shared key from ECDH
 * @returns Encrypted data as base64 string (format: iv:tag:ciphertext)
 */
export async function encryptWithSharedKey(data: string, sharedKey: CryptoKey): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)) // 96-bit IV for GCM
  const encodedData = new TextEncoder().encode(data)

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128, // 128-bit auth tag
    },
    sharedKey,
    encodedData
  )

  // Combine iv (12 bytes) + encrypted (includes 16-byte auth tag at the end)
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)

  return arrayBufferToBase64(combined.buffer)
}

/**
 * Decrypt data using AES-256-GCM with shared key
 * @param encryptedData - Encrypted data (base64 string, format: iv:tag:ciphertext)
 * @param sharedKey - Shared key from ECDH
 * @returns Decrypted data as string
 */
export async function decryptWithSharedKey(encryptedData: string, sharedKey: CryptoKey): Promise<string> {
  if (!encryptedData) {
    throw new Error('Encrypted data is empty')
  }

  let dataBuffer: ArrayBuffer
  try {
    dataBuffer = base64ToArrayBuffer(encryptedData)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    // eslint-disable-next-line no-console
    console.error('[ECDH] Failed to decode encrypted data', { message, stack })
    throw new Error(`Failed to decode encrypted data: ${message}`)
  }

  const dataArray = new Uint8Array(dataBuffer)

  // Extract components: iv (12 bytes) + authTag (16 bytes) + ciphertext (N bytes)
  // Server format: iv + authTag + encrypted (Node.js separates authTag from encrypted)
  // Web Crypto API expects: iv + (ciphertext + authTag) where authTag is at the end
  const iv = dataArray.slice(0, 12)
  const authTag = dataArray.slice(12, 28) // 16-byte auth tag
  const ciphertext = dataArray.slice(28) // Actual encrypted data (without auth tag)

  // Web Crypto API expects auth tag at the end of ciphertext
  const ciphertextWithTag = new Uint8Array(ciphertext.length + authTag.length)
  ciphertextWithTag.set(ciphertext, 0)
  ciphertextWithTag.set(authTag, ciphertext.length)

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128, // 128-bit auth tag
    },
    sharedKey,
    ciphertextWithTag
  )

  return new TextDecoder().decode(decrypted)
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert base64 string to ArrayBuffer
 * Handles URL-safe base64 and cleans invalid characters
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (!base64) {
    throw new Error('Base64 string is empty')
  }

  const originalInput = base64

  // Clean the base64 string: remove whitespace, newlines, and other invalid characters
  let cleaned = base64.trim().replace(/\s+/g, '')

  // Handle URL-safe base64 (replace - with + and _ with /)
  cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/')

  // Add padding if needed
  while (cleaned.length % 4 !== 0) {
    cleaned += '='
  }

  try {
    const binary = atob(cleaned)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const debugInfo = {
      originalLength: originalInput.length,
      cleanedLength: cleaned.length,
      originalPreview: originalInput.substring(0, 50) + (originalInput.length > 50 ? '...' : ''),
      cleanedPreview: cleaned.substring(0, 50) + (cleaned.length > 50 ? '...' : ''),
    }
    throw new Error(
      `Invalid base64 string: ${errorMessage}. ` +
        `Original input (length: ${debugInfo.originalLength}): "${debugInfo.originalPreview}". ` +
        `Cleaned input (length: ${debugInfo.cleanedLength}): "${debugInfo.cleanedPreview}"`
    )
  }
}
