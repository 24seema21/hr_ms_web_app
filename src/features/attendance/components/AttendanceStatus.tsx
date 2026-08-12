import { cn } from '@/shared/lib/cn'
import { STATE_PRESENTATION } from '../lib/statePresentation'
import type { DayState } from '../types'

interface AttendanceStatusProps {
  state: DayState
  className?: string
}

/**
 * Dot plus word — the first thing the eye should land on in the card.
 *
 * The words and colours live in `lib/statePresentation.ts` so that the weekly
 * table and the history rows say exactly the same thing about a state as this
 * does.
 */
export function AttendanceStatus({ state, className }: AttendanceStatusProps) {
  const { label, dot, text, pulse } = STATE_PRESENTATION[state]

  return (
    <p
      className={cn(
        'flex items-center gap-2.5 text-base font-semibold',
        text,
        className,
      )}
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        {pulse && (
          // `animate-ping` is switched off wholesale by the reduced-motion
          // block in index.css, and the solid dot underneath still reads.
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
        )}
        <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', dot)} />
      </span>
      {label}
    </p>
  )
}
