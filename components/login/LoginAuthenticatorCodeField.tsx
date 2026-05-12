'use client'

import { loginFormControlBaseClass, loginFormFieldLabelClass } from '@/components/login/login-form-classes'

export interface LoginAuthenticatorCodeFieldProps {
  /** Input id (used with label `htmlFor`) */
  id: string
  /** Current six-digit value */
  value: string
  /** Called when the value changes */
  onChange: (value: string) => void
  /** Visible label text */
  label?: string
  /** When true, the uppercase label row is omitted (e.g. page already has a title). */
  hideLabel?: boolean
  /** Placeholder shown when empty */
  placeholder?: string
  /** When true, HTML5 validation requires six digits */
  required?: boolean
  /** When true, the control is non-interactive */
  disabled?: boolean
  /** Optional `title` for validation tooltip / a11y */
  inputTitle?: string
  /** Extra classes on the outer field wrapper */
  className?: string
}

/**
 * Authenticator (TOTP) code field with label and monospace digit spacing for login flows.
 * @param props Field configuration
 * @returns Labeled numeric input for a 6-digit code
 */
export function LoginAuthenticatorCodeField(props: LoginAuthenticatorCodeFieldProps) {
  const {
    id,
    value,
    onChange,
    label = 'Authenticator code',
    hideLabel = false,
    placeholder = '000000',
    required = true,
    disabled = false,
    inputTitle = 'Enter the 6-digit code from your authenticator app',
    className = '',
  } = props

  return (
    <div className={[hideLabel ? null : 'space-y-1.5', className].filter(Boolean).join(' ')}>
      {hideLabel ? null : (
        <label htmlFor={id} className={loginFormFieldLabelClass}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`${loginFormControlBaseClass} px-3 text-center font-mono text-base tracking-[0.5em]`}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={6}
        pattern="\d{6}"
        required={required}
        disabled={disabled}
        title={inputTitle}
      />
    </div>
  )
}
