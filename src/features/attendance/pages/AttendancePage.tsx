import { useMemo, useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { IconButton } from '@/shared/components/ui/IconButton'
import { SelectField } from '@/shared/components/ui/SelectField'
import { Toast } from '@/shared/components/ui/Toast'
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from '@/shared/components/ui/icons'
import { AttendanceCard } from '../components/AttendanceCard'
import { AttendanceAnalytics } from '../components/AttendanceAnalytics'
import { AttendanceDayTable } from '../components/AttendanceDayTable'
import { AttendanceDetailsDrawer } from '../components/AttendanceDetailsDrawer'
import { RegularizationDialog } from '../components/RegularizationDialog'
import { useAttendanceMonth } from '../hooks/useAttendanceMonth'
import { serverNow } from '../lib/serverClock'
import { STATE_PRESENTATION } from '../lib/statePresentation'
import { formatMonthLabel, shiftMonth, toWorkDate } from '../lib/workDate'
import type { RegularizationFormValues } from '../schemas/regularizationSchema'
import type { AttendanceDay, AttendanceMode } from '../types'

/*
  Which overlay is open, as one value rather than two booleans and a selected
  day — the same discriminated union the employees page uses, for the same
  reason: "the regularisation dialog is open with nobody selected" should not
  be a state this component can get into.
*/
type Overlay =
  | { kind: 'view'; day: AttendanceDay }
  | { kind: 'regularize'; day: AttendanceDay }

/** Filter values, with '' meaning "any". */
interface HistoryFilters {
  state: string
  mode: string
}

/**
 * The attendance screen.
 *
 * Ordered by how often each part is needed rather than by how much data it
 * contains — today's action first, then this week, then the month. Somebody
 * opening this page is usually doing one of three things: checking their hours
 * for today, chasing a missing day, or answering "how many days was I in the
 * office last month". They are in that order down the page.
 *
 * The dedicated page and the dashboard card deliberately share `AttendanceCard`
 * rather than reimplementing the summary: two copies of the check-in button
 * would be two behaviours to keep in step, and the one that drifted would be
 * the one somebody used.
 */
export function AttendancePage() {
  const { month, setMonth, days, weekDays, summary, submitRegularization } =
    useAttendanceMonth()

  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const [filters, setFilters] = useState<HistoryFilters>({ state: '', mode: '' })
  const [notice, setNotice] = useState<{ id: number; message: string } | null>(
    null,
  )

  const today = toWorkDate(serverNow())
  const now = serverNow()

  /*
    Newest first in the history table: the day you are looking for is almost
    always a recent one. The weekly log above stays in calendar order, because
    a week is read as a week.
  */
  const historyDays = useMemo(() => {
    const filtered = days.filter((day) => {
      if (filters.state !== '' && day.state !== filters.state) return false
      if (filters.mode !== '') {
        const mode: AttendanceMode | undefined = day.sessions[0]?.mode
        if (mode !== filters.mode) return false
      }
      return true
    })

    return [...filtered].reverse()
  }, [days, filters])

  const isFiltered = filters.state !== '' || filters.mode !== ''

  /* Only the states actually present this month — a filter listing options
     that match nothing is a dead end dressed up as a choice. */
  const stateOptions = useMemo(
    () => [...new Set(days.map((day) => day.state))],
    [days],
  )

  const handleRegularize = async (values: RegularizationFormValues) => {
    if (overlay?.kind !== 'regularize') return

    await submitRegularization({
      workDate: overlay.day.workDate,
      requestedCheckIn: values.checkIn,
      requestedCheckOut: values.checkOut,
      mode: values.mode,
      reasonCode: values.reasonCode,
      details: values.details,
    })

    setNotice({
      id: Date.now(),
      message: `Regularisation sent for ${overlay.day.workDate}. Your manager will be notified.`,
    })
  }

  return (
    <div className="mx-auto w-full max-w-[92rem] px-4 py-8 sm:px-6 lg:px-8">
      <p className="type-label text-brand-600">Time</p>
      <h1 className="type-wide mt-1.5 text-2xl font-bold tracking-tight text-ink-900">
        Attendance
      </h1>
      <p className="mt-1.5 text-sm text-ink-600">
        Your check-ins, hours and corrections. Times shown in Asia/Kolkata.
      </p>

      {/* ── Today ──────────────────────────────────────────────────────── */}
      <section aria-labelledby="today-heading" className="mt-8">
        <h2 id="today-heading" className="sr-only">
          Today
        </h2>
        <AttendanceCard />
      </section>

      {/* ── This week ──────────────────────────────────────────────────── */}
      <section aria-labelledby="week-heading" className="mt-10">
        <h2 id="week-heading" className="type-wide text-lg font-semibold text-ink-900">
          This week
        </h2>
        <p className="mt-1 text-sm text-ink-600">
          Monday to today. Anything missing can be regularised from here.
        </p>

        <div className="mt-4 overflow-hidden rounded-card border border-ink-200 bg-surface shadow-card">
          <AttendanceDayTable
            days={weekDays}
            caption="Attendance for this week"
            todayWorkDate={today}
            now={now}
            onView={(day) => setOverlay({ kind: 'view', day })}
            onRegularize={(day) => setOverlay({ kind: 'regularize', day })}
          />
        </div>
      </section>

      {/* ── The month ──────────────────────────────────────────────────── */}
      <section aria-labelledby="month-heading" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="month-heading"
              className="type-wide text-lg font-semibold text-ink-900"
            >
              {formatMonthLabel(month)}
            </h2>
            <p className="mt-1 text-sm text-ink-600">
              How the month is going, and every day in it.
            </p>
          </div>

          {/*
            Prev / label / next. The label is a real element rather than a
            `<select>` of months: it is read far more often than it is changed,
            and two chevrons cover the change people actually make (one month
            back).
          */}
          <div className="flex items-center gap-1 rounded-control border border-ink-300 bg-surface p-1">
            <IconButton
              label="Previous month"
              icon={<ChevronLeftIcon className="h-5 w-5" />}
              size="sm"
              onClick={() => setMonth(shiftMonth(month, -1))}
            />
            <p className="min-w-36 text-center text-sm font-medium text-ink-900">
              {formatMonthLabel(month)}
            </p>
            <IconButton
              label="Next month"
              icon={<ChevronRightIcon className="h-5 w-5" />}
              size="sm"
              // The future holds no attendance. Disabled rather than hidden, so
              // the control does not shift position at the edge.
              disabled={month >= today.slice(0, 7)}
              onClick={() => setMonth(shiftMonth(month, 1))}
            />
          </div>
        </div>

        <div className="mt-5">
          <AttendanceAnalytics summary={summary} monthLabel={formatMonthLabel(month)} />
        </div>

        {/* ── History ──────────────────────────────────────────────────── */}
        <div className="mt-6 overflow-hidden rounded-card border border-ink-200 bg-surface shadow-card">
          <div className="flex flex-col gap-3 border-b border-ink-200 p-4 sm:flex-row sm:items-center">
            <p className="type-label text-ink-500">Daily record</p>

            <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
              <SelectField
                label="Status"
                hideLabel
                fieldSize="sm"
                value={filters.state}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, state: event.target.value }))
                }
              >
                <option value="">Any status</option>
                {stateOptions.map((state) => (
                  <option key={state} value={state}>
                    {STATE_PRESENTATION[state].label}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Mode"
                hideLabel
                fieldSize="sm"
                value={filters.mode}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, mode: event.target.value }))
                }
              >
                <option value="">Any mode</option>
                <option value="office">Office</option>
                <option value="remote">Remote</option>
              </SelectField>

              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ state: '', mode: '' })}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {historyDays.length === 0 ? (
            <EmptyState
              className="m-4 border-0"
              icon={
                isFiltered ? (
                  <SearchIcon className="h-6 w-6" />
                ) : (
                  <CalendarIcon className="h-6 w-6" />
                )
              }
              title={
                isFiltered ? 'Nothing matches those filters' : 'Nothing recorded yet'
              }
              description={
                isFiltered
                  ? 'No days in this month match the status and mode you picked.'
                  : `There is no attendance on record for ${formatMonthLabel(month)}.`
              }
              action={
                isFiltered ? (
                  <Button
                    variant="secondary"
                    onClick={() => setFilters({ state: '', mode: '' })}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <AttendanceDayTable
              days={historyDays}
              caption={`Attendance for ${formatMonthLabel(month)}`}
              todayWorkDate={today}
              now={now}
              onView={(day) => setOverlay({ kind: 'view', day })}
              onRegularize={(day) => setOverlay({ kind: 'regularize', day })}
            />
          )}
        </div>
      </section>

      {/*
        Overlays are mounted when open and unmounted when closed, so each
        opening starts from clean form state — no leftover values from the last
        day, and no reset effect to remember.
      */}
      {overlay?.kind === 'view' && (
        <AttendanceDetailsDrawer
          day={overlay.day}
          now={now}
          onClose={() => setOverlay(null)}
          // Read → correct is a deliberate second step, and it swaps one
          // overlay for the other rather than stacking two.
          onRegularize={(day) => setOverlay({ kind: 'regularize', day })}
        />
      )}

      {overlay?.kind === 'regularize' && (
        <RegularizationDialog
          day={overlay.day}
          approverName="Priya Desai"
          onClose={() => setOverlay(null)}
          onSubmit={handleRegularize}
        />
      )}

      {notice && (
        <Toast
          key={notice.id}
          message={notice.message}
          onDismiss={() => setNotice(null)}
        />
      )}
    </div>
  )
}
