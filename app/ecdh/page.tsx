'use client'

import dynamic from 'next/dynamic'

import { ToolPageSkeleton } from '@/components/ui/ToolPageSkeleton'

const ECDHClient = dynamic(() => import('./ECDHClient'), {
  ssr: false,
  loading: () => <ToolPageSkeleton label="ECDH setup" title="Loading ECDH tool" showSectionLabel={false} />,
})

export default function ECDHKeyGeneration() {
  return <ECDHClient />
}
