'use client'

import type { ReactNode } from 'react'

import { loginFormPrimaryButtonClass, loginFormSecondaryButtonClass } from '@/components/login/login-form-classes'
import { Spinner } from '@/components/Spinner'

export interface LoginFormButtonProps {
  /** Filled primary or outline secondary */
  variant: 'primary' | 'secondary'
  /** Native button type */
  type?: 'button' | 'submit'
  /** When true, shows a spinner and loading label instead of children */
  loading?: boolean
  /** Text next to the spinner when `loading` is true */
  loadingLabel?: string
  /** Optional icon before label when not loading */
  leadingIcon?: ReactNode
  /** Visible content when not loading */
  children: ReactNode
  /** When true, the button is inactive */
  disabled?: boolean
  /** Click handler (for `type="button"`) */
  onClick?: () => void
  /** Extra classes merged onto the button */
  className?: string
}

/**
 * Full-width login action button using app theme tokens.
 * @param props Button configuration
 * @returns Themed button element
 */
export function LoginFormButton(props: LoginFormButtonProps) {
  const { variant, type = 'button', loading = false, loadingLabel = 'Loading…', leadingIcon, children, disabled = false, onClick, className = '' } = props

  const base = variant === 'primary' ? loginFormPrimaryButtonClass : loginFormSecondaryButtonClass

  return (
    <button type={type} disabled={disabled || loading} onClick={onClick} className={`${base} ${className}`.trim()}>
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner />
          {loadingLabel}
        </span>
      ) : (
        <>
          {leadingIcon ? <span className="shrink-0 opacity-90 [&>svg]:block">{leadingIcon}</span> : null}
          {children}
        </>
      )}
    </button>
  )
}
