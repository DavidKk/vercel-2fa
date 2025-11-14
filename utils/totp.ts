import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export interface GenerateTOTPSecretParams {
  username: string
  appName: string
}

export async function generateTOTPSecret(params: GenerateTOTPSecretParams) {
  const { username, appName } = params
  const secret = authenticator.generateSecret()
  const otpauthUrl = authenticator.keyuri(username, appName, secret)
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
    const isValid = authenticator.check(token, secret)
    return isValid
  } catch (error) {
    return false
  }
}
