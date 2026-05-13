'use client'

import dynamic from 'next/dynamic'

import { ToolPageSkeleton } from '@/components/ui/ToolPageSkeleton'

const WebAuthnClient = dynamic(() => import('./WebAuthnClient'), {
  ssr: false,
  loading: () => <ToolPageSkeleton label="WebAuthn setup" title="Loading WebAuthn tool" fields={3} />,
})

export default function WebAuthnPage() {
  return <WebAuthnClient />
}
