import { createGuardrails, generateSecret, generateURI, verify } from 'otplib'
import QRCode from 'qrcode'

/**
 * otplib 12 `authenticator.generateSecret()` issued 10-byte secrets and
 * `authenticator.check()` accepted them. otplib 13 throws SecretTooShortError
 * below 16 bytes, which would reject secrets this app already stored.
 */
const ISSUED_SECRET_BYTES = 10
const legacySecretGuardrails = createGuardrails({ MIN_SECRET_BYTES: ISSUED_SECRET_BYTES })

export interface GenerateTOTPSecretParams {
  username: string
  appName: string
}

export async function generateTOTPSecret(params: GenerateTOTPSecretParams) {
  const { username, appName } = params
  const secret = generateSecret({ length: ISSUED_SECRET_BYTES })
  const otpauthUrl = generateURI({
    issuer: appName,
    label: username,
    secret,
  })
  const qrCode = await QRCode.toDataURL(otpauthUrl)
  return { qrCode, secret }
}

export interface VerifyTOTPTokenParams {
  token: string
  secret: string
}

export async function verifyTOTPToken(params: VerifyTOTPTokenParams) {
  const { token, secret } = params

  try {
    const result = await verify({
      token,
      secret,
      guardrails: legacySecretGuardrails,
    })
    return result.valid
  } catch {
    return false
  }
}
