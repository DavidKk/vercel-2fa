import { generate } from '@/components/Meta'

import { GettingStartedContent } from './GettingStartedContent'

const { generateMetadata } = generate({
  title: 'Getting Started - Two-Factor Authentication Service',
  description: 'Learn how to set up and integrate the Two-Factor Authentication Service for your applications.',
})

export { generateMetadata }

export default function GettingStartedPage() {
  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 w-full">
        <GettingStartedContent />
      </div>
    </div>
  )
}
