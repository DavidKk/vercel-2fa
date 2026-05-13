import { appUi } from '@/components/ui/app-tokens'

import { OAuthPlaygroundSkeleton } from './OAuthPlayground'

export default function Loading() {
  return (
    <div className={appUi.pageShellTop}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <OAuthPlaygroundSkeleton />
      </div>
    </div>
  )
}
