/**
 * OAuth Client: Storage Management
 * Handles OAuth session data and client key pairs
 */

import { STORAGE_KEYS } from '../constants'

export { STORAGE_KEYS }

export interface OAuthSession {
  state: string
  clientPublicKey: string
  clientPrivateKey: string
  /** Server public key (required for redirect mode, stored together with client key pair) */
  serverPublicKey: string
}

export function storeOAuthSession(session: OAuthSession): void {
  if (typeof window === 'undefined') {
    return
  }
  sessionStorage.setItem(STORAGE_KEYS.STATE, session.state)
  sessionStorage.setItem(STORAGE_KEYS.CLIENT_PUBLIC_KEY, session.clientPublicKey)
  sessionStorage.setItem(STORAGE_KEYS.CLIENT_PRIVATE_KEY, session.clientPrivateKey)
  sessionStorage.setItem(STORAGE_KEYS.SERVER_PUBLIC_KEY, session.serverPublicKey)
}

export function readOAuthSession(): OAuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }
  const state = sessionStorage.getItem(STORAGE_KEYS.STATE)
  const clientPublicKey = sessionStorage.getItem(STORAGE_KEYS.CLIENT_PUBLIC_KEY)
  const clientPrivateKey = sessionStorage.getItem(STORAGE_KEYS.CLIENT_PRIVATE_KEY)
  const serverPublicKey = sessionStorage.getItem(STORAGE_KEYS.SERVER_PUBLIC_KEY)

  // All fields including serverPublicKey are required for a valid session
  if (!state || !clientPublicKey || !clientPrivateKey || !serverPublicKey) {
    return null
  }

  return {
    state,
    clientPublicKey,
    clientPrivateKey,
    serverPublicKey,
  }
}

export function clearOAuthSession(): void {
  if (typeof window === 'undefined') {
    return
  }
  sessionStorage.removeItem(STORAGE_KEYS.STATE)
  sessionStorage.removeItem(STORAGE_KEYS.CLIENT_PUBLIC_KEY)
  sessionStorage.removeItem(STORAGE_KEYS.CLIENT_PRIVATE_KEY)
  sessionStorage.removeItem(STORAGE_KEYS.SERVER_PUBLIC_KEY)
}

export function getStoredState(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return sessionStorage.getItem(STORAGE_KEYS.STATE)
}

export function getStoredPrivateKey(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return sessionStorage.getItem(STORAGE_KEYS.CLIENT_PRIVATE_KEY)
}

export function getStoredPublicKey(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return sessionStorage.getItem(STORAGE_KEYS.CLIENT_PUBLIC_KEY)
}

export interface ClientKeyPair {
  publicKey: string | null
  privateKey: string | null
}

export function getStoredKeyPair(): ClientKeyPair {
  return {
    publicKey: getStoredPublicKey(),
    privateKey: getStoredPrivateKey(),
  }
}

export function setStoredKeyPair(publicKey: string, privateKey: string): void {
  if (typeof window === 'undefined') {
    return
  }
  sessionStorage.setItem(STORAGE_KEYS.CLIENT_PUBLIC_KEY, publicKey)
  sessionStorage.setItem(STORAGE_KEYS.CLIENT_PRIVATE_KEY, privateKey)
}

export function clearStoredKeyPair(): void {
  if (typeof window === 'undefined') {
    return
  }
  sessionStorage.removeItem(STORAGE_KEYS.CLIENT_PUBLIC_KEY)
  sessionStorage.removeItem(STORAGE_KEYS.CLIENT_PRIVATE_KEY)
}

/**
 * Get stored server public key from sessionStorage
 * Used in callback flow to avoid re-fetching from API
 * This is a convenience function that reads from the same storage as OAuthSession
 */
export function getStoredServerPublicKey(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return sessionStorage.getItem(STORAGE_KEYS.SERVER_PUBLIC_KEY)
}
