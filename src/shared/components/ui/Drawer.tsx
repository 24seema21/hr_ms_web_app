import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { useDialogBehavior } from '@/shared/lib/useDialogBehavior'
import { IconButton } from './IconButton'
import { CloseIcon } from './icons'

interface DrawerProps {
  /** Called by Escape, the scrim, and the close button. */
  onClose: () => void
  title: string
  /** Small mono label above the title — the record type, an id. */
  eyebrow?: string
  children: ReactNode
  /** Pinned to the bottom edge: the actions this record supports. */
  footer?: ReactNode
  className?: string
}

/**
 * A side sheet: detail *beside* the list rather than on top of it.
 *
 * The problem it solves is specific. A directory table can show five columns;
 * an employee record has eleven fields. The usual answers are both bad — cram
 * everything in and the table becomes unreadable at any window width, or open
 * the edit form to read an address and put the user one stray keystroke away
 * from changing data they only wanted to look at.
 *
 * A drawer keeps the list on screen (context, and the scroll position), shows
 * the whole record, and offers editing as a deliberate second step.
 *
 * It is still `role="dialog"` with a focus trap: it overlays the page and
 * Escape closes it, so it must behave like a dialog even though it does not
 * look like one.
 */
export function Drawer({
  onClose,
  title,
  eyebrow,
  children,
  footer,
  className,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useDialogBehavior({ panelRef, onClose })

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="animate-fade-in absolute inset-0 bg-scrim"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'animate-slide-over relative z-10 flex h-dvh w-full max-w-md flex-col',
          'border-l border-ink-200 bg-surface shadow-pop',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-200 px-5 py-4">
          <div className="min-w-0">
            {eyebrow && (
              <p className="type-label mb-1.5 text-brand-600">{eyebrow}</p>
            )}
            <h2
              id={titleId}
              className="type-wide truncate text-lg font-semibold tracking-tight text-ink-900"
            >
              {title}
            </h2>
          </div>

          <IconButton
            label="Close panel"
            icon={<CloseIcon className="h-5 w-5" />}
            onClick={onClose}
            className="-mt-1 -mr-1"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer && (
          <div className="border-t border-ink-200 bg-ink-50/60 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
