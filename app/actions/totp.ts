'use server'

import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export interface Generate2faParams {
  username: string
  appName: string
}

export async function generate2fa(params: Generate2faParams) {
  const { username, appName } = params
  const secret = authenticator.generateSecret()
  const otpauthUrl = authenticator.keyuri(username, appName, secret)
  const qrCode = await QRCode.toDataURL(otpauthUrl)
  return { qrCode, secret }
}

export interface Verify2faParams {
  token: string
  secret: string
}

export async function verify2fa(params: Verify2faParams) {
  const { token, secret } = params

  try {
    const isValid = authenticator.check(token, secret)
    return isValid
  } catch (error) {
    return false
  }
}
