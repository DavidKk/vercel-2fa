'use client'

import dynamic from 'next/dynamic'

import { ToolPageSkeleton } from '@/components/ui/ToolPageSkeleton'

const TOTPClient = dynamic(() => import('./TOTPClient'), {
  ssr: false,
  loading: () => <ToolPageSkeleton label="TOTP setup" title="Loading TOTP tool" fields={2} />,
})

export default function TOTPPage() {
  return <TOTPClient />
}
