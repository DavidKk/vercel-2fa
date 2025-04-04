'use client'

import { useCallback, useEffect, useState } from 'react'
import type { StoreCredentials } from '@/services/webauthn'
import Form from './Form'
import Success from './Success'
import Verification from './Verification'

export default function WebAuthnSetup() {
  const [credentials, setCredentials] = useState<StoreCredentials>()
  const [isGenerated, setGenerated] = useState(false)
  const [isVerifyMode, toggleVerifyMode] = useState(false)

  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    event.preventDefault()
    event.returnValue = ''
  }, [])

  useEffect(() => {
    if (!credentials) {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      return
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [credentials])

  if (isVerifyMode && credentials) {
    return <Verification credentials={credentials} onSuccess={() => toggleVerifyMode(false)} />
  }

  if (isGenerated && credentials) {
    return (
      <Success
        credentials={credentials}
        onVerify={() => {
          setGenerated(false)
          toggleVerifyMode(true)
        }}
      />
    )
  }

  return (
    <Form
      onGenerateCredential={(credentials) => {
        setCredentials(credentials)
        setGenerated(true)
      }}
    />
  )
}
