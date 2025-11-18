'use client'

import { useState } from 'react'

import { AssistSidebarTrigger, useAssistSidebarContent } from '@/components/AssistSidebar'

import flowMd from './docs/flow.md'
import principlesMd from './docs/principles.md'
import usageMd from './docs/usage.md'
import Form from './Form'
import Success from './Success'

interface GeneratedKeys {
  privateKey: string
  publicKey: string
  publicKeyBase64: string
}

export default function ECDHClient() {
  // Register sidebar sections for this page
  useAssistSidebarContent('ecdh', [
    { key: 'usage', title: 'How to Use', markdown: usageMd },
    { key: 'principles', title: 'Principles', markdown: principlesMd },
    { key: 'flow', title: 'OAuth Flow', markdown: flowMd },
  ])

  const [keys, setKeys] = useState<GeneratedKeys | null>(null)

  return (
    <>
      <AssistSidebarTrigger contentKey="ecdh" />
      {keys ? <Success keys={keys} /> : <Form onGenerate={setKeys} />}
    </>
  )
}
