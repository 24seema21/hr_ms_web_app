import { useId } from 'react'
import type { ReactNode, Ref, SelectHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import { ChevronDownIcon } from './icons'

export interface SelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Always required — a placeholder option is not a label. */
  label: string
  /** Hides the label visually, keeping it for screen readers. See TextField. */
  hideLabel?: boolean
  /** Validation message. Its presence is what puts the field in an error state. */
  error?: string
  /** `sm` for toolbars and filters, `md` for forms. */
  fieldSize?: 'sm' | 'md'
  /** The `<option>` elements. Passed as children so the caller owns the list. */
  children: ReactNode
  /** React 19 treats `ref` as an ordinary prop, which is how RHF attaches. */
  ref?: Ref<HTMLSelectElement>
}

/**
 * TextField's sibling for a fixed set of choices.
 *
 * A real `<select>` rather than a custom dropdown built from divs: it is
 * keyboard-operable, screen-reader-announced and, on a phone, opens the native
 * picker — all for free. A hand-rolled listbox has to reimplement every bit of
 * that, and almost always reimplements some of it wrongly.
 *
 * The only thing borrowed from the custom-dropdown world is the chevron:
 * `appearance-none` drops the platform arrow, which is the one part of a
 * native select that looks different on every operating system.
 */
export function SelectField({
  label,
  hideLabel = false,
  error,
  fieldSize = 'md',
  id,
  className,
  children,
  ref,
  ...rest
}: SelectFieldProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = `${selectId}-error`

  const hasError = Boolean(error)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={selectId}
        className={cn(
          'text-sm font-medium text-ink-700',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>

      <div className="relative flex items-center">
        <select
          id={selectId}
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(
            'w-full cursor-pointer appearance-none rounded-control border bg-surface pr-9 text-sm text-ink-900',
            'transition-[border-color,box-shadow] duration-150',
            'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500',
            fieldSize === 'sm' ? 'h-10 pl-3' : 'h-11 pl-3.5',
            hasError
              ? 'border-danger-600 focus-visible:outline-danger-600'
              : 'border-ink-300 hover:border-ink-400',
          )}
          {...rest}
        >
          {children}
        </select>

        <ChevronDownIcon className="pointer-events-none absolute right-2.5 h-4 w-4 text-ink-500" />
      </div>

      {hasError && (
        <p id={errorId} role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      )}
    </div>
  )
}
