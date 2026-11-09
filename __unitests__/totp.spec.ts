import { createGuardrails, generateSync } from 'otplib'

import { generateTOTPSecret, verifyTOTPToken } from '@/utils/totp'

const legacySecretGuardrails = createGuardrails({ MIN_SECRET_BYTES: 10 })

function currentToken(secret: string) {
  return generateSync({ secret, guardrails: legacySecretGuardrails })
}

describe('TOTP secrets issued by this app', () => {
  test('keeps the 10-byte secret length and accepts its current code', async () => {
    const { secret, qrCode } = await generateTOTPSecret({ username: 'ada', appName: 'Signet' })

    expect(secret).toMatch(/^[A-Z2-7]+$/)
    expect(secret).toHaveLength(16)
    expect(qrCode.startsWith('data:image/png;base64,')).toBe(true)
    await expect(verifyTOTPToken({ token: currentToken(secret), secret })).resolves.toBe(true)
  })

  test('still verifies a previously stored 10-byte secret', async () => {
    const secret = 'JBSWY3DPEHPK3PXP'

    await expect(verifyTOTPToken({ token: currentToken(secret), secret })).resolves.toBe(true)
  })

  test('rejects a code that is not the current token', async () => {
    const secret = 'JBSWY3DPEHPK3PXP'
    const token = currentToken(secret)
    const wrong = token === '000000' ? '000001' : '000000'

    await expect(verifyTOTPToken({ token: wrong, secret })).resolves.toBe(false)
  })

  test('returns false for a secret otplib cannot decode', async () => {
    await expect(verifyTOTPToken({ token: '123456', secret: 'not-base32!!!' })).resolves.toBe(false)
  })
})
