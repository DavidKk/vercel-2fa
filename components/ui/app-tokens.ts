/**
 * Shared Signet UI class tokens.
 * These mirror AppHeader's monochrome semantic CSS variables so feature pages
 * stay visually aligned in light and dark modes.
 */
export const appUi = {
  pageShell: 'flex min-h-[calc(100dvh-var(--header-height))] flex-1 flex-col items-center justify-center bg-[var(--nav-link-hover-bg)] px-4 py-8 sm:px-6 sm:py-10',
  pageShellTop: 'flex min-h-[calc(100dvh-var(--header-height))] flex-1 flex-col items-stretch justify-start bg-[var(--nav-link-hover-bg)] px-4 py-8 sm:px-6 sm:py-10',
  card: 'rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] p-6 shadow-sm sm:p-8',
  cardCompact: 'rounded-xl border border-[var(--app-header-border)] bg-[var(--app-header-bg)] p-5 shadow-sm sm:p-6',
  cardMuted: 'rounded-xl border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] p-5 sm:p-6',
  iconBox: 'flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] text-[var(--nav-brand-text)]',
  sectionLabel: 'text-xs font-semibold uppercase tracking-wider text-[var(--app-header-text)]',
  pageTitle: 'text-xl font-semibold tracking-tight text-[var(--nav-brand-text)] sm:text-2xl',
  panelTitle: 'text-base font-semibold tracking-tight text-[var(--nav-brand-text)]',
  lead: 'text-sm leading-relaxed text-[var(--app-header-text)]',
  muted: 'text-xs leading-relaxed text-[var(--app-header-text)]',
  fieldLabel: 'text-xs font-medium uppercase tracking-wide text-[var(--app-header-text)]',
  control:
    'w-full rounded-lg border border-[var(--app-header-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] shadow-sm placeholder:text-[var(--nav-icon-muted)] outline-none transition-colors duration-150 focus-visible:border-[var(--app-header-focus)] focus-visible:ring-2 focus-visible:ring-[var(--app-header-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-header-bg)] disabled:cursor-not-allowed disabled:opacity-50',
  btnPrimary:
    'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--app-primary-fg)] shadow-sm transition-colors duration-150 hover:bg-[var(--app-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] disabled:cursor-not-allowed disabled:opacity-50',
  btnSecondary:
    'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--app-header-border)] bg-[var(--app-header-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--nav-brand-text)] shadow-sm transition-colors duration-150 hover:bg-[var(--nav-link-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] disabled:cursor-not-allowed disabled:opacity-50',
  codeInline: 'rounded border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] px-1.5 py-0.5 font-mono text-xs text-[var(--foreground)]',
  codeBlock: 'max-h-64 overflow-auto rounded-lg border border-[var(--app-header-border)] bg-[var(--background)] p-3 font-mono text-xs leading-relaxed text-[var(--foreground)]',
  badge:
    'inline-flex items-center rounded border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] px-2 py-0.5 text-[10px] font-medium uppercase leading-none text-[var(--app-header-text)]',
  badgeSuccess:
    'inline-flex items-center rounded border border-emerald-200 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase leading-none text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-300',
  badgeDanger:
    'inline-flex items-center rounded border border-red-200 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium uppercase leading-none text-red-800 dark:border-red-900/60 dark:text-red-300',
  calloutInfo: 'rounded-xl border border-[var(--app-header-border)] bg-[var(--nav-link-hover-bg)] p-4',
  calloutWarn: 'rounded-xl border border-amber-200/90 bg-amber-50/95 p-4 dark:border-amber-900/50 dark:bg-amber-950/35',
  warnTitle: 'text-sm font-semibold text-amber-950 dark:text-amber-100',
  warnBody: 'text-xs leading-relaxed text-amber-900 dark:text-amber-200',
} as const
