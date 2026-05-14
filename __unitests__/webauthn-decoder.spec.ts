import { credentialRpIdMatchesHost, normalizeRequestHostname, resolveWebAuthnCredentialsForHost } from '@/services/webauthn'

const pk = Buffer.from('test-public-key-bytes-32chars!!').toString('base64')

const credLocal = {
  credentialID: 'cred-local',
  publicKey: pk,
  rpId: 'localhost',
  username: 'admin',
}

const credProd = {
  credentialID: 'cred-prod',
  publicKey: pk,
  rpId: 'vercel-2fa.vercel.app',
  username: 'admin',
}

describe('resolveWebAuthnCredentialsForHost', () => {
  test('legacy flat object when hostname matches rpId', () => {
    const json = JSON.stringify(credLocal)
    expect(resolveWebAuthnCredentialsForHost(json, 'localhost')).not.toBeNull()
    expect(resolveWebAuthnCredentialsForHost(json, 'localhost')?.credentialID).toBe('cred-local')
    expect(resolveWebAuthnCredentialsForHost(json, 'evil.com')).toBeNull()
  })

  test('byHost picks entry for current host key', () => {
    const json = JSON.stringify({
      byHost: {
        localhost: credLocal,
        'vercel-2fa.vercel.app': credProd,
      },
    })
    expect(resolveWebAuthnCredentialsForHost(json, 'localhost')?.credentialID).toBe('cred-local')
    expect(resolveWebAuthnCredentialsForHost(json, 'vercel-2fa.vercel.app')?.credentialID).toBe('cred-prod')
  })

  test('credentials array picks first rpId match', () => {
    const json = JSON.stringify({
      credentials: [credProd, credLocal],
    })
    expect(resolveWebAuthnCredentialsForHost(json, 'localhost')?.credentialID).toBe('cred-local')
  })

  test('subdomain matches parent rpId', () => {
    const cred = { ...credProd, rpId: 'example.com' }
    const json = JSON.stringify({ credentials: [cred] })
    expect(resolveWebAuthnCredentialsForHost(json, 'app.example.com')?.credentialID).toBe('cred-prod')
  })
})

describe('normalizeRequestHostname', () => {
  test('strips port and lowercases', () => {
    expect(normalizeRequestHostname('LocalHost:3000')).toBe('localhost')
  })
})

describe('credentialRpIdMatchesHost', () => {
  test('exact and subdomain', () => {
    expect(credentialRpIdMatchesHost('localhost', 'localhost')).toBe(true)
    expect(credentialRpIdMatchesHost('app.example.com', 'example.com')).toBe(true)
    expect(credentialRpIdMatchesHost('example.com', 'app.example.com')).toBe(false)
  })
})
