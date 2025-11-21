'use client'

import { useCallback, useEffect, useState } from 'react'

import { clearStoredKeyPair, getStoredKeyPair, setStoredKeyPair } from '@/services/oauth/client/utils'
import { exportPrivateKey, exportPublicKey, generateECDHKeyPair } from '@/utils/ecdh-client'

// Global lock to prevent concurrent key pair generation
let isGenerating = false
const generationListeners = new Set<() => void>()

// Notify all hook instances when keys are updated
function notifyKeyPairUpdate() {
  generationListeners.forEach((listener) => listener())
}

export interface UseECDHKeyPairOptions {
  /**
   * Automatically sync keys from storage on mount
   * @default true
   */
  autoLoad?: boolean
  /**
   * Automatically generate a new key pair if none exists
   * @default false
   */
  autoGenerate?: boolean
}

export interface UseECDHKeyPairResult {
  publicKey: string | null
  privateKey: string | null
  loading: boolean
  error: string | null
  hasKeyPair: boolean
  refresh: () => void
  clear: () => void
  generate: () => Promise<{ publicKey: string; privateKey: string }>
  ensureKeyPair: () => Promise<string>
}

export function useECDHKeyPair(options: UseECDHKeyPairOptions = {}): UseECDHKeyPairResult {
  const { autoLoad = true, autoGenerate = false } = options
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [privateKey, setPrivateKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const syncFromStorage = useCallback(() => {
    const { publicKey, privateKey } = getStoredKeyPair()
    setPublicKey(publicKey)
    setPrivateKey(privateKey)
  }, [])

  const generateKeyPair = useCallback(async () => {
    // Check if already generating (prevent concurrent generation)
    if (isGenerating) {
      // Wait for current generation to complete, then sync from storage
      return new Promise<{ publicKey: string; privateKey: string }>((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!isGenerating) {
            clearInterval(checkInterval)
            const stored = getStoredKeyPair()
            if (stored.publicKey && stored.privateKey) {
              setPublicKey(stored.publicKey)
              setPrivateKey(stored.privateKey)
              resolve({ publicKey: stored.publicKey, privateKey: stored.privateKey })
            } else {
              reject(new Error('Key pair generation failed'))
            }
          }
        }, 50)
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval)
          reject(new Error('Key pair generation timeout'))
        }, 5000)
      })
    }

    isGenerating = true
    setLoading(true)
    setError(null)
    try {
      const keyPair = await generateECDHKeyPair()
      const publicKeyBase64 = await exportPublicKey(keyPair)
      const privateKeyBase64 = await exportPrivateKey(keyPair)
      setStoredKeyPair(publicKeyBase64, privateKeyBase64)
      setPublicKey(publicKeyBase64)
      setPrivateKey(privateKeyBase64)

      // Notify all other hook instances to sync
      notifyKeyPairUpdate()

      return { publicKey: publicKeyBase64, privateKey: privateKeyBase64 }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate ECDH key pair'
      setError(message)
      throw err
    } finally {
      isGenerating = false
      setLoading(false)
    }
  }, [])

  const ensureKeyPair = useCallback(async () => {
    if (publicKey) {
      return publicKey
    }
    const result = await generateKeyPair()
    return result.publicKey
  }, [publicKey, generateKeyPair])

  const clear = useCallback(() => {
    clearStoredKeyPair()
    setPublicKey(null)
    setPrivateKey(null)
  }, [])

  // Register listener for key pair updates from other instances
  useEffect(() => {
    const listener = () => {
      syncFromStorage()
    }
    generationListeners.add(listener)
    return () => {
      generationListeners.delete(listener)
    }
  }, [syncFromStorage])

  useEffect(() => {
    if (!autoLoad) {
      return
    }
    syncFromStorage()
  }, [autoLoad, syncFromStorage])

  useEffect(() => {
    if (!autoGenerate) {
      return
    }
    if (publicKey && privateKey) {
      return
    }
    // Check storage first before generating
    const stored = getStoredKeyPair()
    if (stored.publicKey && stored.privateKey) {
      setPublicKey(stored.publicKey)
      setPrivateKey(stored.privateKey)
      return
    }

    generateKeyPair()
  }, [autoGenerate, publicKey, privateKey, generateKeyPair])

  return {
    publicKey,
    privateKey,
    loading,
    error,
    hasKeyPair: Boolean(publicKey && privateKey),
    refresh: syncFromStorage,
    clear,
    generate: generateKeyPair,
    ensureKeyPair,
  }
}
