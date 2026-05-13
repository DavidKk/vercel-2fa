'use client'

import { FiCheck } from 'react-icons/fi'

export interface LoginRememberMeCheckboxProps {
  /** Input id for the native checkbox */
  id: string
  /** Whether the option is on */
  checked: boolean
  /** Called when the user toggles the checkbox */
  onChange: (checked: boolean) => void
  /** Visible label text */
  label?: string
  /** When true, the control is non-interactive */
  disabled?: boolean
  /** Extra classes on the root label */
  className?: string
}

/**
 * Monochrome “Remember me” control aligned with app header CSS variables (custom mark, no accent color).
 * @param props Checkbox configuration
 * @returns Accessible labeled checkbox
 */
export function LoginRememberMeCheckbox(props: LoginRememberMeCheckboxProps) {
  const { id, checked, onChange, label = 'Remember me', disabled = false, className = '' } = props

  return (
    <label
      htmlFor={id}
      className={`group flex cursor-pointer select-none items-center gap-2.5 rounded-md text-sm text-[var(--app-header-text)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--app-header-focus)] ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`.trim()}
    >
      <input id={id} type="checkbox" className="sr-only" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span
        aria-hidden
        className={`flex size-[18px] shrink-0 items-center justify-center rounded border transition-colors duration-150 ${
          checked ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]' : 'border-[var(--app-header-border)] bg-[var(--background)]'
        } ${disabled ? '' : 'group-hover:border-[var(--nav-brand-text)]'}`}
      >
        {checked ? <FiCheck className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden /> : null}
      </span>
      <span>{label}</span>
    </label>
  )
}
