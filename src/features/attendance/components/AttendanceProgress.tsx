import { ProgressBar } from '@/shared/components/ui/ProgressBar'
import { formatDuration, spellDuration } from '../lib/duration'
import { LiveDuration } from './LiveDuration'
import type { WorkedTotals } from '../lib/workedMinutes'

interface AttendanceProgressProps {
  totals: WorkedTotals
  requiredMinutes: number
}

/**
 * Worked against required: the number, the bar, and what is left.
 *
 * The bar is the glance and the figures are the answer — a bar on its own
 * makes "how much longer?" a matter of estimating pixels.
 */
export function AttendanceProgress({
  totals,
  requiredMinutes,
}: AttendanceProgressProps) {
  const { totalMinutes, remainingMinutes, overtimeMinutes, openSession } = totals

  const isOvertime = overtimeMinutes > 0

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-ink-900">
          {/*
            The one number people came for, set large. While a session is open
            it ticks; once the day is closed it is plain text, because a
            component that re-renders every second for a value that cannot
            change is pure waste.
          */}
          <span className="type-wide text-3xl font-bold tracking-tight">
            {openSession ? (
              <LiveDuration
                from={openSession.checkInAt}
                baseMinutes={totalMinutes - (totals.currentMinutes ?? 0)}
                running
              />
            ) : (
              <span className="tabular-nums">{formatDuration(totalMinutes)}</span>
            )}
          </span>{' '}
          <span className="text-sm font-medium text-ink-500">
            of {formatDuration(requiredMinutes)}
          </span>
        </p>

        {/*
          Not `type-label`: upper-casing a duration turns "1h 43m left" into
          "1H 43M LEFT", where the unit letters shout as loudly as the numbers
          and the whole thing stops being readable at a glance. The mono voice
          is for column headings, not for figures people are reading.
        */}
        <p className="shrink-0 text-sm font-medium tabular-nums text-ink-500">
          {isOvertime
            ? `+${formatDuration(overtimeMinutes)} over`
            : `${formatDuration(remainingMinutes)} left`}
        </p>
      </div>

      <ProgressBar
        className="mt-3"
        value={totalMinutes}
        max={requiredMinutes}
        // Marigold once the day is met: the same "this cell is marked"
        // language the register uses everywhere else in the product.
        tone={isOvertime || remainingMinutes === 0 ? 'accent' : 'brand'}
        label="Hours worked today"
        valueText={`${spellDuration(totalMinutes)} of ${spellDuration(requiredMinutes)}`}
      />
    </div>
  )
}
