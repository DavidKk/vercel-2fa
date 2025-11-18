/**
 * Server-side ECDH key pair management
 * Loads server's ECDH key pair from environment variables
 */

import type { KeyObject } from 'crypto'
import { createPrivateKey, createPublicKey } from 'crypto'

/**
 * Load server's ECDH private key from environment variable
 * @returns Server's private key as KeyObject
 */
export function loadServerPrivateKey(): KeyObject {
  const privateKeyPem = process.env.ECDH_SERVER_PRIVATE_KEY
  if (!privateKeyPem) {
    throw new Error('ECDH_SERVER_PRIVATE_KEY environment variable is not set')
  }

  try {
    // 规范化密钥：处理 Vercel 环境变量中可能的字面字符串 \n 转换为实际换行符
    // 同时确保 PEM 格式正确
    let normalizedKey = privateKeyPem

    // 如果包含字面字符串 \n，替换为实际换行符
    if (normalizedKey.includes('\\n')) {
      normalizedKey = normalizedKey.replace(/\\n/g, '\n')
    }

    // 验证 PEM 格式
    if (!normalizedKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid PEM format: missing BEGIN header')
    }
    if (!normalizedKey.includes('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid PEM format: missing END footer')
    }

    return createPrivateKey(normalizedKey)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to load server private key: ${errorMessage}`)
  }
}

/**
 * Get server's ECDH public key (base64 SPKI format)
 * @returns Server's public key as base64 string (SPKI format)
 */
export function getServerPublicKey(): string {
  const publicKeyPem = process.env.ECDH_SERVER_PUBLIC_KEY
  if (!publicKeyPem) {
    throw new Error('ECDH_SERVER_PUBLIC_KEY environment variable is not set')
  }

  try {
    // 规范化密钥：处理 Vercel 环境变量中可能的字面字符串 \n 转换为实际换行符
    let normalizedKey = publicKeyPem

    // 如果包含字面字符串 \n，替换为实际换行符
    if (normalizedKey.includes('\\n')) {
      normalizedKey = normalizedKey.replace(/\\n/g, '\n')
    }

    // 验证 PEM 格式
    if (!normalizedKey.includes('-----BEGIN PUBLIC KEY-----') && !normalizedKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid PEM format: missing BEGIN header')
    }
    if (!normalizedKey.includes('-----END PUBLIC KEY-----') && !normalizedKey.includes('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid PEM format: missing END footer')
    }

    const publicKey = createPublicKey(normalizedKey)
    // Export as SPKI format (base64)
    // Ensure no whitespace in base64 output
    const publicKeyDer = publicKey.export({ format: 'der', type: 'spki' })
    return publicKeyDer.toString('base64').replace(/\s+/g, '')
  } catch (error) {
    throw new Error(`Failed to export server public key: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
