'use client'

import type { JWTPayload } from 'jose'

import { Spinner } from '@/components/Spinner'
import { useClient } from '@/hooks/useClient'

/** Claim keys to show first so readable identity appears before opaque `sub`. */
const CLAIM_DISPLAY_ORDER = ['preferred_username', 'username', 'email', 'authenticated', 'iss', 'sub', 'iat', 'exp']

export interface TokenViewerProps {
  decodedJWTToken: JWTPayload | null
}

/**
 * Prefer human-readable profile claims for a short subtitle (OIDC-style).
 */
function getDisplayIdentity(payload: JWTPayload): string | null {
  const p = payload as Record<string, unknown>
  const preferred = p.preferred_username
  const name = p.username
  const mail = p.email
  if (typeof preferred === 'string' && preferred.trim()) {
    return preferred.trim()
  }
  if (typeof name === 'string' && name.trim()) {
    return name.trim()
  }
  if (typeof mail === 'string' && mail.trim()) {
    return mail.trim()
  }
  return null
}

/**
 * Sort claim entries so username/email appear before technical `sub`.
 */
function orderedClaimEntries(payload: JWTPayload): [string, unknown][] {
  const record = payload as Record<string, unknown>
  const keys = Object.keys(record)
  keys.sort((a, b) => {
    const ia = CLAIM_DISPLAY_ORDER.indexOf(a)
    const ib = CLAIM_DISPLAY_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) {
      return a.localeCompare(b)
    }
    if (ia === -1) {
      return 1
    }
    if (ib === -1) {
      return -1
    }
    return ia - ib
  })
  return keys.map((key) => [key, record[key]])
}

export default function TokenViewer(props: TokenViewerProps) {
  const { decodedJWTToken } = props
  const isClient = useClient()

  if (!isClient) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner color="text-indigo-600" size="w-8 h-8" />
      </div>
    )
  }

  if (!decodedJWTToken) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-center text-xl font-semibold mb-4 text-red-600">Authorization Failed</h2>
          <div className="space-y-4">
            <p className="text-center text-gray-700">Invalid or missing authentication token. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  const displayIdentity = getDisplayIdentity(decodedJWTToken)
  const rows = orderedClaimEntries(decodedJWTToken)

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-1">JWT Token Details</h2>
        {displayIdentity ? (
          <p className="text-indigo-700 font-medium text-lg mb-4 border-b border-gray-100 pb-3">Signed in as {displayIdentity}</p>
        ) : (
          <p className="text-sm text-amber-700 mb-4 border-b border-gray-100 pb-3">
            No <code className="text-xs">username</code> / <code className="text-xs">preferred_username</code> in token—set <code className="text-xs">ACCESS_USERNAME</code> on the
            auth server (and optionally <code className="text-xs">ACCESS_EMAIL</code>).
          </p>
        )}
        <div className="space-y-2">
          {rows.map(([key, value]) => (
            <div key={key} className="flex">
              <span className="font-medium text-gray-700 w-1/3 shrink-0">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
              <span className="text-gray-900 flex-1 break-all">{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
