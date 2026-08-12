import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { BuildingIcon, HomeIcon } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'
import { primaryActionFor } from '../lib/attendanceState'
import { formatClockTime, formatDuration } from '../lib/duration'
import { STATE_PRESENTATION } from '../lib/statePresentation'
import { firstCheckInOf, lastCheckOutOf, totalsForDay } from '../lib/workedMinutes'
import { parseWorkDate } from '../lib/workDate'
import type { AttendanceDay, AttendanceMode } from '../types'

interface AttendanceDayTableProps {
  days: AttendanceDay[]
  /** The table's accessible name, e.g. "This week" or "August 2026". */
  caption: string
  /** Highlights today's row. */
  todayWorkDate: string
  now: Date
  onView: (day: AttendanceDay) => void
  onRegularize: (day: AttendanceDay) => void
}

/*
  One component for the weekly log and the monthly history.

  They show the same eight facts about a day and differ only in how many rows
  they have, so two components would be two places to fix every future column.
  The caption is what tells them apart to a screen reader.
*/

const weekdayFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  timeZone: 'UTC',
})
const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
})

/**
 * The day's mode, or `'mixed'` when it had more than one.
 *
 * Reading `sessions[0].mode` was wrong in the most ordinary case there is: a
 * morning in the office and an afternoon at home reported "Office", which is
 * half true and therefore worse than saying nothing. Mode is recorded per
 * session precisely so this can be answered honestly, and a day-level summary
 * has to admit when there is no single answer.
 */
function modeOf(day: AttendanceDay): AttendanceMode | 'mixed' | null {
  if (day.sessions.length === 0) return null

  const first = day.sessions[0].mode
  return day.sessions.every((session) => session.mode === first) ? first : 'mixed'
}

/** The per-row facts, computed once and shared by the table and the cards. */
function rowFacts(day: AttendanceDay, now: Date) {
  const date = parseWorkDate(day.workDate)
  const totals = totalsForDay(day, now)
  const checkIn = firstCheckInOf(day)
  const checkOut = lastCheckOutOf(day)
  const action = primaryActionFor(day.state)
  const mode = modeOf(day)
  const isOffDay =
    day.state === 'weekend' || day.state === 'holiday' || day.state === 'leave'

  return { date, totals, checkIn, checkOut, action, mode, isOffDay }
}

function ModeCell({ mode }: { mode: AttendanceMode | 'mixed' | null }) {
  if (!mode) return <Unset />

  if (mode === 'mixed') {
    // Both icons, because "mixed" without saying mixed *what* is a riddle.
    // The detail drawer breaks it down session by session.
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <BuildingIcon className="h-4 w-4 text-ink-400" />
        <HomeIcon className="h-4 w-4 text-ink-400" />
        Mixed
      </span>
    )
  }

  const Icon = mode === 'office' ? BuildingIcon : HomeIcon
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <Icon className="h-4 w-4 text-ink-400" />
      {mode === 'office' ? 'Office' : 'Remote'}
    </span>
  )
}

function Unset() {
  return (
    <span className="text-ink-300" aria-hidden="true">
      —
    </span>
  )
}

function StateBadge({ day }: { day: AttendanceDay }) {
  const { label } = STATE_PRESENTATION[day.state]

  const tone =
    day.state === 'absent' || day.state === 'regularization_rejected'
      ? 'danger'
      : day.state === 'half_day' || day.state === 'regularization_pending'
        ? 'accent'
        : day.state === 'completed' || day.state === 'regularized'
          ? 'success'
          : day.state === 'working' || day.state === 'leave'
            ? 'brand'
            : 'neutral'

  return <Badge tone={tone}>{label}</Badge>
}

/** The action a row offers, or nothing. Shared by both layouts. */
function RowAction({
  day,
  onView,
  onRegularize,
  className,
}: {
  day: AttendanceDay
  onView: (day: AttendanceDay) => void
  onRegularize: (day: AttendanceDay) => void
  className?: string
}) {
  const action = primaryActionFor(day.state)

  if (action === 'regularize') {
    return (
      <Button
        variant="quiet"
        size="xs"
        className={className}
        onClick={() => onRegularize(day)}
        // Twelve buttons called "Regularise" are useless to anyone navigating
        // by a list of controls. The date is what makes each one distinct.
        aria-label={`Regularise ${dateFormatter.format(parseWorkDate(day.workDate))}`}
      >
        Regularise
      </Button>
    )
  }

  if (action === 'none') return null

  return (
    <Button
      variant="ghost"
      size="xs"
      className={className}
      onClick={() => onView(day)}
      aria-label={`View ${dateFormatter.format(parseWorkDate(day.workDate))}`}
    >
      View
    </Button>
  )
}

