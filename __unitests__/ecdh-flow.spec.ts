import { createPrivateKey, createPublicKey, generateKeyPairSync } from 'crypto'

import { decryptPayloadFromPeer, encryptPayloadForPeer } from '@/utils/ecdh'

function toBase64SPKI(pem: string) {
  const publicKey = createPublicKey(pem)
  const der = publicKey.export({ format: 'der', type: 'spki' })
  return Buffer.from(der).toString('base64')
}

describe('ECDH encryption flow', () => {
  const createKeyPair = () =>
    generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    })

  test('encrypts JWT payload and decrypts it on the client', () => {
    const serverKeys = createKeyPair()
    const clientKeys = createKeyPair()

    const serverPrivate = createPrivateKey(serverKeys.privateKey)
    const clientPrivate = createPrivateKey(clientKeys.privateKey)
    const clientPublicBase64 = toBase64SPKI(clientKeys.publicKey)
    const serverPublicBase64 = toBase64SPKI(serverKeys.publicKey)

    const payload = JSON.stringify({ token: 'jwt-token', issuedAt: Date.now() })

    const encrypted = encryptPayloadForPeer({
      payload,
      privateKey: serverPrivate,
      peerPublicKeyBase64: clientPublicBase64,
    })

    const decrypted = decryptPayloadFromPeer({
      encryptedData: encrypted,
      privateKey: clientPrivate,
      peerPublicKeyBase64: serverPublicBase64,
    })

    expect(decrypted).toEqual(payload)
  })

  test('fails to decrypt when using mismatched keys', () => {
    const serverKeys = createKeyPair()
    const clientKeys = createKeyPair()
    const attackerKeys = createKeyPair()

    const serverPrivate = createPrivateKey(serverKeys.privateKey)
    const clientPrivate = createPrivateKey(clientKeys.privateKey)
    const attackerPrivate = createPrivateKey(attackerKeys.privateKey)

    const clientPublicBase64 = toBase64SPKI(clientKeys.publicKey)
    const serverPublicBase64 = toBase64SPKI(serverKeys.publicKey)

    const payload = 'secure-data'
    const encrypted = encryptPayloadForPeer({
      payload,
      privateKey: serverPrivate,
      peerPublicKeyBase64: clientPublicBase64,
    })

    expect(() =>
      decryptPayloadFromPeer({
        encryptedData: encrypted,
        privateKey: attackerPrivate,
        peerPublicKeyBase64: serverPublicBase64,
      })
    ).toThrow()

    const decrypted = decryptPayloadFromPeer({
      encryptedData: encrypted,
      privateKey: clientPrivate,
      peerPublicKeyBase64: serverPublicBase64,
    })

    expect(decrypted).toBe(payload)
  })
})
