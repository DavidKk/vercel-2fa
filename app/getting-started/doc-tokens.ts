/**
 * Layout and typography classes for Getting Started documentation (Signet theme tokens).
 * Keeps docs aligned with login / header surfaces and supports light + dark via :root variables.
 */
export const gettingStartedDoc = {
  /** Reading column inside the right panel (line length). */
  docMain: 'mx-auto w-full min-w-0 max-w-3xl',
  /** Small uppercase label above a major block. */
  docSectionLabel: 'mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--app-header-text)]',
  /** Two-column doc layout; min-w-0 prevents long code from overflowing the grid track. */
  docGridTwoCol:
    'mb-10 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:gap-y-0 [&>*:nth-child(2)]:max-lg:border-t [&>*:nth-child(2)]:max-lg:border-[var(--app-header-border)] [&>*:nth-child(2)]:max-lg:pt-8',
  /** Monospace env line snippet container (horizontal scroll if needed). */
  docEnvSnippet: 'max-w-full min-w-0 overflow-x-auto rounded-lg border border-[var(--app-header-border)] p-2',
  article: 'min-w-0 max-w-none text-sm leading-relaxed text-[var(--foreground)]',
  h2: 'text-xl font-semibold tracking-tight text-[var(--nav-brand-text)] mb-3',
  h3: 'text-base font-semibold text-[var(--nav-brand-text)] mb-2',
  h4: 'text-sm font-semibold text-[var(--nav-brand-text)]',
  lead: 'text-sm text-[var(--app-header-text)] mb-4 leading-relaxed',
  muted: 'text-xs text-[var(--app-header-text)]',
  link: 'font-medium text-[var(--nav-brand-text)] underline-offset-2 hover:underline',
  /** Use with text + trailing <FiArrowRight /> for "open" links. */
  linkWithArrow: 'inline-flex items-center gap-1',
  codeInline: 'rounded border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] px-1.5 py-0.5 text-xs font-mono text-[var(--foreground)]',
  codeBadge: 'rounded border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] px-2 py-0.5 text-xs font-semibold font-mono text-[var(--nav-brand-text)]',
  preBox: 'rounded-lg border border-[var(--app-header-border)] bg-[var(--background)] p-3 text-[11px] font-mono text-[var(--foreground)] whitespace-pre-wrap break-all',
  card: 'rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] p-4 shadow-sm',
  cardMuted: 'rounded-xl border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] p-4',
  iconBox: 'flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] text-[var(--nav-brand-text)]',
  /** Two-column responsive grid (no vertical outer margin). */
  gridTwoCol: 'grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2',
  listDecimal: 'list-decimal list-inside space-y-1 text-sm text-[var(--app-header-text)]',
  listDisc: 'list-disc list-inside space-y-1 text-xs text-[var(--app-header-text)]',
  pillRequired: 'rounded border border-red-200 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-800 dark:border-red-900/60 dark:text-red-300',
  pillOptional: 'rounded border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--app-header-text)]',
  calloutInfo: 'rounded-xl border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] p-4',
  calloutWarn: 'rounded-xl border border-amber-200/90 bg-amber-50/95 p-4 dark:border-amber-900/50 dark:bg-amber-950/35',
  calloutWarnTitle: 'text-sm font-semibold text-amber-950 dark:text-amber-100',
  calloutWarnBody: 'text-xs text-amber-900 dark:text-amber-200',
  btnPrimary:
    'inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-[var(--app-primary-fg)] shadow-sm transition-colors hover:bg-[var(--app-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)]',
} as const

/**
 * Sidebar tab button classes for Getting Started navigation.
 * @param active Whether this tab is selected
 * @returns Tailwind class string for the tab button
 */
export function gettingStartedNavTabClass(active: boolean): string {
  return active
    ? 'w-full rounded-lg bg-[var(--nav-link-active-bg)] px-3 py-2 text-left text-sm font-medium text-[var(--nav-link-active-text)] transition-colors'
    : 'w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--app-header-text)] transition-colors hover:bg-[var(--nav-link-hover-bg)] hover:text-[var(--nav-link-hover-text)]'
}

/**
 * Compact chip for the mobile Getting Started tab strip (horizontal scroll).
 * @param active Whether this tab is selected
 * @returns Tailwind class string for the chip button
 */
export function gettingStartedNavTabMobileClass(active: boolean): string {
  return active
    ? 'shrink-0 snap-start rounded-full border border-transparent bg-[var(--nav-link-active-bg)] px-3 py-2 text-xs font-semibold whitespace-nowrap text-[var(--nav-link-active-text)] shadow-sm transition-colors'
    : 'shrink-0 snap-start rounded-full border border-[var(--app-header-border)] bg-[var(--app-header-bg)] px-3 py-2 text-xs font-medium whitespace-nowrap text-[var(--app-header-text)] transition-colors hover:bg-[var(--nav-link-hover-bg)] hover:text-[var(--nav-link-hover-text)]'
}
