/**
 * Layout and typography classes for Getting Started documentation (Signet theme tokens).
 * Keeps docs aligned with login / header surfaces and supports light + dark via :root variables.
 */
export const gettingStartedDoc = {
  /** Reading column inside the right panel (line length); wide enough for two-column env docs under the guide sidebar. */
  docMain: 'mx-auto w-full min-w-0 max-w-5xl',
  /** Small uppercase label above a major block. */
  docSectionLabel: 'mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--app-header-text)]',
  /** Two-column doc layout; `xl` avoids cramped paired columns beside the guide sidebar on laptop widths. */
  docGridTwoCol:
    'mb-10 grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start xl:gap-x-10 xl:gap-y-0 [&>*:nth-child(2)]:max-xl:border-t [&>*:nth-child(2)]:max-xl:border-[var(--app-header-border)] [&>*:nth-child(2)]:max-xl:pt-8',
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
  codeInline: 'font-mono text-[0.92em] text-[var(--nav-brand-text)]',
  codeBadge:
    'inline-flex max-w-full items-center rounded-md bg-[var(--nav-link-active-bg)] px-1.5 py-0.5 font-mono text-[11px] font-semibold leading-5 text-[var(--nav-brand-text)]',
  preBox: 'rounded-lg border border-[var(--app-header-border)] bg-[var(--background)] p-3 text-[11px] font-mono text-[var(--foreground)] whitespace-pre-wrap break-all',
  card: 'rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] p-4 shadow-sm',
  cardMuted: 'rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] p-4 shadow-sm',
  iconBox: 'flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] text-[var(--nav-brand-text)]',
  /** Two-column responsive grid (no vertical outer margin). */
  gridTwoCol: 'grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2',
  listDecimal: 'list-decimal list-inside space-y-1 text-sm text-[var(--app-header-text)]',
  listDisc: 'list-disc list-inside space-y-1 text-xs text-[var(--app-header-text)]',
  pillRequired: 'inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[11px] font-medium leading-5 text-red-700 dark:bg-red-950/45 dark:text-red-300',
  pillOptional: 'inline-flex items-center rounded-md bg-[var(--nav-link-active-bg)] px-1.5 py-0.5 text-[11px] font-medium leading-5 text-[var(--app-header-text)]',
  calloutInfo: 'rounded-xl border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] p-4',
  calloutWarn: 'rounded-xl border border-amber-200/90 bg-amber-50/95 p-4 dark:border-amber-900/50 dark:bg-amber-950/35',
  calloutWarnTitle: 'text-sm font-semibold text-amber-950 dark:text-amber-100',
  calloutWarnBody: 'text-xs text-amber-900 dark:text-amber-200',
  btnPrimary:
    'inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-[var(--app-primary-fg)] shadow-sm transition-colors hover:bg-[var(--app-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)]',
} as const

/**
 * Sidebar tab button classes for Getting Started navigation (stacked list on mobile and desktop).
 * @param active Whether this tab is selected
 * @returns Tailwind class string for the tab button
 */
export function gettingStartedNavTabClass(active: boolean): string {
  return active
    ? 'w-full rounded-lg bg-[var(--nav-link-active-bg)] px-3 py-2 text-left text-sm font-medium text-[var(--nav-link-active-text)] transition-colors'
    : 'w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--app-header-text)] transition-colors hover:bg-[var(--nav-link-hover-bg)] hover:text-[var(--nav-link-hover-text)]'
}
