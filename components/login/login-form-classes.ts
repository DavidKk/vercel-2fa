/**
 * Shared label style for compact login form fields (matches app header / monochrome theme).
 */
export const loginFormFieldLabelClass = 'text-xs font-medium uppercase tracking-wide text-[var(--app-header-text)]'

/**
 * Shared shell for login text inputs (border, background, focus ring aligned with header tokens).
 */
export const loginFormControlBaseClass =
  'w-full rounded-lg border border-[var(--app-header-border)] bg-[var(--background)] py-2.5 text-sm text-[var(--foreground)] shadow-sm placeholder:text-[var(--nav-icon-muted)] outline-none transition-colors duration-150 focus-visible:border-[var(--app-header-focus)] focus-visible:ring-2 focus-visible:ring-[var(--app-header-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-header-bg)] disabled:opacity-50'

/**
 * Leading icon position inside icon-padded login inputs.
 */
export const loginFormLeadingIconClass = 'pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 shrink-0 text-[var(--nav-icon-muted)]'

/**
 * Password visibility toggle (matches login control focus ring).
 */
export const loginFormPasswordToggleButtonClass =
  'absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--nav-icon-muted)] transition-colors duration-150 hover:bg-[var(--nav-link-hover-bg)] hover:text-[var(--nav-brand-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)]'

/**
 * Primary full-width action for login flows.
 */
export const loginFormPrimaryButtonClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--app-primary-fg)] shadow-sm transition-colors duration-150 hover:bg-[var(--app-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] disabled:cursor-not-allowed disabled:opacity-50'

/**
 * Secondary (outline) full-width action for login flows (e.g. WebAuthn).
 */
export const loginFormSecondaryButtonClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--app-header-border)] bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--nav-brand-text)] transition-colors duration-150 hover:bg-[var(--nav-link-hover-bg)] hover:text-[var(--nav-link-hover-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-header-focus)] disabled:cursor-not-allowed disabled:opacity-50'
