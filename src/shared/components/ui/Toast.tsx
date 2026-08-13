import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/cn'
import { IconButton } from './IconButton'
import { CheckIcon, CloseIcon, AlertIcon } from './icons'

interface ToastProps {
  message: string
  onDismiss: () => void
  tone?: 'success' | 'danger'
  /** Milliseconds before it dismisses itself. */
  duration?: number
}

/*
  Long enough to read a sentence twice, short enough not to sit in the corner
  of the screen for the rest of the session. The WCAG guidance is that
  auto-dismissing content is only acceptable when nothing is lost by missing
  it — which is exactly why a toast may only ever *confirm* something that has
  already happened, and never carry the only copy of information the user
  needs.
*/
const DEFAULT_DURATION = 6000

/**
 * Confirmation of something that already happened, out of the way of the work.
 *
 * The alternative — a banner pushed in above the table — moves every row down
 * the moment a save succeeds, so the row you were about to click is somewhere
 * else. A toast reports the same news without touching the layout.
 *
 * `role="status"` is an implicit polite live region: a screen reader announces
 * it when it appears, without interrupting whatever it is reading. A sighted
 * user gets the same confirmation from the panel; without the role, they would
 * be the only ones who did.
 */
export function Toast({
  message,
  onDismiss,
  tone = 'success',
  duration = DEFAULT_DURATION,
}: ToastProps) {
  /*
    Same ref trick as the dialogs: the parent passes an inline arrow, so
    depending on `onDismiss` directly would restart the countdown on every
    parent render — and a toast whose timer keeps resetting never leaves.
  */
  const onDismissRef = useRef(onDismiss)
  useEffect(() => {
    onDismissRef.current = onDismiss
  })

  useEffect(() => {
    const timer = window.setTimeout(() => onDismissRef.current(), duration)
    return () => window.clearTimeout(timer)
  }, [duration])

  const isDanger = tone === 'danger'

  return createPortal(
    /*
      `pointer-events-none` on the positioning layer, re-enabled on the panel:
      without it this fixed container would sit across the bottom of the screen
      swallowing clicks aimed at the table underneath.
    */
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex justify-center p-4 sm:justify-end sm:p-6">
      <div
        role="status"
        className={cn(
          'animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3',
          'rounded-card border bg-surface px-4 py-3 shadow-pop',
          isDanger ? 'border-danger-200' : 'border-ink-200',
        )}
      >
        <span
          className={cn(
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
            isDanger
              ? 'bg-danger-50 text-danger-600'
              : 'bg-success-50 text-success-600',
          )}
          aria-hidden="true"
        >
          {isDanger ? (
            <AlertIcon className="h-4 w-4" />
          ) : (
            <CheckIcon className="h-4 w-4" />
          )}
        </span>

        <p className="flex-1 pt-0.5 text-sm text-ink-800">{message}</p>

        <IconButton
          label="Dismiss notification"
          icon={<CloseIcon className="h-4 w-4" />}
          size="sm"
          onClick={onDismiss}
          className="-mt-0.5 -mr-1.5"
        />
      </div>
    </div>,
    document.body,
  )
}
