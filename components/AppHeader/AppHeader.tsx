'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type FC, useCallback, useEffect, useRef, useState } from 'react'
import { FiBookOpen, FiChevronDown, FiCpu, FiGithub, FiKey, FiMenu, FiPackage, FiPlayCircle, FiSettings, FiShield, FiSmartphone, FiX, FiZap } from 'react-icons/fi'

import { HEADER_DOCS, HEADER_MCP, HEADER_PLAYGROUND, HEADER_SIGN_IN, HEADER_TOOLS } from '@/config/header-navigation'
import packageJson from '@/package.json'

/** Display title derived from package name (e.g. `signet` → `Signet`, `my-app` → `My App`). */
const BRAND_TITLE = packageJson.name
  .split(/[-_]/)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
  .join(' ')
const GITHUB_URL = packageJson.repository?.url

/** App mark shown before the brand title (same asset family as favicons in `public/`). */
const HEADER_APP_MARK_SRC = '/android-icon-48x48.png'

/** Props shape shared by `react-icons/fi` stroke icons used in the header */
type HeaderFiIcon = FC<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' }>

/** Feather-style (react-icons/fi) icon per tools dropdown entry (href → component) */
const HEADER_TOOL_ICON: Record<string, HeaderFiIcon> = {
  '/ecdh': FiKey,
  '/totp': FiSmartphone,
  '/webauthn': FiShield,
}

/**
 * Small leading icon for primary nav rows; inherits parent text color.
 * @param props.icon - react-icons/fi icon component
 * @param props.size - Icon size in px
 * @returns Icon element
 */
function NavLeadingIcon(props: Readonly<{ icon: HeaderFiIcon; size?: number }>) {
  const { icon: Icon, size = 15 } = props
  return <Icon size={size} className="shrink-0 opacity-[0.88]" aria-hidden />
}

/**
 * @param pathname - Current pathname from Next.js router
 * @param href - Link target; any `#fragment` is ignored for prefix matching
 * @returns True when this link should show active styles
 */
