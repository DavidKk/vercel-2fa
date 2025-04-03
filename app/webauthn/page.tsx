'use client'

import { useCallback, useEffect, useState } from 'react'
import Form from './Form'
import Verification from './Verification'

export default function WebAuthnSetup() {
  const [credential, setCredential] = useState('')
  const [isVerified, setIsVerified] = useState(false)

  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    event.preventDefault()
    event.returnValue = ''
  }, [])

  useEffect(() => {
    if (!credential) {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      return
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [credential])

  if (isVerified) {
    return <Verification credential={credential} />
  }

  return (
    <Form
      onGenerateCredential={(payload) => {
        setCredential(payload.credential)
        setIsVerified(true)
      }}
    />
  )
}
