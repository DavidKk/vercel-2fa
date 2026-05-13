'use client'

import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi'

import { loginFormControlBaseClass, loginFormFieldLabelClass, loginFormLeadingIconClass, loginFormPasswordToggleButtonClass } from '@/components/login/login-form-classes'

export interface LoginPasswordFieldProps {
  /** Input id (used with label `htmlFor`) */
  id: string
  /** Visible field label */
  label: string
  /** Current value */
  value: string
  /** Called when the value changes */
  onChange: (value: string) => void
  /** Whether the password characters are visible */
  showPassword: boolean
  /** Called when the user toggles visibility */
  onToggleShowPassword: () => void
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
 * Password field with lock icon, theme styling, and show/hide toggle.
 * @param props Field configuration
 * @returns Labeled password input with visibility control
 */
export function LoginPasswordField(props: LoginPasswordFieldProps) {
  const {
    id,
    label,
    value,
    onChange,
    showPassword,
    onToggleShowPassword,
    placeholder = '••••••••',
    autoComplete = 'current-password',
    required = true,
    disabled = false,
    className = '',
  } = props

  return (
    <div className={`space-y-1.5 ${className}`.trim()}>
      <label htmlFor={id} className={loginFormFieldLabelClass}>
        {label}
      </label>
      <div className="relative">
        <span className={`${loginFormLeadingIconClass} flex items-center justify-center [&>svg]:size-[18px]`}>
          <FiLock strokeWidth={2} aria-hidden />
        </span>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`${loginFormControlBaseClass} pl-10 pr-11`}
        />
        <button
          type="button"
          className={loginFormPasswordToggleButtonClass}
          onClick={onToggleShowPassword}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          disabled={disabled}
        >
          {showPassword ? <FiEyeOff size={18} strokeWidth={2} aria-hidden /> : <FiEye size={18} strokeWidth={2} aria-hidden />}
        </button>
      </div>
    </div>
  )
}
