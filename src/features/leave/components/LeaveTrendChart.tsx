import { useMemo, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { formatDays } from '../lib/leaveDates'
import { LEAVE_TYPE_PRESENTATION } from '../lib/leavePresentation'
import { LEAVE_TYPES } from '../types'
import type { LeaveMonthTotal } from '../lib/leaveSummary'

interface LeaveTrendChartProps {
  months: LeaveMonthTotal[]
}

/*
  Days taken per month, stacked by type.

  Stacked rather than a plain column of totals because it answers both
  questions the analysis section is asked — "am I taking more leave lately"
  and "what kind" — on one axis. A second chart for the split would put the
  same six months on screen twice.

  Built from divs rather than SVG or a charting library, deliberately. The
  shape is six columns and four segments; an SVG would need its own text
  scaling and a library would need its defaults overridden into this design
  system's tokens before it drew anything. Percentage heights inside a flex
  column are responsive for free, and every label stays real, selectable,
  translatable text.

  Colours come from `LEAVE_TYPE_PRESENTATION` as `var()` tokens. The four steps
  were validated as a categorical set in `LEAVE_TYPES` order — worst adjacent
  pair ΔE 9.2 under deuteranopia, 16.3 under normal vision. Re-order that list
  and those pairs change, so re-run the check if you do.
*/

/** Plot height. Fixed so the columns share a baseline; labels sit outside it. */
const PLOT_CLASS = 'h-44 sm:h-52'

/** Bar thickness cap — the band's leftover width is deliberate air. */
const COLUMN_CLASS = 'mx-auto w-full max-w-6'

export function LeaveTrendChart({ months }: LeaveTrendChartProps) {
  const [showTable, setShowTable] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  /*
    The y-axis ceiling, rounded up to a clean even number so the ticks read
    0 / 4 / 8 rather than 0 / 3.5 / 7. A chart whose top gridline is 6.5 makes
    the reader do arithmetic to place every column.
  */
  const ceiling = useMemo(() => {
    const peak = Math.max(...months.map((month) => month.totalDays), 1)
    return Math.max(2, Math.ceil(peak / 2) * 2)
  }, [months])

  const total = useMemo(
    () => months.reduce((sum, month) => sum + month.totalDays, 0),
    [months],
  )

  const active = activeIndex === null ? null : months[activeIndex]

  return (
    <div className="rounded-card border border-ink-200 bg-surface shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-ink-200 px-5 py-4">
        <div>
          <h3 className="type-wide text-base font-semibold text-ink-900">
            Leave taken by month
          </h3>
          <p className="mt-0.5 text-xs text-ink-500">
            Approved days, last {months.length} months · {formatDays(total)} in
            total
          </p>
        </div>

        {/*
          The table view is not a nicety. It is the WCAG-clean twin of the
          chart, and it is what lets the marigold segment sit below 3:1 on
          white — every value in the picture is reachable as text.
        */}
        <button
          type="button"
          onClick={() => setShowTable((shown) => !shown)}
          aria-pressed={showTable}
          className="cursor-pointer rounded-control px-2 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
        >
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      </div>

      {showTable ? (
        <TrendTable months={months} />
      ) : (
        <div className="px-5 py-5">
          <div className="grid grid-cols-[1.75rem_1fr] gap-x-2">
            {/* ── Y axis ─────────────────────────────────────────────── */}
            <div
              className={cn(
                PLOT_CLASS,
                'flex flex-col justify-between text-right',
              )}
              aria-hidden="true"
            >
              {[ceiling, ceiling / 2, 0].map((tick) => (
                <span
                  key={tick}
                  className="-translate-y-1.5 font-mono text-[0.625rem] tabular-nums text-ink-400"
                >
                  {formatDays(tick)}
                </span>
              ))}
            </div>

            {/* ── Plot ───────────────────────────────────────────────── */}
            <div className={cn(PLOT_CLASS, 'relative')}>
              {/* Hairline gridlines, solid and one step off the surface. */}
              <div
                className="absolute inset-0 flex flex-col justify-between"
                aria-hidden="true"
              >
                {[0, 1, 2].map((line) => (
                  <div key={line} className="border-t border-ink-200" />
                ))}
              </div>

              <div className="relative flex h-full items-end gap-1.5 sm:gap-3">
                {months.map((month, index) => (
                  <MonthColumn
                    key={month.month}
                    month={month}
                    ceiling={ceiling}
                    isActive={activeIndex === index}
                    onActivate={() => setActiveIndex(index)}
                    onDeactivate={() => setActiveIndex(null)}
                  />
                ))}
              </div>

              {active && active.totalDays > 0 && (
                <Tooltip
                  month={active}
                  index={activeIndex as number}
                  count={months.length}
                />
              )}
            </div>

            {/* ── X axis ─────────────────────────────────────────────── */}
            <div />
            <div className="mt-2 flex gap-1.5 sm:gap-3">
              {months.map((month) => (
                <p
                  key={month.month}
                  className="type-label flex-1 text-center text-ink-500"
                >
                  {month.label}
                </p>
              ))}
            </div>
          </div>

          <Legend />
        </div>
      )}
    </div>
  )
}

interface MonthColumnProps {
  month: LeaveMonthTotal
  ceiling: number
  isActive: boolean
  onActivate: () => void
  onDeactivate: () => void
}

function MonthColumn({
  month,
  ceiling,
  isActive,
  onActivate,
  onDeactivate,
}: MonthColumnProps) {
  const segments = month.byType.filter((entry) => entry.days > 0)

  return (
    /*
      The whole slot is the hit target, not just the drawn column — a 24px bar
      three pixels tall in a quiet month would otherwise be unhoverable. It is
      focusable and carries the full breakdown as its accessible name, so a
      keyboard user gets what a hover gives.
    */
    <div
      tabIndex={0}
      role="img"
      aria-label={accessibleSummary(month)}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      className={cn(
        'flex h-full flex-1 cursor-default flex-col justify-end rounded-control transition-colors',
        isActive && 'bg-brand-50/60',
      )}
    >
      {month.totalDays > 0 && (
        <p className="mb-1 text-center text-[0.6875rem] font-semibold tabular-nums text-ink-700">
          {formatDays(month.totalDays)}
        </p>
      )}

      <div
        className={cn(COLUMN_CLASS, 'flex flex-col-reverse gap-0.5')}
        style={{ height: `${(month.totalDays / ceiling) * 100}%` }}
      >
        {/*
          `flex-col-reverse` stacks the first entry at the baseline, so the
          visual order matches `LEAVE_TYPES` from the bottom up — which is the
          order the palette was validated in. `last:` is therefore the topmost
          segment, and it is the only one that gets the 4px rounded data-end;
          the baseline stays square.

          The 2px gap between segments is the separator. A stroke around each
          one would add ink that is not data.
        */}
        {segments.map((entry) => (
          <div
            key={entry.type}
            className="w-full last:rounded-t"
            style={{
              height: `${(entry.days / month.totalDays) * 100}%`,
              background: LEAVE_TYPE_PRESENTATION[entry.type].fill,
            }}
          />
        ))}
      </div>
    </div>
  )
}

/** The hovered month's breakdown, pinned above its column. */
function Tooltip({
  month,
  index,
  count,
}: {
  month: LeaveMonthTotal
  index: number
  count: number
}) {
  const segments = month.byType.filter((entry) => entry.days > 0)

  return (
    <div
      role="presentation"
      className="pointer-events-none absolute bottom-full z-10 mb-2 w-max -translate-x-1/2 rounded-control border border-ink-200 bg-surface px-3 py-2 shadow-pop"
      style={{ left: `${((index + 0.5) / count) * 100}%` }}
    >
      <p className="type-label text-ink-500">{month.label}</p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {segments.map((entry) => (
          <li
            key={entry.type}
            className="flex items-center gap-2 text-xs text-ink-700"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: LEAVE_TYPE_PRESENTATION[entry.type].fill }}
            />
            {LEAVE_TYPE_PRESENTATION[entry.type].label}
            <span className="ml-auto pl-3 font-semibold tabular-nums">
              {formatDays(entry.days)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Legend() {
  return (
    <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-100 pt-3">
      {LEAVE_TYPES.map((type) => (
        <li key={type} className="flex items-center gap-2 text-xs text-ink-600">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: LEAVE_TYPE_PRESENTATION[type].fill }}
          />
          {LEAVE_TYPE_PRESENTATION[type].label}
        </li>
      ))}
    </ul>
  )
}

/** The chart's table twin — every value the picture holds, as text. */
function TrendTable({ months }: { months: LeaveMonthTotal[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        <caption className="sr-only">
          Approved leave days per month, broken down by type
        </caption>
        <thead className="border-b border-ink-200 bg-ink-50/70">
          <tr>
            <th scope="col" className="type-label px-4 py-3 text-ink-500">
              Month
            </th>
            {LEAVE_TYPES.map((type) => (
              <th
                key={type}
                scope="col"
                className="type-label px-4 py-3 text-right text-ink-500"
              >
                {LEAVE_TYPE_PRESENTATION[type].label}
              </th>
            ))}
            <th scope="col" className="type-label px-4 py-3 text-right text-ink-500">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {months.map((month) => (
            <tr key={month.month}>
              <th scope="row" className="px-4 py-2.5 font-medium text-ink-900">
                {month.label}
              </th>
              {month.byType.map((entry) => (
                <td
                  key={entry.type}
                  className="px-4 py-2.5 text-right tabular-nums text-ink-600"
                >
                  {entry.days === 0 ? (
                    <span className="text-ink-300">—</span>
                  ) : (
                    formatDays(entry.days)
                  )}
                </td>
              ))}
              <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink-900">
                {formatDays(month.totalDays)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** The column as one sentence, for `aria-label`. */
function accessibleSummary(month: LeaveMonthTotal): string {
  if (month.totalDays === 0) return `${month.label}: no leave taken.`

  const parts = month.byType
    .filter((entry) => entry.days > 0)
    .map(
      (entry) =>
        `${formatDays(entry.days)} ${LEAVE_TYPE_PRESENTATION[entry.type].label.toLowerCase()}`,
    )

  return `${month.label}: ${formatDays(month.totalDays)} days — ${parts.join(', ')}.`
}
