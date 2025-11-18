'use server'

import { createPublicKey, generateKeyPairSync } from 'crypto'

/**
 * Generate ECDH key pair for server-side encryption
 * @returns Object containing private key (PEM), public key (PEM), and public key (base64 SPKI)
 */
export async function generateECDHKeyPair() {
  try {
    const { publicKey, privateKey } = generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    })

    // Convert public key to base64 SPKI format for client-side use
    const publicKeyObj = createPublicKey(publicKey)
    const publicKeyDer = publicKeyObj.export({ format: 'der', type: 'spki' })
    // Ensure base64 output has no line breaks and is properly formatted
    const publicKeyBase64 = publicKeyDer.toString('base64').replace(/\s+/g, '')

    // Validate output
    if (!publicKeyBase64 || publicKeyBase64.length < 50) {
      throw new Error('Generated public key base64 is too short or empty')
    }

    return {
      privateKey, // PEM format
      publicKey, // PEM format
      publicKeyBase64, // Base64 SPKI format for client-side
    }
  } catch (error) {
    throw new Error(`Failed to generate ECDH key pair: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
