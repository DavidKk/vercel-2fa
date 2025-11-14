'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { useSidebar } from './SidebarContext'

/**
 * Component that listens to route changes and closes the sidebar
 */
export function SidebarRouteListener() {
  const pathname = usePathname()
  const { closeSidebar, isOpen } = useSidebar()

  useEffect(() => {
    // Close sidebar when route changes
    if (isOpen) {
      closeSidebar()
    }
  }, [pathname])

  return null
}
