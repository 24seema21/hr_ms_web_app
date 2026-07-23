import type { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'
import { buttonClasses } from './buttonStyles'
import type { ButtonSize, ButtonVariant } from './buttonStyles'

/*
  Extending `ButtonHTMLAttributes<HTMLButtonElement>` means every native button
  prop — onClick, disabled, type, form, aria-* — keeps working exactly as
  expected. We are adding to the platform, not replacing it.
*/
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

/** A real `<button>`: use it for actions. For navigation use `ButtonLink`. */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  // Buttons inside a <form> default to type="submit", which causes surprise
  // submissions. Defaulting to "button" makes submitting deliberate.
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      // A loading button must also be un-clickable or a double submit slips
      // through. `??` keeps an explicitly passed `disabled` authoritative.
      disabled={disabled ?? isLoading}
      // Tells assistive tech the control is mid-operation.
      aria-busy={isLoading}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  )
}
