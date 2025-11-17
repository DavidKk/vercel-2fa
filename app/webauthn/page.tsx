'use client'

import { useCallback, useEffect, useState } from 'react'

import { AssistSidebarTrigger, useAssistSidebarContent } from '@/components/AssistSidebar'
import type { StoreCredentials } from '@/services/webauthn'

import principlesMd from './docs/principles.md'
import usageMd from './docs/usage.md'
import Form from './Form'
import Success from './Success'
import Verification from './Verification'

export default function WebAuthnSetup() {
  // Register sidebar sections for this page
  useAssistSidebarContent('webauthn', [
    { key: 'usage', title: 'How to Use', markdown: usageMd },
    { key: 'principles', title: 'Principles', markdown: principlesMd },
  ])

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

  return (
    <>
      <AssistSidebarTrigger contentKey="webauthn" />
      {isVerifyMode && credentials ? (
        <Verification credentials={credentials} onSuccess={() => toggleVerifyMode(false)} />
      ) : isGenerated && credentials ? (
        <Success
          credentials={credentials}
          onVerify={() => {
            setGenerated(false)
            toggleVerifyMode(true)
          }}
        />
      ) : (
        <Form
          onGenerateCredential={(credentials) => {
            setCredentials(credentials)
            setGenerated(true)
          }}
        />
      )}
    </>
  )
}
