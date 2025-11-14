'use client'

import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useState } from 'react'

export interface SidebarSection {
  key: string
  title: string
  content: string
}

interface SidebarContextType {
  isOpen: boolean
  sections: SidebarSection[]
  activeSection: string | null
  openSidebar: (moduleKey: string) => void
  closeSidebar: () => void
  setActiveSection: (sectionKey: string) => void
  registerSections: (moduleKey: string, sections: SidebarSection[]) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [sectionsRegistry, setSectionsRegistry] = useState<Record<string, SidebarSection[]>>({})
  const [currentModule, setCurrentModule] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const registerSections = useCallback((moduleKey: string, sections: SidebarSection[]) => {
    setSectionsRegistry((prev) => {
      // Only update if sections changed
      const prevSections = prev[moduleKey]
      if (prevSections && JSON.stringify(prevSections) === JSON.stringify(sections)) {
        return prev
      }
      return { ...prev, [moduleKey]: sections }
    })
  }, [])

  const openSidebar = useCallback((moduleKey: string) => {
    setSectionsRegistry((registry) => {
      const sections = registry[moduleKey]
      if (sections && sections.length > 0) {
        setCurrentModule(moduleKey)
        setActiveSection(sections[0].key)
        setIsOpen(true)
      }
      return registry
    })
  }, [])

  const closeSidebar = useCallback(() => {
    setIsOpen(false)
    // Delay clearing content until animation completes
    setTimeout(() => {
      setCurrentModule(null)
      setActiveSection(null)
    }, 300)
  }, [])

  const handleSetActiveSection = useCallback((sectionKey: string) => {
    setActiveSection(sectionKey)
  }, [])

  const sections = currentModule ? sectionsRegistry[currentModule] || [] : []

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        sections,
        activeSection,
        openSidebar,
        closeSidebar,
        setActiveSection: handleSetActiveSection,
        registerSections,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
