import { cn } from '@/shared/lib/cn'
import { formatDuration, formatWeekday } from '../lib/leaveDates'
import { WEEK_DAY_PRESENTATION } from '../lib/leavePresentation'
import type { WeekDay } from '../types'

interface WeekBarViewProps {
  week: WeekDay[]
  todayWorkDate: string
}

/*
  Hours worked, day by day, against the hours owed.

  One series against one reference line, so there is no legend and no
  categorical palette to validate — the chart's own heading says what is
  plotted. Days that owed nothing draw no bar at all: a zero-height column on a
  Sunday reads as "worked nothing" when the truth is "nothing was expected",
  and those are very different things to put in front of somebody.
*/

/** The reference line, and the top of the scale unless somebody beat it. */
const STANDARD_MINUTES = 480

const PLOT_CLASS = 'h-40'

export function WeekBarView({ week, todayWorkDate }: WeekBarViewProps) {
  const peak = Math.max(...week.map((day) => day.workedMinutes), STANDARD_MINUTES)
  // Headroom above the tallest column so a 9-hour day is not flush with the
  // top edge, where it reads as clipped.
  const ceiling = Math.ceil((peak * 1.12) / 60) * 60

  return (
    <div>
      <div className="grid grid-cols-[2.25rem_1fr] gap-x-2">
        {/* ── Y axis ─────────────────────────────────────────────────── */}
        <div
          className={cn(PLOT_CLASS, 'flex flex-col justify-between text-right')}
          aria-hidden="true"
        >
          {[ceiling, ceiling / 2, 0].map((tick) => (
            <span
              key={tick}
              className="-translate-y-1.5 font-mono text-[0.625rem] tabular-nums text-ink-400"
            >
              {formatDuration(tick)}
            </span>
          ))}
        </div>

        {/* ── Plot ───────────────────────────────────────────────────── */}
        <div className={cn(PLOT_CLASS, 'relative')}>
          <div
            className="absolute inset-0 flex flex-col justify-between"
            aria-hidden="true"
          >
            {[0, 1, 2].map((line) => (
              <div key={line} className="border-t border-ink-200" />
            ))}
          </div>

          {/*
            The eight-hour mark. Solid, not dashed — dashing reads as
            "projected" or "threshold under discussion" when this is simply the
            standard day. Labelled, because an unexplained line is a puzzle.
          */}
          <div
            className="absolute inset-x-0 border-t border-brand-300"
            style={{ bottom: `${(STANDARD_MINUTES / ceiling) * 100}%` }}
            aria-hidden="true"
          >
            <span className="absolute -top-2 right-0 bg-surface pl-1 font-mono text-[0.625rem] text-brand-600">
              8h
            </span>
          </div>

          <div className="relative flex h-full items-end gap-1 sm:gap-2">
            {week.map((day) => (
              <DayColumn
                key={day.workDate}
                day={day}
                ceiling={ceiling}
                isToday={day.workDate === todayWorkDate}
              />
            ))}
          </div>
        </div>

        {/* ── X axis ─────────────────────────────────────────────────── */}
        <div />
        <div className="mt-2 flex gap-1 sm:gap-2">
          {week.map((day) => (
            <p
              key={day.workDate}
              className={cn(
                'type-label flex-1 text-center',
                day.workDate === todayWorkDate
                  ? 'text-accent-600'
                  : 'text-ink-500',
              )}
            >
              {formatWeekday(day.workDate)}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

function DayColumn({
  day,
  ceiling,
  isToday,
}: {
  day: WeekDay
  ceiling: number
  isToday: boolean
}) {
  const presentation = WEEK_DAY_PRESENTATION[day.kind]

  return (
    <div
      className="flex h-full flex-1 flex-col justify-end"
      // The whole day as one sentence, so a screen reader gets what the
      // picture gives rather than an unlabelled div.
      role="img"
      aria-label={accessibleSummary(day, isToday)}
    >
      {day.workedMinutes > 0 ? (
        <>
          <p className="mb-1 text-center text-[0.625rem] font-semibold tabular-nums text-ink-600">
            {formatDuration(day.workedMinutes)}
          </p>
          <div
            className={cn(
              'mx-auto w-full max-w-6 rounded-t',
              day.kind === 'half_day' ? 'bg-accent-400' : 'bg-brand-500',
            )}
            style={{ height: `${(day.workedMinutes / ceiling) * 100}%` }}
          />
        </>
      ) : (
        /*
          A marker rather than a bar. The word is what carries the meaning —
          a muted stub with no label is indistinguishable from a bad data day.
        */
        <div className="flex flex-col items-center gap-1 pb-0.5">
          <span className="text-center text-[0.625rem] leading-tight text-ink-400">
            {presentation.label}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              'h-1 w-full max-w-6 rounded-full',
              day.kind === 'absent' ? 'bg-danger-600' : 'bg-ink-300',
            )}
          />
        </div>
      )}
    </div>
  )
}

function accessibleSummary(day: WeekDay, isToday: boolean): string {
  const presentation = WEEK_DAY_PRESENTATION[day.kind]
  const weekday = formatWeekday(day.workDate)
  const worked =
    day.workedMinutes > 0 ? `, ${formatDuration(day.workedMinutes)} worked` : ''
  const holiday = day.holidayName ? ` — ${day.holidayName}` : ''

  return `${weekday}${isToday ? ' (today)' : ''}: ${presentation.label}${worked}${holiday}.`
}
