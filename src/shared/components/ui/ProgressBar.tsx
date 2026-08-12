import { cn } from '@/shared/lib/cn'

const toneClasses = {
  brand: 'bg-brand-600',
  accent: 'bg-accent-400',
  success: 'bg-success-600',
  danger: 'bg-danger-600',
} as const

interface ProgressBarProps {
  /** Completed amount, in the same unit as `max`. */
  value: number
  max: number
  /** What this bar is measuring. Required — see the note on labelling below. */
  label: string
  tone?: keyof typeof toneClasses
  /** Text announced instead of a bare percentage, e.g. "6h 45m of 8h 00m". */
  valueText?: string
  className?: string
}

/**
 * A determinate progress bar. MUI's `LinearProgress` equivalent.
 *
 * `role="progressbar"` with the three aria-value attributes is what turns a
 * coloured div into something a screen reader can report. `aria-valuetext`
 * matters more than usual here: "84 percent" is a poor answer to "how much
 * longer today?", while "6h 45m of 8h 00m" is the actual question.
 *
 * The label is a required prop rather than an optional nicety, because a
 * progressbar with no accessible name is announced as "progress bar, 84%" —
 * eighty-four percent of *what* being exactly the information that was needed.
 */
export function ProgressBar({
  value,
  max,
  label,
  tone = 'brand',
  valueText,
  className,
}: ProgressBarProps) {
  /*
    Clamped, not trusted. Overtime is normal — 9h 30m against an 8h day is 119%
    — and a bar that renders past its own track pushes the layout sideways. The
    number stays honest in `aria-valuetext` and in the text beside the bar;
    only the drawing is capped.
  */
  const safeMax = max > 0 ? max : 1
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={Math.round(value)}
      aria-valuetext={valueText}
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-ink-200',
        className,
      )}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', toneClasses[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
