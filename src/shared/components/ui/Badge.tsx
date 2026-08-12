import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/*
  Tones, not colours.

  The prop is `tone="neutral"` rather than `color="grey"` so that the meaning
  survives a rebrand: when the palette changes, "neutral" still means neutral
  and every badge in the product follows. A `color` prop bakes today's palette
  into a hundred call sites.
*/
const toneClasses = {
  neutral: 'border-ink-200 bg-ink-50 text-ink-700',
  brand: 'border-brand-200 bg-brand-50 text-brand-700',
  accent: 'border-accent-200 bg-accent-50 text-accent-700',
  danger: 'border-danger-200 bg-danger-50 text-danger-700',
  success: 'border-success-200 bg-success-50 text-success-700',
} as const

export type BadgeTone = keyof typeof toneClasses

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  /** Renders the label in the register's monospace voice — ids, codes, counts. */
  mono?: boolean
  className?: string
}

/**
 * A small, non-interactive status label.
 *
 * Non-interactive is the point: if it can be clicked it is a button or a
 * filter chip, and it must look like one. A badge that responds to a click
 * teaches people to click every badge.
 */
export function Badge({
  children,
  tone = 'neutral',
  mono = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        mono && 'type-label px-2 py-1',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
