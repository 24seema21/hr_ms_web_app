import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from '@/shared/lib/cn'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Always required — a placeholder is not a label. */
  label: string
  /**
   * Hides the label visually while keeping it in the accessibility tree.
   *
   * For the one case where the surrounding UI already makes the field obvious
   * (a search box under a magnifier icon in a toolbar) and a stacked label
   * would cost a row of vertical space in dense chrome. The label itself is
   * never dropped: `getByLabelText('Search')` must keep working, for the
   * screen reader as much as for the test.
   */
  hideLabel?: boolean
  /** Validation message. Its presence is what puts the field in an error state. */
  error?: string
  /** Optional helper text shown under the input when there is no error. */
  hint?: string
  /** A decorative glyph inside the field's leading edge. */
  leadingIcon?: ReactNode
  /** A control inside the trailing edge — a clear button, a unit, a counter. */
  trailing?: ReactNode
  /** `sm` for toolbars and filters, `md` for forms. */
  fieldSize?: 'sm' | 'md'
  /**
   * In React 19 `ref` is an ordinary prop on function components — the old
   * `forwardRef` wrapper is gone. This is what lets React Hook Form's
   * `register('email')` spread a ref straight onto our custom component.
   */
  ref?: Ref<HTMLInputElement>
}

export function TextField({
  label,
  hideLabel = false,
  error,
  hint,
  leadingIcon,
  trailing,
  fieldSize = 'md',
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
      <label
        htmlFor={inputId}
        className={cn(
          'text-sm font-medium text-ink-700',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>

      {/*
        The icons sit in a wrapper rather than inside the input (impossible) or
        absolutely positioned over the page (fragile). `focus-within` moves the
        focus styling to the wrapper so the whole field reacts as one object.
      */}
      <div className="relative flex items-center">
        {leadingIcon && (
          <span
            className="pointer-events-none absolute left-3 flex text-ink-400"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        )}

        <input
          id={inputId}
          ref={ref}
          // `aria-invalid` is the programmatic half of the red border. The colour
          // alone is invisible to a screen reader — and to a colour-blind user.
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={cn(
            'w-full rounded-control border bg-white text-sm text-ink-900',
            'transition-[border-color,box-shadow] duration-150',
            'placeholder:text-ink-400',
            'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500',
            fieldSize === 'sm' ? 'h-10 px-3' : 'h-11 px-3.5',
            // `Boolean(...)`, not `leadingIcon &&`: a ReactNode can legally be
            // the number 0, and `0 && 'pl-10'` evaluates to 0 — which `cn`
            // would then have to accept as a class name.
            Boolean(leadingIcon) && 'pl-10',
            Boolean(trailing) && 'pr-10',
            hasError
              ? 'border-danger-600 focus-visible:outline-danger-600'
              : 'border-ink-300 hover:border-ink-400',
          )}
          {...rest}
        />

        {trailing && (
          <span className="absolute right-1.5 flex items-center">{trailing}</span>
        )}
      </div>

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
