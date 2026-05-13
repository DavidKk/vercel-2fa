'use client'

import { FiHelpCircle } from 'react-icons/fi'

import { useAssistSidebar } from './AssistSidebarContext'

export interface AssistSidebarTriggerProps {
  contentKey: string
}

export function AssistSidebarTrigger({ contentKey }: AssistSidebarTriggerProps) {
  const { openSidebar } = useAssistSidebar()

  return (
    <button
      onClick={() => openSidebar(contentKey)}
      className="fixed right-6 top-20 z-30 hidden size-11 items-center justify-center rounded-full border border-[var(--app-header-border)] bg-[var(--app-header-bg)] text-[var(--nav-brand-text)] shadow-sm transition-colors duration-150 hover:bg-[var(--nav-link-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] sm:inline-flex"
      aria-label="View contextual guide"
      title="View contextual guide"
    >
      <FiHelpCircle size={22} />
    </button>
  )
}
