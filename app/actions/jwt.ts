'use server'

import type jwt from 'jsonwebtoken'
import { generateToken, verifyToken } from '@/services/jwt'

export async function generateJWTToken(payload: object, options?: jwt.SignOptions | undefined) {
  return generateToken(payload, options)
}

export async function verifyJWTToken(token: string, options?: jwt.VerifyOptions | undefined) {
  return verifyToken(token, options)
}
