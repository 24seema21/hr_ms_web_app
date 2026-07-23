import { useId } from 'react'
import type { InputHTMLAttributes, Ref } from 'react'
import { cn } from '@/shared/lib/cn'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Always required — a placeholder is not a label. */
  label: string
  /** Validation message. Its presence is what puts the field in an error state. */
  error?: string
  /** Optional helper text shown under the input when there is no error. */
  hint?: string
  /**
   * In React 19 `ref` is an ordinary prop on function components — the old
   * `forwardRef` wrapper is gone. This is what lets React Hook Form's
   * `register('email')` spread a ref straight onto our custom component.
   */
  ref?: Ref<HTMLInputElement>
}

export function TextField({
  label,
  error,
  hint,
  id,
  className,
  ref,
  ...rest
}: TextFieldProps) {
  /*
    `useId` produces a stable, collision-free id. We need one because the
    label's `htmlFor` must match the input's `id` — that pairing is what makes
    clicking the label focus the input, and what lets a screen reader announce
    "Email, edit text" instead of just "edit text".

    A hand-written constant id would break the moment two of these render on
    the same page.
  */
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  const hasError = Boolean(error)

  /*
    `aria-describedby` points at whatever text explains the field, so the
    screen reader reads the error out *with* the field instead of leaving a
    sighted-only message on screen. It must be `undefined` (not an empty
    string) when there is nothing to describe.
  */
  const describedBy = hasError ? errorId : hint ? hintId : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
        {label}
      </label>

      <input
        id={inputId}
        ref={ref}
        // `aria-invalid` is the programmatic half of the red border. The colour
        // alone is invisible to a screen reader — and to a colour-blind user.
        aria-invalid={hasError}
        aria-describedby={describedBy}
        className={cn(
          'h-11 w-full rounded-control border bg-white px-3.5 text-sm text-ink-900 transition-colors',
          'placeholder:text-ink-400',
          'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500',
          hasError
            ? 'border-danger-600 focus-visible:outline-danger-600'
            : 'border-ink-300 hover:border-ink-400',
        )}
        {...rest}
      />

      {hasError ? (
        /*
          `role="alert"` makes the message announced the moment it appears,
          rather than only when the user happens to navigate onto it.
        */
        <p id={errorId} role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