export function AttendanceDayTable({
  days,
  caption,
  todayWorkDate,
  now,
  onView,
  onRegularize,
}: AttendanceDayTableProps) {
  return (
    <>
      {/* ── Table, from md up ────────────────────────────────────────────── */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>

          <thead className="border-b border-ink-200 bg-ink-50/70">
            <tr>
              {['Day', 'Date', 'Status', 'In', 'Out', 'Worked', 'Mode', 'Action'].map(
                (heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className={cn(
                      'type-label px-4 py-3 whitespace-nowrap text-ink-500',
                      heading === 'Action' && 'text-right',
                    )}
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-ink-100">
            {days.map((day) => {
              const { date, totals, checkIn, checkOut, mode, isOffDay } = rowFacts(
                day,
                now,
              )
              const isToday = day.workDate === todayWorkDate

              return (
                <tr
                  key={day.workDate}
                  className={cn(
                    'transition-colors hover:bg-brand-50/40',
                    isOffDay && 'bg-ink-50/40 text-ink-500',
                  )}
                >
                  <th
                    scope="row"
                    className="px-4 py-3 text-left font-medium whitespace-nowrap text-ink-900"
                  >
                    <span className="flex items-center gap-2">
                      {/*
                        Today's marker: the same marigold rule as the active
                        nav item, so "you are here" looks the same everywhere.
                      */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'h-4 w-1 shrink-0 rounded-full',
                          isToday ? 'bg-accent-400' : 'bg-transparent',
                        )}
                      />
                      {weekdayFormatter.format(date)}
                      {isToday && (
                        <span className="type-label text-accent-600">today</span>
                      )}
                    </span>
                  </th>

                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-ink-600">
                    {dateFormatter.format(date)}
                  </td>

                  <td className="px-4 py-3">
                    <StateBadge day={day} />
                    {day.holidayName && (
                      <span className="ml-2 text-xs text-ink-500">
                        {day.holidayName}
                      </span>
                    )}
                  </td>

                  {isOffDay ? (
                    /*
                      One muted cell instead of five dashes. Nothing was owed on
                      a Sunday, and a row of em-dashes reads as missing data
                      rather than as a day off.
                    */
                    <td colSpan={4} className="px-4 py-3 text-xs text-ink-400">
                      No attendance expected
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-ink-700">
                        {checkIn ? formatClockTime(checkIn) : <Unset />}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-ink-700">
                        {checkOut ? formatClockTime(checkOut) : <Unset />}
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap tabular-nums text-ink-900">
                        {totals.totalMinutes > 0 ? (
                          formatDuration(totals.totalMinutes)
                        ) : (
                          <Unset />
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap text-ink-600">
                        <ModeCell mode={mode} />
                      </td>
                    </>
                  )}

                  <td className="px-4 py-3 text-right">
                    <RowAction
                      day={day}
                      onView={onView}
                      onRegularize={onRegularize}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Cards, below md ──────────────────────────────────────────────── */}
      {/*
        A separate list rather than a table that scrolls sideways. Eight
        columns on a phone is a swipe in each direction to read one row, and
        the horizontal scroll hides exactly the column with the action in it.
        `md:hidden` is `display:none`, so assistive tech sees one of the two,
        never both.
      */}
      <ul className="divide-y divide-ink-100 md:hidden">
        {days.map((day) => {
          const { date, totals, checkIn, checkOut, mode, isOffDay } = rowFacts(
            day,
            now,
          )
          const isToday = day.workDate === todayWorkDate

          return (
            <li key={day.workDate} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 font-medium text-ink-900">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-4 w-1 shrink-0 rounded-full',
                      isToday ? 'bg-accent-400' : 'bg-transparent',
                    )}
                  />
                  {weekdayFormatter.format(date)}
                  <span className="font-mono text-xs text-ink-500">
                    {dateFormatter.format(date)}
                  </span>
                </p>
                <StateBadge day={day} />
              </div>

              {!isOffDay && (
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-3 font-mono text-xs text-ink-600">
                  <span>
                    {checkIn ? formatClockTime(checkIn) : '—'}
                    <span className="mx-1 text-ink-300">→</span>
                    {checkOut ? formatClockTime(checkOut) : '—'}
                  </span>
                  {totals.totalMinutes > 0 && (
                    <span className="font-semibold text-ink-900">
                      {formatDuration(totals.totalMinutes)}
                    </span>
                  )}
                  {mode && <ModeCell mode={mode} />}
                </p>
              )}

              <RowAction
                day={day}
                onView={onView}
                onRegularize={onRegularize}
                className="mt-2 ml-3"
              />
            </li>
          )
        })}
      </ul>
    </>
  )
}
