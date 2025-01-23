import { NextResponse } from 'next/server'

export interface StandardResponse {
  code: number
  message: string
  data: any
}

export interface StandardResponseInit {
  code?: number
  message?: string
  data?: any
}

export function standardResponse(init?: StandardResponseInit): StandardResponse {
  const { code = 0, message = 'ok', data = null } = init || {}
  return { code, message, data }
}

export function standardResponseSuccess(data?: any): StandardResponse {
  return standardResponse({ code: 0, message: 'ok', data })
}

export function standardResponseError(message: string, init?: Omit<StandardResponseInit, 'message'>): StandardResponse {
  const { code = 1, data = null } = init || {}
  return standardResponse({ code, message, data })
}

export interface ResponseInit {
  status?: number
  headers?: Headers
}

export function json(data: StandardResponse, options: ResponseInit = {}) {
  return NextResponse.json(data, { status: 200, ...options })
}

export function jsonSuccess(data?: any, options: ResponseInit = {}) {
  const response = standardResponseSuccess(data)
  return json(response, { status: 200, ...options })
}

export interface ErrorResponseInit extends ResponseInit {
  code?: number
}

export function jsonInvalidParameters(message: string, options: ErrorResponseInit = {}) {
  const { code } = options || {}
  const response = standardResponseError(message, { code })
  return json(response, { status: 400, ...options })
}

export function jsonUnauthorized(message = 'unauthorized', options: ErrorResponseInit = {}) {
  const { code } = options || {}
  const response = standardResponseError(message, { code })
  return json(response, { status: 401, ...options })
}
