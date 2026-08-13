import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface EmptyStateProps {
  /** A decorative glyph. Sized and coloured by this component. */
  icon?: ReactNode
  title: string
  description: string
  /** The way out: usually one button. An empty screen with no action is a wall. */
  action?: ReactNode
  /**
   * `dashed` means "nothing here yet" — the outline reads as a space waiting
   * to be filled. `solid` means "we looked and found nothing", which is a
   * result, not an invitation.
   */
  variant?: 'dashed' | 'solid'
  className?: string
}

/**
 * The state a table is in more often than anyone plans for.
 *
 * Three distinct situations get three distinct messages in this product —
 * nobody added yet, nothing matched the filters, and the load failed — because
 * telling someone their directory is empty when their search was simply too
 * narrow is how people conclude their data has been deleted.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'solid',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-card px-6 py-14 text-center',
        variant === 'dashed'
          ? 'border border-dashed border-ink-300 bg-surface'
          : 'border border-ink-200 bg-surface',
        className,
      )}
    >
      {icon && (
        <span
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-card bg-brand-50 text-brand-600"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      <h2 className="type-wide text-base font-semibold text-ink-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-pretty text-ink-600">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
