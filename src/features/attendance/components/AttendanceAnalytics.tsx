import { StatTile } from '@/shared/components/ui/StatTile'
import {
  AlertIcon,
  CalendarIcon,
  ChartIcon,
  CheckIcon,
  ClockIcon,
} from '@/shared/components/ui/icons'
import { formatDuration } from '../lib/duration'
import type { MonthSummary } from '../lib/monthSummary'

interface AttendanceAnalyticsProps {
  summary: MonthSummary
  /** "August 2026", for the captions. */
  monthLabel: string
}

/**
 * The month in four numbers, with a second row for the ones people ask about
 * afterwards.
 *
 * Deliberately not charts. Four figures do not need four donuts, and a
 * doughnut showing "20 of 22" is a worse answer than "20 of 22". A single
 * sparkline of daily hours would earn its place once there is a year of data
 * to make a shape out of; four decorative circles never would.
 */
export function AttendanceAnalytics({
  summary,
  monthLabel,
}: AttendanceAnalyticsProps) {
  const {
    presentDays,
    workingDays,
    attendancePercent,
    absentDays,
    leaveDays,
    holidayDays,
    totalWorkedMinutes,
    averageWorkedMinutes,
    pendingRegularizations,
  } = summary

  /* Half days count as 0.5 and are shown as such — rounding 20.5 up to 21 is
     how payroll disputes start. */
  const presentLabel = Number.isInteger(presentDays)
    ? String(presentDays)
    : presentDays.toFixed(1)

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Present"
          value={`${presentLabel} days`}
          caption={`of ${workingDays} working days in ${monthLabel}`}
          tone="success"
          icon={<CheckIcon className="h-4 w-4" />}
        />
        <StatTile
          label="Attendance"
          value={`${attendancePercent}%`}
          // The denominator, stated. A bare percentage invites exactly one
          // question, and holidays and approved leave are why the answer
          // surprises people.
          caption="present ÷ working days, excluding leave and holidays"
          tone="brand"
          icon={<ChartIcon className="h-4 w-4" />}
        />
        <StatTile
          label="Absent"
          value={`${absentDays} ${absentDays === 1 ? 'day' : 'days'}`}
          caption={
            pendingRegularizations > 0
              ? `${pendingRegularizations} awaiting approval`
              : 'not regularised'
          }
          tone={absentDays > 0 ? 'danger' : 'neutral'}
          icon={<AlertIcon className="h-4 w-4" />}
        />
        <StatTile
          label="Leave"
          value={`${leaveDays} ${leaveDays === 1 ? 'day' : 'days'}`}
          caption={`plus ${holidayDays} ${holidayDays === 1 ? 'holiday' : 'holidays'}`}
          tone="accent"
          icon={<CalendarIcon className="h-4 w-4" />}
        />
      </div>

      {/*
        The second row is smaller and quieter on purpose: these are the numbers
        people look up occasionally, and giving them the same weight as
        attendance percentage would make the whole row read as undifferentiated
        data rather than as an answer.
      */}
      <dl className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-card border border-ink-200 bg-white px-5 py-4 shadow-card">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-ink-400" />
          <dt className="text-sm text-ink-600">Total worked</dt>
          <dd className="text-sm font-semibold tabular-nums text-ink-900">
            {formatDuration(totalWorkedMinutes)}
          </dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="text-sm text-ink-600">Average day</dt>
          <dd className="text-sm font-semibold tabular-nums text-ink-900">
            {formatDuration(averageWorkedMinutes)}
          </dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="text-sm text-ink-600">Regularisations</dt>
          <dd className="text-sm font-semibold tabular-nums text-ink-900">
            {pendingRegularizations} pending
          </dd>
        </div>
      </dl>
    </div>
  )
}
