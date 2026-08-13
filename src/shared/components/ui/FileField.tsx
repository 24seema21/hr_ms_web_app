import { useId, useState } from 'react'
import type { DragEvent } from 'react'
import { cn } from '@/shared/lib/cn'
import { formatFileSize } from '@/shared/lib/formatFileSize'
import { IconButton } from './IconButton'
import { CloseIcon, PaperclipIcon, UploadIcon } from './icons'

interface FileFieldProps {
  /** Always required — see TextField. */
  label: string
  /** The chosen file, owned by the caller. `null` when nothing is attached. */
  value: File | null
  onChange: (file: File | null) => void
  /** Validation message. Its presence is what puts the field in an error state. */
  error?: string
  /** What is acceptable, in words. Shown when there is no error. */
  hint?: string
  /** The picker's filter — a hint to the OS dialog, never a validation rule. */
  accept?: string
  disabled?: boolean
  className?: string
}

/**
 * A single-file attachment field: TextField's sibling for documents.
 *
 * The control is a real `<input type="file">`, visually hidden and driven by
 * its own `<label>`. That is what keeps it keyboard-operable, announced as
 * "Attachment, button" by a screen reader, and able to open the native picker
 * on a phone. A div with an `onClick` that calls `.click()` on a hidden input
 * is the usual version of this component and it is unreachable by keyboard.
 *
 * Drag-and-drop is added on top of that, never instead of it: dropping is a
 * convenience for people with a pointer and a file manager, and it is the one
 * interaction that cannot be the only way in.
 *
 * Validation lives with the rest of the form's rules (size, type, whether one
 * is required at all) rather than in here — this component reports what it is
 * told to report, so the schema stays the single source of truth.
 */
export function FileField({
  label,
  value,
  onChange,
  error,
  hint,
  accept,
  disabled = false,
  className,
}: FileFieldProps) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const hasError = Boolean(error)
  const describedBy = hasError ? errorId : hint ? hintId : undefined

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDraggingOver(false)
    if (disabled) return

    // Only ever the first: the input is single-file, and silently taking one
    // of three dropped files without saying so is worse than taking none.
    const [file] = Array.from(event.dataTransfer.files)
    if (file) onChange(file)
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-sm font-medium text-ink-700">{label}</span>

      {value ? (
        /*
          Once something is attached the dropzone is replaced rather than
          decorated. A zone that still says "drop a file here" under a file
          that is already there invites people to wonder whether the first one
          took.
        */
        <div
          className={cn(
            'flex items-center gap-3 rounded-control border bg-surface px-3.5 py-3',
            hasError ? 'border-danger-600' : 'border-ink-300',
          )}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-600"
            aria-hidden="true"
          >
            <PaperclipIcon className="h-4 w-4" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink-900">
              {value.name}
            </span>
            <span className="type-label block text-ink-400">
              {formatFileSize(value.size)}
            </span>
          </span>

          <IconButton
            label={`Remove ${value.name}`}
            icon={<CloseIcon className="h-4 w-4" />}
            size="sm"
            disabled={disabled}
            onClick={() => onChange(null)}
          />
        </div>
      ) : (
        <>
          {/*
            `peer` on the input and `peer-focus-visible:` on the label is what
            moves the focus ring onto the thing that is actually visible. The
            input is `sr-only` rather than `hidden` or `display:none` — the
            latter two remove it from the tab order entirely.
          */}
          <input
            id={inputId}
            type="file"
            accept={accept}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className="peer sr-only"
            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          />

          <label
            htmlFor={inputId}
            onDragOver={(event) => {
              event.preventDefault()
              if (!disabled) setIsDraggingOver(true)
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-1 rounded-control border border-dashed px-4 py-5 text-center',
              'transition-[border-color,background-color] duration-150',
              'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600',
              disabled && 'cursor-not-allowed bg-ink-50 opacity-60',
              hasError
                ? 'border-danger-600 bg-danger-50/40'
                : isDraggingOver
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-ink-300 bg-ink-50/40 hover:border-ink-400 hover:bg-ink-50',
            )}
          >
            <UploadIcon className="h-5 w-5 text-ink-400" />
            <span className="text-sm font-medium text-ink-800">
              Choose a file
              <span className="hidden font-normal text-ink-500 sm:inline">
                {' '}
                or drop one here
              </span>
            </span>
          </label>
        </>
      )}

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
