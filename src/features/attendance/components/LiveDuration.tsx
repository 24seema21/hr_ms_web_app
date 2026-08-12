import { cn } from '@/shared/lib/cn'
import { useTicker } from '../hooks/useTicker'
import { formatDuration, minutesBetween, spellDuration } from '../lib/duration'

interface LiveDurationProps {
  /** When the running stretch began. */
  from: Date
  /**
   * Minutes already banked from *other* sessions, added to the running one.
   * Lets the same component show either "this session" or "today so far".
   */
  baseMinutes?: number
  /** False freezes the value — a finished day must not keep counting. */
  running: boolean
  className?: string
}

/**
 * A duration that counts up, isolated so that only this text re-renders.
 *
 * The isolation is the entire point. Putting the tick in the page's state
 * re-renders the card, the session list, the progress bar and anything else
 * on the screen sixty times a minute, for a component that is three words
 * long. Here the interval lives inside the leaf, and React updates one text
 * node.
 *
 * `aria-hidden` on the visible text, with a stable spoken value beside it: a
 * polite live region that changes every second makes a screen reader
 * unusable — it never stops talking, and it interrupts everything else the
 * user is trying to read. The elapsed time is announced on demand through the
 * label, and *changes of state* (checked in, checked out) are what get
 * announced automatically, by the toast.
 */
export function LiveDuration({
  from,
  baseMinutes = 0,
  running,
  className,
}: LiveDurationProps) {
  const now = useTicker(running)
  const minutes = baseMinutes + minutesBetween(from, now)

  return (
    <span className={cn('tabular-nums', className)}>
      <span aria-hidden="true">{formatDuration(minutes)}</span>
      {/*
        The screen-reader copy is re-read only when the user navigates to it,
        and it is spelled out ("6 hours 45 minutes") because "6h 45m" is
        pronounced "six h forty five m".
      */}
      <span className="sr-only">{spellDuration(minutes)}</span>
    </span>
  )
}
