import { useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ChartIcon, GridIcon } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'
import { formatDays, formatDuration, formatShortDate } from '../lib/leaveDates'
import { summariseWeek } from '../lib/leaveSummary'
import { WeekBarView } from './WeekBarView'
import { WeekGridView } from './WeekGridView'
import type { WeekDay } from '../types'

interface WeekOverviewCardProps {
  week: WeekDay[]
  todayWorkDate: string
}

/*
  This week — leave, attendance and events — in one card with two ways to read
  it.

  Two views rather than two cards because they answer different questions about
  the *same* seven days: the bars answer "how did the week go", the grid
  answers "what is happening on Thursday". Side by side they would compete for
  the width; stacked they would push the history table below the fold.

  The panel has a floor height (`CONTENT_MIN_HEIGHT`) so switching views does
  not resize the card. A toggle that makes the page jump is a toggle people
  stop using, and everything below this card would move with it.
*/

const VIEWS = [
  { id: 'bars', label: 'Hours', icon: ChartIcon },
  { id: 'grid', label: 'Calendar', icon: GridIcon },
] as const

type ViewId = (typeof VIEWS)[number]['id']

/** Tall enough for the grid view, which is the taller of the two. */
const CONTENT_MIN_HEIGHT = 'min-h-[17rem] sm:min-h-[14rem]'

export function WeekOverviewCard({ week, todayWorkDate }: WeekOverviewCardProps) {
  const [view, setView] = useState<ViewId>('bars')
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const baseId = useId()

  const totals = useMemo(() => summariseWeek(week), [week])

  /*
    Arrow-key navigation between tabs, which is what the tab role promises. A
    `role="tab"` that only responds to clicks is worse than no role at all: it
    tells a screen reader user to expect arrow keys and then ignores them.
  */
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const direction =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (direction === 0) return

    event.preventDefault()
    const currentIndex = VIEWS.findIndex((entry) => entry.id === view)
    const next = VIEWS[(currentIndex + direction + VIEWS.length) % VIEWS.length]

    setView(next.id)
    tabRefs.current[next.id]?.focus()
  }

  return (
    <section
      aria-labelledby={`${baseId}-heading`}
      className="rounded-card border border-ink-200 bg-surface shadow-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-ink-200 px-5 py-4">
        <div>
          <h2
            id={`${baseId}-heading`}
            className="type-wide text-base font-semibold text-ink-900"
          >
            This week
          </h2>
          <p className="mt-0.5 text-xs text-ink-500">
            {formatShortDate(week[0].workDate)} –{' '}
            {formatShortDate(week[week.length - 1].workDate)}
          </p>
        </div>

        {/* ── View switch ────────────────────────────────────────────── */}
        <div
          role="tablist"
          aria-label="Week view"
          className="flex items-center gap-1 rounded-control border border-ink-300 bg-ink-50 p-1"
        >
          {VIEWS.map((entry) => {
            const isSelected = entry.id === view

            return (
              <button
                key={entry.id}
                ref={(node) => {
                  tabRefs.current[entry.id] = node
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${entry.id}`}
                aria-selected={isSelected}
                aria-controls={`${baseId}-panel-${entry.id}`}
                // Roving tabindex: one stop for the whole group, then arrows
                // move within it. Seven tabs should not cost seven tab presses.
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setView(entry.id)}
                onKeyDown={handleTabKeyDown}
                className={cn(
                  'flex cursor-pointer items-center gap-1.5 rounded-[0.375rem] px-2.5 py-1.5 text-xs font-medium',
                  'transition-[color,background-color] duration-150',
                  isSelected
                    ? 'bg-surface text-ink-900 shadow-card'
                    : 'text-ink-600 hover:text-ink-900',
                )}
              >
                <entry.icon className="h-4 w-4" />
                {entry.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Totals ───────────────────────────────────────────────────── */}
      <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-ink-100 bg-ink-50/40 px-5 py-3">
        <Total
          label="Worked"
          value={formatDuration(totals.workedMinutes)}
          caption={`of ${formatDuration(totals.requiredMinutes)} owed`}
        />
        {/*
          "— days" is not a sentence. A week with no leave in it says so in
          words; only a real figure gets a unit after it.
        */}
        <Total
          label="On leave"
          value={totals.leaveDays === 0 ? 'None' : formatDays(totals.leaveDays)}
          caption={
            totals.leaveDays === 0
              ? 'this week'
              : totals.leaveDays === 1
                ? 'day'
                : 'days'
          }
        />
        <Total
          label="Events"
          value={String(totals.eventCount)}
          caption="this week"
        />
      </dl>

      {/*
        Only the selected panel is mounted. The alternative — both rendered,
        one hidden with CSS — puts a second copy of all seven days in the
        accessibility tree and makes the hidden chart's labels findable by
        search.
      */}
      <div
        role="tabpanel"
        id={`${baseId}-panel-${view}`}
        aria-labelledby={`${baseId}-tab-${view}`}
        tabIndex={0}
        className={cn('flex flex-col px-5 py-5', CONTENT_MIN_HEIGHT)}
      >
        {view === 'bars' ? (
          <WeekBarView week={week} todayWorkDate={todayWorkDate} />
        ) : (
          <WeekGridView week={week} todayWorkDate={todayWorkDate} />
        )}
      </div>
    </section>
  )
}

function Total({
  label,
  value,
  caption,
}: {
  label: string
  value: string
  caption: string
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="type-label text-ink-500">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums text-ink-900">
        {value}
        <span className="ml-1 text-xs font-normal text-ink-500">{caption}</span>
      </dd>
    </div>
  )
}
