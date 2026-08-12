import { useId } from 'react'
import type { Ref, TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Always required — a placeholder is not a label. */
  label: string
  error?: string
  hint?: string
  ref?: Ref<HTMLTextAreaElement>
}

/** TextField's sibling for prose: reasons, notes, anything with sentences. */
export function TextareaField({
  label,
  error,
  hint,
  id,
  className,
  rows = 3,
  ref,
  ...rest
}: TextareaFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const errorId = `${fieldId}-error`
  const hintId = `${fieldId}-hint`

  const hasError = Boolean(error)
  const describedBy = hasError ? errorId : hint ? hintId : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className="text-sm font-medium text-ink-700">
        {label}
      </label>

      <textarea
        id={fieldId}
        ref={ref}
        rows={rows}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        className={cn(
          'w-full rounded-control border bg-white px-3.5 py-2.5 text-sm text-ink-900',
          'transition-[border-color] duration-150 placeholder:text-ink-400',
          // Vertical only: a textarea that can be dragged wider breaks the
          // dialog's layout, and nobody has ever wanted that handle.
          'resize-y',
          'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500',
          hasError
            ? 'border-danger-600 focus-visible:outline-danger-600'
            : 'border-ink-300 hover:border-ink-400',
        )}
        {...rest}
      />

      {hasError ? (
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
