'use client'

import { useEffect } from 'react'

import { markdownToHtml } from './markdownToHtml'
import type { SidebarSection } from './SidebarContext'
import { useSidebar } from './SidebarContext'

export interface SidebarDoc {
  key: string
  title: string
  markdown: string
}

/**
 * Hook to register sidebar sections for the current page
 * @param moduleKey - Unique key for the module (e.g., 'webauthn', 'totp')
 * @param docs - Array of documents with title and markdown content
 */
export function useSidebarContent(moduleKey: string, docs: SidebarDoc[]) {
  const { registerSections } = useSidebar()

  useEffect(() => {
    const sections: SidebarSection[] = docs.map((doc) => ({
      key: doc.key,
      title: doc.title,
      content: markdownToHtml(doc.markdown),
    }))
    registerSections(moduleKey, sections)
  }, [moduleKey, docs, registerSections])
}
