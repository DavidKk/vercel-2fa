import { Suspense } from 'react'
import { Spinner } from '@/components/Spinner'
import TokenViewer from './TokenViewer'

export default function BlankPage() {
  return (
    <Suspense fallback={<Spinner color="text-indigo-600" />}>
      <TokenViewer />
    </Suspense>
  )
}
