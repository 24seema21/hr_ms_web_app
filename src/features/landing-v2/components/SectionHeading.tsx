import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/*
  Every section on the page opens the same way: a tinted eyebrow chip, a large
  narrow-set title, and one paragraph of lead. Extracting it is not just DRY —
  it is what makes seven very different sections read as chapters of one
  document rather than as seven bands bought from seven templates.

  The eyebrow is a filled chip rather than the more usual small-caps line
  because it doubles as the section's colour key: jade for the product story,
  violet for the AI half. By the time a reader reaches the pricing table they
  have learned that the violet sections are the ones about trust.
*/

const toneClasses = {
  jade: 'bg-nx-jade-soft text-nx-jade-ink ring-nx-jade-line',
  violet: 'bg-nx-violet-soft text-nx-violet-ink ring-nx-violet-line',
} as const

interface SectionHeadingProps {
  /** Matched by the section's `aria-labelledby`. */
  headingId: string
  eyebrow: string
  /** ReactNode so a title can carry a gradient span; usually a plain string. */
  title: ReactNode
  lead: string
  tone?: keyof typeof toneClasses
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  headingId,
  eyebrow,
  title,
  lead,
  tone = 'jade',
  align = 'left',
  className,
}: SectionHeadingProps) {
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'max-w-2xl',
        centered && 'mx-auto text-center',
        className,
      )}
    >
      <p
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
          toneClasses[tone],
        )}
      >
        {eyebrow}
      </p>

      {/*
        Every section title is an <h2>. The page has exactly one <h1> (the
        hero), and a screen reader's heading list is only useful as an outline
        if the levels describe the real nesting rather than the type sizes.
      */}
      <h2
        id={headingId}
        className="type-tight mt-5 text-nx-title font-extrabold text-balance text-nx-ink"
      >
        {title}
      </h2>

      <p className="mt-5 text-lg leading-relaxed text-pretty text-nx-muted">
        {lead}
      </p>
    </div>
  )
}
