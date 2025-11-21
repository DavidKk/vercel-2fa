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
}

export function storeOAuthSession(session: OAuthSession): void {
  if (typeof window === 'undefined') {
    return
  }
  sessionStorage.setItem(STORAGE_KEYS.STATE, session.state)
  sessionStorage.setItem(STORAGE_KEYS.CLIENT_PUBLIC_KEY, session.clientPublicKey)
  sessionStorage.setItem(STORAGE_KEYS.CLIENT_PRIVATE_KEY, session.clientPrivateKey)
}

export function readOAuthSession(): OAuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }
  const state = sessionStorage.getItem(STORAGE_KEYS.STATE)
  const clientPublicKey = sessionStorage.getItem(STORAGE_KEYS.CLIENT_PUBLIC_KEY)
  const clientPrivateKey = sessionStorage.getItem(STORAGE_KEYS.CLIENT_PRIVATE_KEY)

  if (!state || !clientPublicKey || !clientPrivateKey) {
    return null
  }

  return {
    state,
    clientPublicKey,
    clientPrivateKey,
  }
}

export function clearOAuthSession(): void {
  if (typeof window === 'undefined') {
    return
  }
  sessionStorage.removeItem(STORAGE_KEYS.STATE)
  sessionStorage.removeItem(STORAGE_KEYS.CLIENT_PUBLIC_KEY)
  sessionStorage.removeItem(STORAGE_KEYS.CLIENT_PRIVATE_KEY)
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
