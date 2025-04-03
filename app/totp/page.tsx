'use client'

import { useCallback, useEffect, useState } from 'react'
import Qrcode from './Qrcode'
import Form from './Form'
import Verification from './Verification'

export default function TwoFactorSetup() {
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [isVerified, setIsVerified] = useState(false)

  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    event.preventDefault()
    event.returnValue = ''
  }, [])

  useEffect(() => {
    if (!qrCode) {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      return
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [qrCode])

  if (isVerified) {
    return <Verification secret={secret} />
  }

  if (qrCode) {
    return (
      <Qrcode
        qrCode={qrCode}
        secret={secret}
        onVerify={() => {
          setQrCode('')
          setIsVerified(true)
        }}
      />
    )
  }

  return (
    <Form
      onGenerate2fa={({ qrCode, secret }) => {
        setQrCode(qrCode)
        setSecret(secret)
      }}
    />
  )
}
