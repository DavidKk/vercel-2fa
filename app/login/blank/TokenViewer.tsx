'use client'

import type { Jwt, JwtPayload } from 'jsonwebtoken'
import { Spinner } from '@/components/Spinner'
import { useClient } from '@/hooks/useClient'

interface TokenViewerProps {
  decodedJWTToken: string | Jwt | JwtPayload | null
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

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">JWT Token Details</h2>
        <div className="space-y-2">
          {Object.entries(decodedJWTToken).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="font-medium text-gray-700 w-1/3">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
              <span className="text-gray-900 flex-1">{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
