'use client'

import { useEffect, useState } from 'react'
import type { Jwt, JwtPayload } from 'jsonwebtoken'
import { useSearchParams } from 'next/navigation'
import { Spinner } from '@/components/Spinner'
import { useClient } from '@/hooks/useClient'
import { verifyJWTToken } from '@/app/actions/jwt'

export default function TokenViewer() {
  const isClient = useClient()
  const [decodedJWTToken, setDecodedJWTToken] = useState<string | Jwt | JwtPayload | null>(null)
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      return
    }

    verifyJWTToken(token).then((decoded) => {
      setDecodedJWTToken(decoded)
    })
  }, [])

  if (!isClient) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner color="text-indigo-600" size="w-8 h-8" />
      </div>
    )
  }

  if (!decodedJWTToken) {
    return <div className="flex flex-1 items-center justify-center">Unauthority</div>
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
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
