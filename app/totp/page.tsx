'use client'

import { useCallback, useEffect, useState } from 'react'

import { HelpButton, useSidebarContent } from '@/components/Sidebar'

import principlesMd from './docs/principles.md'
import usageMd from './docs/usage.md'
import Form from './Form'
import Qrcode from './Qrcode'
import Verification from './Verification'

export default function TwoFactorSetup() {
  // Register sidebar sections for this page
  useSidebarContent('totp', [
    { key: 'usage', title: 'How to Use', markdown: usageMd },
    { key: 'principles', title: 'Principles', markdown: principlesMd },
  ])

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

  return (
    <>
      <HelpButton contentKey="totp" />
      {isVerified ? (
        <Verification secret={secret} />
      ) : qrCode ? (
        <Qrcode
          qrCode={qrCode}
          secret={secret}
          onVerify={() => {
            setQrCode('')
            setIsVerified(true)
          }}
        />
      ) : (
        <Form
          onGenerate2fa={({ qrCode, secret }) => {
            setQrCode(qrCode)
            setSecret(secret)
          }}
        />
      )}
    </>
  )
}
