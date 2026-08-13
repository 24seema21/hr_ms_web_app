import { formatDayCount, formatDays } from '../lib/leaveDates'
import { LEAVE_TYPE_PRESENTATION } from '../lib/leavePresentation'
import type { LeaveBalance } from '../types'

interface LeaveBalancePanelProps {
  balances: LeaveBalance[]
}

/*
  Entitlement, spent and committed — one row per type.

  Meters rather than the donut this screen was first sketched with, and the
  reason is that a donut answers the wrong question. "How is my leave split by
  type" is idle curiosity; "how many casual days do I have left" is why anyone
  opens this page, and a ring of four slices cannot show a *remainder* against
  a *ceiling* at all. Four short tracks can, and they stack readably on a phone
  where a donut plus its legend does not.

  Each row is directly labelled with its type and its numbers, so colour here
  reinforces identity rather than carrying it — which is what lets the marigold
  step sit below 3:1 against white without the value becoming unreadable.
*/

/** One segment of a row's track: a width, a fill, and what it means. */
interface Segment {
  days: number
  fill: string
  label: string
  /** Diagonal hatching marks the "not decided yet" segment. */
  hatched?: boolean
}

export function LeaveBalancePanel({ balances }: LeaveBalancePanelProps) {
  return (
    <div className="rounded-card border border-ink-200 bg-surface shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink-200 px-5 py-4">
        <h3 className="type-wide text-base font-semibold text-ink-900">
          Balance by type
        </h3>
        <p className="text-xs text-ink-500">Year to date</p>
      </div>

      {/*
        A description list, not a table: each row is a term and its value, and
        a screen reader reads "Earned, 11 of 18 days used" rather than
        navigating a grid to assemble the same sentence from four cells.
      */}
      <dl className="divide-y divide-ink-100">
        {balances.map((balance) => (
          <BalanceRow key={balance.type} balance={balance} />
        ))}
      </dl>

      <Legend />
    </div>
  )
}

function BalanceRow({ balance }: { balance: LeaveBalance }) {
  const { label, blurb, fill, track } = LEAVE_TYPE_PRESENTATION[balance.type]
  const { entitledDays, usedDays, scheduledDays, pendingDays } = balance

  const committed = usedDays + scheduledDays + pendingDays
  const remaining =
    entitledDays === null ? null : Math.max(0, entitledDays - committed)

  const segments: Segment[] = [
    { days: usedDays, fill, label: 'Taken' },
    { days: scheduledDays, fill: track, label: 'Scheduled' },
    { days: pendingDays, fill: track, label: 'Pending', hatched: true },
  ].filter((segment) => segment.days > 0)

  /*
    An uncapped type has no track to fill, so it is scaled against whatever has
    been taken. Drawing it against an invented ceiling would be a chart that
    made up its own denominator.
  */
  const scale = entitledDays ?? Math.max(committed, 1)

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <dt className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-ink-900">{label}</span>
          <span className="hidden text-xs text-ink-500 sm:inline">{blurb}</span>
        </dt>

        <dd className="text-sm tabular-nums text-ink-600">
          {entitledDays === null ? (
            <span className="font-semibold text-ink-900">
              {formatDayCount(committed)}
            </span>
          ) : (
            <>
              <span className="font-semibold text-ink-900">
                {formatDays(remaining ?? 0)}
              </span>
              {' left of '}
              {formatDays(entitledDays)}
            </>
          )}
        </dd>
      </div>

      {/*
        `role="img"` with a written label: the bar is a picture of a sentence,
        and the sentence is the accessible answer. Without it a screen reader
        reads four empty divs.
      */}
      <div
        role="img"
        aria-label={accessibleSummary(balance, remaining)}
        className="mt-2.5 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-ink-100"
      >
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${(segment.days / scale) * 100}%`,
              background: segment.hatched
                ? `repeating-linear-gradient(135deg, ${segment.fill} 0 3px, transparent 3px 6px)`
                : segment.fill,
            }}
          />
        ))}
      </div>

      {/* The numbers behind the bar, for anyone who wants them without hovering. */}
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs tabular-nums text-ink-500">
        <span>{formatDays(usedDays)} taken</span>
        {scheduledDays > 0 && <span>{formatDays(scheduledDays)} scheduled</span>}
        {pendingDays > 0 && (
          <span className="text-accent-700">{formatDays(pendingDays)} pending</span>
        )}
      </p>
    </div>
  )
}

/** The row as one sentence, for `aria-label`. */
function accessibleSummary(
  balance: LeaveBalance,
  remaining: number | null,
): string {
  const { label } = LEAVE_TYPE_PRESENTATION[balance.type]
  const parts = [`${formatDays(balance.usedDays)} days taken`]

  if (balance.scheduledDays > 0) {
    parts.push(`${formatDays(balance.scheduledDays)} scheduled`)
  }
  if (balance.pendingDays > 0) {
    parts.push(`${formatDays(balance.pendingDays)} pending approval`)
  }
  if (remaining !== null) {
    parts.push(`${formatDays(remaining)} remaining of ${formatDays(balance.entitledDays ?? 0)}`)
  }

  return `${label} leave: ${parts.join(', ')}.`
}

/*
  Three keys, not four: the legend explains the *segments* of a row, which are
  the same three everywhere. The type colours are named by the row labels
  themselves, so a second legend repeating them would be restating the list
  directly above it.
*/
/*
  `ink-400` for the weaker two keys rather than `ink-300`.

  The ramp inverts in dark mode, so a step chosen because it was a pale grey on
  white becomes a near-black on the dark footer and the swatch disappears.
  `ink-400` is the one step that stays mid-tone in both directions — visibly
  weaker than "Taken" without dropping out of the panel it sits on.
*/
function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-200 bg-ink-50/60 px-5 py-3">
      <LegendKey swatch="bg-ink-800" label="Taken" />
      <LegendKey swatch="bg-ink-400" label="Scheduled" />
      <LegendKey
        swatch="bg-[repeating-linear-gradient(135deg,var(--color-ink-400)_0_3px,transparent_3px_6px)]"
        label="Pending"
      />
    </ul>
  )
}

function LegendKey({ swatch, label }: { swatch: string; label: string }) {
  return (
    <li className="flex items-center gap-2 text-xs text-ink-600">
      <span
        aria-hidden="true"
        className={`h-2.5 w-4 shrink-0 rounded-full ${swatch}`}
      />
      {label}
    </li>
  )
}
