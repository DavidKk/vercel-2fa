'use server'

import { createPrivateKey } from 'crypto'
import { headers } from 'next/headers'

import { generateECDHKeyPair as generateServerECDHKeyPair } from '@/app/actions/ecdh'
import { fetchServerPublicKey } from '@/services/oauth/client/utils/public-key'

/**
 * Fetch server public key for OAuth ECDH key exchange
 * This Server Action is called during SSR for 'login' flow to pre-fetch the public key
 * If this fails, the client will fall back to fetching on its own
 * @returns Server public key in base64 format, or null if fetch fails
 */
export async function getServerPublicKey(): Promise<string | null> {
  try {
    // Construct full URL for server-side fetch using request headers
    const headersList = await headers()
    const protocol = headersList.get('x-forwarded-proto') ?? 'https'
    const host = headersList.get('host')
    if (!host) {
      return null
    }
    const baseUrl = `${protocol}://${host}`
    const apiUrl = `${baseUrl}/api/oauth/public-key`
    return await fetchServerPublicKey(apiUrl)
  } catch (error) {
    // Return null on error, client will handle retry
    return null
  }
}

/**
 * Generate temporary ECDH key pair for client-side use
 * This Server Action is called during SSR for 'login' flow to pre-generate the key pair
 * If this fails, the client will fall back to generating on its own
 * @returns Object containing publicKey and privateKey in base64 format, or null if generation fails
 */
export async function generateTemporaryKeyPair(): Promise<{ publicKey: string; privateKey: string } | null> {
  try {
    const keyPair = await generateServerECDHKeyPair()
    // Convert private key from PEM format to base64 PKCS#8 format for client-side use
    // Client-side Web Crypto API expects keys in base64 format, not PEM
    const privateKeyObj = createPrivateKey(keyPair.privateKey)
    const privateKeyDer = privateKeyObj.export({ format: 'der', type: 'pkcs8' })
    const privateKeyBase64 = privateKeyDer.toString('base64').replace(/\s+/g, '')

    return {
      publicKey: keyPair.publicKeyBase64,
      privateKey: privateKeyBase64,
    }
  } catch (error) {
    // Return null on error, client will handle generation
    return null
  }
}
