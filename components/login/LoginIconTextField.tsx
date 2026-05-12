'use client'

import type { ReactNode } from 'react'

import { loginFormControlBaseClass, loginFormFieldLabelClass, loginFormLeadingIconClass } from '@/components/login/login-form-classes'

export interface LoginIconTextFieldProps {
  /** Input id (used with label `htmlFor`) */
  id: string
  /** Visible field label */
  label: string
  /** Current value */
  value: string
  /** Called when the value changes */
  onChange: (value: string) => void
  /** Icon rendered inside the field on the left */
  leadingIcon: ReactNode
  /** Input `type` (default `text`) */
  type?: 'text' | 'email' | 'search'
  /** Shown when empty */
  placeholder?: string
  /** Passed to the input */
  autoComplete?: string
  /** When true, HTML5 validation requires a non-empty value */
  required?: boolean
  /** When true, the control is non-interactive */
  disabled?: boolean
  /** Extra classes on the outer field wrapper */
  className?: string
}

/**
 * Single-line login text field with a leading icon and theme-aligned styling.
 * @param props Field configuration
 * @returns Labeled input with icon slot
 */
export function LoginIconTextField(props: LoginIconTextFieldProps) {
  const { id, label, value, onChange, leadingIcon, type = 'text', placeholder, autoComplete, required = true, disabled = false, className = '' } = props

  return (
    <div className={`space-y-1.5 ${className}`.trim()}>
      <label htmlFor={id} className={loginFormFieldLabelClass}>
        {label}
      </label>
      <div className="relative">
        <span className={`${loginFormLeadingIconClass} flex items-center justify-center [&>svg]:size-[18px]`}>{leadingIcon}</span>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`${loginFormControlBaseClass} pl-10 pr-3`}
        />
      </div>
    </div>
  )
}
