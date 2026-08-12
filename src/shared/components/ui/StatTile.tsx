import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

const toneClasses = {
  neutral: 'bg-ink-50 text-ink-600',
  brand: 'bg-brand-50 text-brand-600',
  accent: 'bg-accent-50 text-accent-600',
  danger: 'bg-danger-50 text-danger-600',
  success: 'bg-success-50 text-success-600',
} as const

interface StatTileProps {
  label: string
  /** The figure itself. A string so "91%" and "20.5" are equally at home. */
  value: string
  /**
   * The denominator, in words: "of 22 working days".
   *
   * Required, because a bare "91%" invites exactly one question and a tooltip
   * nobody opens is not an answer. Every number on an HR dashboard ends up in
   * a conversation with someone who computes it differently.
   */
  caption: string
  icon?: ReactNode
  tone?: keyof typeof toneClasses
}

/** One number, its name, and what it is a number *of*. */
export function StatTile({
  label,
  value,
  caption,
  icon,
  tone = 'neutral',
}: StatTileProps) {
  return (
    <div className="rounded-card border border-ink-200 bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="type-label text-ink-500">{label}</p>
        {icon && (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-control',
              toneClasses[tone],
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      <p className="type-wide mt-3 text-3xl font-bold tracking-tight tabular-nums text-ink-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-ink-500">{caption}</p>
    </div>
  )
}
