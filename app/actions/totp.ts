'use server'

import { verifyTOTPToken } from '@/utils/totp'
import { generateJWTToken } from '@/app/actions/jwt'

export interface Verify2faParams {
  token: string
}

export async function verfiyToken(payload: Verify2faParams) {
  const { token } = payload
  const { ACCESS_TOTP_SECRET: secret } = getTOTPConfig()
  return verifyTOTPToken({ token, secret })
}

function getTOTPConfig() {
  const ACCESS_TOTP_SECRET = process.env.ACCESS_TOTP_SECRET
  if (!ACCESS_TOTP_SECRET) {
    throw new Error('process.env.ACCESS_TOTP_SECRET is not defined')
  }

  return { ACCESS_TOTP_SECRET }
}
