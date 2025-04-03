'use client'

import React from 'react'
import { useClient } from '@/hooks/useClient'
import { isInvalidDate } from '@/utils/date'

function BuildTime() {
  const isClient = useClient()
  if (!isClient) {
    return null
  }

  const date = new Date(`${process.env.NEXT_PUBLIC_BUILD_TIME}`)
  return (
    <div className="text-xs font-medium text-gray-600 tracking-wide">
      {!isInvalidDate(date) && (
        <>
          Build Time: <span className="font-mono text-gray-700">{date.toLocaleString()}</span>
        </>
      )}
    </div>
  )
}

export default React.memo(BuildTime, () => true)
