import { NextResponse } from 'next/server'

import { CACHE_CONTROL_NO_STORE } from '../response/cache-control'
import { MCP_ERRORS } from './errors'

export function applyNoStoreCache<T>(res: NextResponse<T>): NextResponse<T> {
  res.headers.set('Cache-Control', CACHE_CONTROL_NO_STORE)
  return res
}

export interface MCPResponseError {
  code: string
  message: string
  detail?: any
}

export function mcpResponse<T>(result?: T) {
  return applyNoStoreCache(NextResponse.json({ type: 'result', result }))
}

export function mcpError(error: MCPResponseError) {
  return applyNoStoreCache(NextResponse.json({ type: 'error', error }))
}

export function mcpErrorinvalidArguments(message?: string) {
  return mcpError({ ...MCP_ERRORS.INVALID_ARGUMENT, ...(message && { message }) })
}

export function mcpErrorToolNotFound(message?: string) {
  return mcpError({ ...MCP_ERRORS.TOOL_NOT_FOUND, ...(message && { message }) })
}

export function mcpErrorMethodNotAllowed(message?: string) {
  return mcpError({ ...MCP_ERRORS.METHOD_NOT_ALLOWED, ...(message && { message }) })
}

export const JSONRPC = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const

export function jsonRpcSuccess(id: string | number | null, result: unknown) {
  return applyNoStoreCache(NextResponse.json({ jsonrpc: '2.0', id, result }))
}

export function jsonRpcError(id: string | number | null, code: number, message: string) {
  return applyNoStoreCache(NextResponse.json({ jsonrpc: '2.0', id, error: { code, message } }))
}
