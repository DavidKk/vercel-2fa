'use client'

import { HelpCircle } from 'feather-icons-react'

import { useSidebar } from './SidebarContext'

interface HelpButtonProps {
  contentKey: string
}

export function HelpButton({ contentKey }: HelpButtonProps) {
  const { openSidebar } = useSidebar()

  return (
    <button
      onClick={() => openSidebar(contentKey)}
      className="fixed top-20 right-6 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 z-30"
      aria-label="View explanation"
      title="View explanation"
    >
      <HelpCircle size={24} />
    </button>
  )
}
