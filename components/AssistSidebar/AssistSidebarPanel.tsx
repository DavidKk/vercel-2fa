'use client'

import { FiX } from 'react-icons/fi'

import { useAssistSidebar } from './AssistSidebarContext'

export function AssistSidebarPanel() {
  const { isOpen, sections, activeSection, setActiveSection, closeSidebar } = useAssistSidebar()

  const currentContent = sections.find((s) => s.key === activeSection)?.content || ''

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-x-0 bottom-0 top-[var(--header-height)] z-40 bg-black/35 transition-opacity duration-300" onClick={closeSidebar} />}

      {/* Sidebar drawer */}
      <aside
        className={`fixed left-0 top-[var(--header-height)] z-50 flex h-[calc(100dvh-var(--header-height))] w-full border-r border-[var(--app-header-border)] bg-[var(--app-header-bg)] text-[var(--foreground)] shadow-xl transition-transform duration-300 ease-in-out md:w-[900px] lg:w-[1100px] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation */}
        <nav className="w-48 flex-shrink-0 border-r border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)]">
          <div className="p-4">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--app-header-text)]">Guide</p>
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.key}>
                  <button
                    onClick={() => setActiveSection(section.key)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      activeSection === section.key
                        ? 'bg-[var(--nav-link-active-bg)] font-medium text-[var(--nav-link-active-text)]'
                        : 'text-[var(--app-header-text)] hover:bg-[var(--nav-link-hover-bg)] hover:text-[var(--nav-link-hover-text)]'
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Content area */}
        <div className="flex-1 flex flex-col relative min-w-0">
          {/* Close button */}
          <button
            onClick={closeSidebar}
            className="absolute right-4 top-4 z-10 rounded-lg p-2 text-[var(--nav-icon-muted)] transition-colors duration-150 hover:bg-[var(--nav-link-hover-bg)] hover:text-[var(--nav-brand-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)]"
            aria-label="Close assist sidebar"
          >
            <FiX size={20} />
          </button>

          <div className="h-full overflow-y-auto overflow-x-hidden">
            <div className="min-w-0 p-5 pr-14 sm:p-8 sm:pr-16">
              {currentContent && (
                <div className="sidebar-content break-words">
                  <div dangerouslySetInnerHTML={{ __html: currentContent }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
