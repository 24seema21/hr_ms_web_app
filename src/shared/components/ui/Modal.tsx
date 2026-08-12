import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { useDialogBehavior } from '@/shared/lib/useDialogBehavior'
import { IconButton } from './IconButton'
import { CloseIcon } from './icons'

interface ModalProps {
  /** Called by Escape, the backdrop, and the close button. */
  onClose: () => void
  title: string
  /** Optional sentence under the title, announced along with it. */
  description?: string
  /** Small mono label above the title — which record, which operation. */
  eyebrow?: string
  children: ReactNode
  /** Pinned to the bottom of the panel, outside the scrolling body. */
  footer?: ReactNode
  className?: string
}

/**
 * A modal dialog: the interruption. Use it when the user must finish or
 * abandon something before the page underneath is useful again — creating a
 * record, confirming a deletion.
 *
 * For *looking at* something without leaving the list, use `Drawer` instead.
 * The distinction is not decoration: a modal blocks, a drawer accompanies, and
 * using the blocking one to show read-only detail is how a directory turns
 * into a series of interruptions.
 *
 * Escape, the focus trap, focus restoration and the scroll lock all come from
 * `useDialogBehavior` — see that file for what each one prevents.
 *
 * There is no `isOpen` prop: the parent opens the dialog by *rendering* it and
 * closes it by not. That is one less piece of state to keep in sync, and it
 * makes a whole category of bug impossible — a form inside a mount-controlled
 * dialog cannot show the previous employee's details for a frame, because the
 * previous form no longer exists.
 */
export function Modal({
  onClose,
  title,
  description,
  eyebrow,
  children,
  footer,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  /*
    `useId` gives the title and description stable ids, which `aria-labelledby`
    and `aria-describedby` point at. That pairing is what makes a screen reader
    announce "Add employee, dialog" on open instead of just "dialog".
  */
  const titleId = useId()
  const descriptionId = useId()

  useDialogBehavior({ panelRef, onClose })

  /*
    Rendered into `document.body` through a portal instead of where it sits in
    the JSX. A dialog is `position: fixed`, and fixed positioning is measured
    against the nearest ancestor with a transform, filter or perspective — so a
    single `hover:scale-105` anywhere up the tree would silently pin the
    "full screen" overlay inside a table cell. The portal removes that whole
    category of bug: the overlay has no ancestors but <body>.

    React keeps the portal in the *component* tree even though it leaves the
    DOM tree, so events still bubble to the parent and context still works.
  */
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
      {/*
        The backdrop is a sibling of the panel, not its parent.

        Nested, a click anywhere inside the dialog would bubble to the backdrop
        and close it — including the click that finishes selecting text in an
        input. Side by side, "clicked the backdrop" means exactly that.

        `aria-hidden` keeps this decorative div out of the accessibility tree;
        Escape is the keyboard equivalent of clicking it.
      */}
      <div
        className="animate-fade-in fixed inset-0 bg-brand-950/45 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        // Focusable as a fallback: if the dialog somehow contains no controls,
        // focus still lands inside it rather than on the page behind.
        tabIndex={-1}
        className={cn(
          'animate-rise-in relative z-10 my-auto flex w-full max-w-lg flex-col',
          'max-h-[calc(100dvh-2rem)] overflow-hidden rounded-panel border border-ink-200 bg-white shadow-pop',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-200 bg-ink-50/60 px-6 py-4">
          <div className="min-w-0">
            {eyebrow && (
              <p className="type-label mb-1.5 text-brand-600">{eyebrow}</p>
            )}
            <h2
              id={titleId}
              className="type-wide text-lg font-semibold tracking-tight text-ink-900"
            >
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-ink-600">
                {description}
              </p>
            )}
          </div>

          <IconButton
            label="Close dialog"
            icon={<CloseIcon className="h-5 w-5" />}
            onClick={onClose}
            className="-mt-1 -mr-2"
          />
        </div>

        {/*
          The body scrolls, the header and footer do not.

          On a laptop at 100% zoom the employee form is taller than the
          viewport. Scrolling the whole dialog would push Save off the bottom
          of the screen with no indication it is there; scrolling only the
          middle keeps the way out permanently visible.
        */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="border-t border-ink-200 bg-ink-50/60 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