function isActivePath(pathname: string, href: string): boolean {
  const pathOnly = href.split('#')[0] ?? href
  if (pathOnly === '/') {
    return pathname === '/'
  }
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`)
}

/**
 * Renders the global application header: brand, docs, tools (desktop dropdown), playground, MCP, sign-in, GitHub, and a mobile drawer with an accordion for tools.
 * @returns Header React element
 */
export function AppHeader() {
  const pathname = usePathname() ?? '/'
  const docsNavActive = isActivePath(pathname, HEADER_DOCS.href)
  const mcpNavActive = isActivePath(pathname, HEADER_MCP.href)
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  const toolsWrapRef = useRef<HTMLDivElement>(null)

  const closeAll = useCallback(() => {
    setToolsMenuOpen(false)
    setMobileOpen(false)
    setMobileToolsOpen(false)
  }, [])

  useEffect(() => {
    closeAll()
  }, [pathname, closeAll])

  useEffect(() => {
    if (!toolsMenuOpen) {
      return
    }
    function handlePointerDown(event: MouseEvent) {
      const el = toolsWrapRef.current
      if (el && !el.contains(event.target as Node)) {
        setToolsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [toolsMenuOpen])

  useEffect(() => {
    if (!mobileOpen) {
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setToolsMenuOpen(false)
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const linkDesktop = (active: boolean) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] ${
      active
        ? 'bg-[var(--nav-link-active-bg)] text-[var(--nav-link-active-text)]'
        : 'text-[var(--nav-link)] hover:bg-[var(--nav-link-hover-bg)] hover:text-[var(--nav-link-hover-text)]'
    }`

  const linkMobile = (active: boolean) =>
    `flex min-h-11 w-full items-center rounded-lg px-3 py-2 text-base font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] ${
      active
        ? 'bg-[var(--nav-link-active-bg)] text-[var(--nav-link-active-text)]'
        : 'text-[var(--nav-link)] hover:bg-[var(--nav-link-hover-bg)] hover:text-[var(--nav-link-hover-text)]'
    }`

  const toolsChildActive = HEADER_TOOLS.some((t) => isActivePath(pathname, t.href))

  return (
    <header
      className="sticky top-0 z-[120] border-b border-[var(--app-header-border)] bg-[var(--app-header-bg)] text-[var(--app-header-text)] shadow-sm"
      style={{ minHeight: 'var(--header-height)' }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-6">
          <Link
            href="/"
            className="inline-flex min-w-0 max-w-full shrink-0 items-center gap-2 text-base font-semibold tracking-tight text-[var(--nav-brand-text)] transition-colors duration-150 hover:text-[var(--nav-link-hover-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] sm:text-lg"
          >
            <Image src={HEADER_APP_MARK_SRC} alt="" width={28} height={28} className="size-7 shrink-0 rounded-md object-cover" priority aria-hidden />
            <span className="min-w-0 truncate capitalize">{BRAND_TITLE}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            <Link href={HEADER_DOCS.href} className={`inline-flex items-center gap-1.5 ${linkDesktop(docsNavActive)}`} aria-current={docsNavActive ? 'page' : undefined}>
              <NavLeadingIcon icon={FiBookOpen} />
              {HEADER_DOCS.label}
            </Link>

            <div className="relative" ref={toolsWrapRef}>
              <button
                type="button"
                className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] ${
                  toolsChildActive
                    ? 'bg-[var(--nav-link-active-bg)] text-[var(--nav-link-active-text)]'
                    : toolsMenuOpen
                      ? 'bg-[var(--nav-link-hover-bg)] text-[var(--nav-link-hover-text)]'
                      : 'text-[var(--nav-link)] hover:bg-[var(--nav-link-hover-bg)] hover:text-[var(--nav-link-hover-text)]'
                }`}
                aria-expanded={toolsMenuOpen}
                aria-haspopup="true"
                onClick={() => setToolsMenuOpen((o) => !o)}
              >
                <NavLeadingIcon icon={FiSettings} />
                Tools
                <FiChevronDown size={16} className={toolsMenuOpen ? 'rotate-180 transition-transform' : 'transition-transform'} aria-hidden />
              </button>
              {toolsMenuOpen ? (
                <div
                  className="absolute left-0 top-full z-50 mt-1 min-w-[12.5rem] rounded-lg border border-[var(--app-header-border)] bg-[var(--app-header-bg)] py-1 shadow-lg"
                  role="menu"
                  aria-label="Tools"
                >
                  {HEADER_TOOLS.map((item) => {
                    const active = isActivePath(pathname, item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors duration-150 ${
                          active
                            ? 'bg-[var(--nav-dropdown-active-bg)] font-medium text-[var(--nav-dropdown-active-text)]'
                            : 'text-[var(--nav-link)] hover:bg-[var(--nav-dropdown-hover-bg)] hover:text-[var(--nav-link-hover-text)]'
                        }`}
                        onClick={() => setToolsMenuOpen(false)}
                      >
                        <NavLeadingIcon icon={HEADER_TOOL_ICON[item.href] ?? FiPackage} size={14} />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              ) : null}
            </div>

            <Link
              href={HEADER_PLAYGROUND.href}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] ${linkDesktop(isActivePath(pathname, HEADER_PLAYGROUND.href))}`}
              aria-current={isActivePath(pathname, HEADER_PLAYGROUND.href) ? 'page' : undefined}
            >
              <NavLeadingIcon icon={FiPlayCircle} />
              <span>{HEADER_PLAYGROUND.label}</span>
              <span className="ml-0.5 inline-flex items-center gap-0.5 rounded border border-[var(--nav-demo-badge-border)] bg-[var(--nav-demo-badge-bg)] px-1 py-0.5 text-[10px] font-semibold uppercase leading-none text-[var(--nav-demo-badge-text)]">
                <FiZap size={10} className="shrink-0 text-[var(--nav-demo-badge-text)]" aria-hidden />
                Demo
              </span>
            </Link>

            <Link href={HEADER_MCP.href} className={`inline-flex items-center gap-1.5 ${linkDesktop(mcpNavActive)}`} aria-current={mcpNavActive ? 'page' : undefined}>
              <NavLeadingIcon icon={FiCpu} />
              {HEADER_MCP.label}
            </Link>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={HEADER_SIGN_IN.href}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--app-primary)] px-3 py-2 text-sm font-semibold text-[var(--app-primary-fg)] shadow-sm transition hover:bg-[var(--app-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] sm:px-4"
          >
            {HEADER_SIGN_IN.label}
          </Link>

          {GITHUB_URL ? (
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full p-2 text-[var(--nav-icon-muted)] transition-colors duration-150 hover:bg-[var(--nav-icon-hover-bg)] hover:text-[var(--nav-icon-hover-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] md:inline-flex"
              aria-label="GitHub repository"
            >
              <FiGithub size={22} />
            </a>
          ) : null}

          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-[var(--nav-icon-muted)] transition-colors duration-150 hover:bg-[var(--nav-icon-hover-bg)] hover:text-[var(--nav-icon-hover-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="app-header-mobile-drawer"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[200] md:hidden" id="app-header-mobile-drawer" role="dialog" aria-modal="true" aria-label="Site navigation">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-[var(--app-header-border)] bg-[var(--app-header-bg)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--app-header-border)] px-4 py-3">
              <span className="text-sm font-semibold text-[var(--nav-brand-text)]">Menu</span>
              <button
                type="button"
                className="rounded-lg p-2 text-[var(--nav-icon-muted)] transition-colors duration-150 hover:bg-[var(--nav-icon-hover-bg)] hover:text-[var(--nav-icon-hover-text)]"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Mobile primary">
              <Link href={HEADER_DOCS.href} className={`${linkMobile(docsNavActive)} gap-2`} onClick={closeAll}>
                <NavLeadingIcon icon={FiBookOpen} size={17} />
                {HEADER_DOCS.label}
              </Link>

              <div className="rounded-lg border border-[var(--nav-drawer-group-border)] bg-[var(--nav-drawer-group-bg)]">
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2 text-left text-base font-medium text-[var(--nav-brand-text)]"
                  aria-expanded={mobileToolsOpen}
                  onClick={() => setMobileToolsOpen((o) => !o)}
                >
                  <span className="inline-flex items-center gap-2">
                    <NavLeadingIcon icon={FiSettings} size={17} />
                    Tools
                  </span>
                  <FiChevronDown size={18} className={mobileToolsOpen ? 'rotate-180 transition-transform' : 'transition-transform'} aria-hidden />
                </button>
                {mobileToolsOpen ? (
                  <div className="border-t border-[var(--nav-drawer-group-border)] bg-[var(--app-header-bg)] px-2 py-2">
                    {HEADER_TOOLS.map((item) => (
                      <Link key={item.href} href={item.href} className={`${linkMobile(isActivePath(pathname, item.href))} mb-1 gap-2 last:mb-0`} onClick={closeAll}>
                        <NavLeadingIcon icon={HEADER_TOOL_ICON[item.href] ?? FiPackage} size={16} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              <Link
                href={HEADER_PLAYGROUND.href}
                className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-base font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] ${linkMobile(isActivePath(pathname, HEADER_PLAYGROUND.href))}`}
                onClick={closeAll}
                aria-current={isActivePath(pathname, HEADER_PLAYGROUND.href) ? 'page' : undefined}
              >
                <span className="inline-flex min-w-0 flex-1 items-center gap-2">
                  <NavLeadingIcon icon={FiPlayCircle} size={17} />
                  {HEADER_PLAYGROUND.label}
                </span>
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded border border-[var(--nav-demo-badge-border)] bg-[var(--nav-demo-badge-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none text-[var(--nav-demo-badge-text)]">
                  <FiZap size={10} className="shrink-0 text-[var(--nav-demo-badge-text)]" aria-hidden />
                  Demo
                </span>
              </Link>

              <Link href={HEADER_MCP.href} className={`${linkMobile(mcpNavActive)} gap-2`} onClick={closeAll}>
                <NavLeadingIcon icon={FiCpu} size={17} />
                {HEADER_MCP.label}
              </Link>

              {GITHUB_URL ? (
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto flex min-h-11 items-center gap-2 rounded-lg border border-[var(--app-header-border)] px-3 py-2 text-base font-medium text-[var(--nav-link)] transition-colors duration-150 hover:bg-[var(--nav-link-hover-bg)] hover:text-[var(--nav-link-hover-text)]"
                  onClick={closeAll}
                >
                  <FiGithub size={20} />
                  GitHub
                </a>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  )
}
