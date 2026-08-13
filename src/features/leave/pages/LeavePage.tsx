import { Suspense, lazy, useMemo, useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { SelectField } from '@/shared/components/ui/SelectField'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Toast } from '@/shared/components/ui/Toast'
import {
  CalendarIcon,
  PlusIcon,
  SearchIcon,
} from '@/shared/components/ui/icons'
import { LeaveApplicationDialog } from '../components/LeaveApplicationDialog'
import { LeaveBalancePanel } from '../components/LeaveBalancePanel'
import { LeaveDetailDrawer } from '../components/LeaveDetailDrawer'
import { LeaveHistoryTable } from '../components/LeaveHistoryTable'
import { LeaveSummaryTiles } from '../components/LeaveSummaryTiles'
import { WeekOverviewCard } from '../components/WeekOverviewCard'
import { useLeaveData } from '../hooks/useLeaveData'
import { formatDayCount } from '../lib/leaveDates'
import {
  LEAVE_STATUS_PRESENTATION,
  LEAVE_TYPE_PRESENTATION,
} from '../lib/leavePresentation'
import { summariseBalances, totalsByMonth } from '../lib/leaveSummary'
import type { LeaveApplicationValues } from '../schemas/leaveApplicationSchema'
import { LEAVE_STATUSES, LEAVE_TYPES } from '../types'
import type { LeaveRequest } from '../types'

/*
  The trend chart is the only part of this screen that is not needed to read
  the page, and it is the biggest. Split into its own chunk so opening /leave
  does not pay for it before the balances and the week card have painted.
*/
const LeaveTrendChart = lazy(() =>
  import('../components/LeaveTrendChart').then((module) => ({
    default: module.LeaveTrendChart,
  })),
)

const APPROVER_NAME = 'Priya Desai'

/** Filter values, with `''` meaning "any". */
interface HistoryFilters {
  type: string
  status: string
}

const NO_FILTERS: HistoryFilters = { type: '', status: '' }

/**
 * The leave screen.
 *
 * Ordered by how often each part is needed rather than by how much data it
 * contains — the same principle as the attendance page. Somebody opening this
 * is usually doing one of three things: checking what they have left before
 * booking something, looking at the week they are in, or chasing a request
 * they filed last Tuesday. They are in that order down the page.
 */
export function LeavePage() {
  const {
    todayWorkDate,
    requests,
    balances,
    week,
    holidayDates,
    submitApplication,
  } = useLeaveData()

  const [isApplying, setIsApplying] = useState(false)
  const [viewing, setViewing] = useState<LeaveRequest | null>(null)
  const [filters, setFilters] = useState<HistoryFilters>(NO_FILTERS)
  const [notice, setNotice] = useState<{ id: number; message: string } | null>(
    null,
  )

  const yearLabel = todayWorkDate.slice(0, 4)

  const summary = useMemo(
    () => summariseBalances(balances, requests),
    [balances, requests],
  )

  const trendMonths = useMemo(
    () => totalsByMonth(requests, todayWorkDate),
    [requests, todayWorkDate],
  )

  const visibleRequests = useMemo(
    () =>
      requests.filter((request) => {
        if (filters.type !== '' && request.type !== filters.type) return false
        if (filters.status !== '' && request.status !== filters.status) {
          return false
        }
        return true
      }),
    [requests, filters],
  )

  const isFiltered = filters.type !== '' || filters.status !== ''

  const handleApply = async (values: LeaveApplicationValues) => {
    const created = await submitApplication(values)

    setNotice({
      id: Date.now(),
      message: `${LEAVE_TYPE_PRESENTATION[created.type].label} leave for ${formatDayCount(created.days)} sent to ${APPROVER_NAME} for approval.`,
    })
  }

  return (
    <div className="mx-auto w-full max-w-[92rem] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="type-label text-brand-600">Time</p>
          <h1 className="type-wide mt-1.5 text-2xl font-bold tracking-tight text-ink-900">
            Leave
          </h1>
          <p className="mt-1.5 text-sm text-ink-600">
            Your balances, your requests and the week you are in. Dates shown in
            Asia/Kolkata.
          </p>
        </div>

        <Button onClick={() => setIsApplying(true)}>
          <PlusIcon className="h-4 w-4" />
          Apply for leave
        </Button>
      </div>

      {/* ── The year so far ────────────────────────────────────────────── */}
      <section aria-labelledby="balances-heading" className="mt-8">
        <h2 id="balances-heading" className="sr-only">
          Leave balances for {yearLabel}
        </h2>
        <LeaveSummaryTiles summary={summary} yearLabel={yearLabel} />
      </section>

      {/* ── This week ──────────────────────────────────────────────────── */}
      <div className="mt-6">
        <WeekOverviewCard week={week} todayWorkDate={todayWorkDate} />
      </div>

      {/* ── Analysis ───────────────────────────────────────────────────── */}
      <section aria-labelledby="analysis-heading" className="mt-10">
        <h2
          id="analysis-heading"
          className="type-wide text-lg font-semibold text-ink-900"
        >
          How the year is going
        </h2>
        <p className="mt-1 text-sm text-ink-600">
          What is left to book, and where this year's days have gone.
        </p>

        {/*
          The balance panel first and wider on large screens: "how many days do
          I have left" is the question people came for, and the trend is the
          one they browse afterwards.
        */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <LeaveBalancePanel balances={balances} />

          <Suspense
            fallback={
              <div
                className="rounded-card border border-ink-200 bg-surface p-5 shadow-card"
                aria-busy="true"
              >
                <span className="sr-only" role="status">
                  Loading chart…
                </span>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="mt-4 h-52 w-full rounded-control" />
              </div>
            }
          >
            <LeaveTrendChart months={trendMonths} />
          </Suspense>
        </div>
      </section>

      {/* ── History ────────────────────────────────────────────────────── */}
      <section aria-labelledby="history-heading" className="mt-10">
        <h2
          id="history-heading"
          className="type-wide text-lg font-semibold text-ink-900"
        >
          Your requests
        </h2>
        <p className="mt-1 text-sm text-ink-600">
          Everything you have applied for, newest first.
        </p>

        <div className="mt-4 overflow-hidden rounded-card border border-ink-200 bg-surface shadow-card">
          <div className="flex flex-col gap-3 border-b border-ink-200 p-4 sm:flex-row sm:items-center">
            <p className="type-label text-ink-500">
              {visibleRequests.length}{' '}
              {visibleRequests.length === 1 ? 'request' : 'requests'}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
              <SelectField
                label="Type"
                hideLabel
                fieldSize="sm"
                value={filters.type}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    type: event.target.value,
                  }))
                }
              >
                <option value="">Any type</option>
                {LEAVE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {LEAVE_TYPE_PRESENTATION[type].label}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Status"
                hideLabel
                fieldSize="sm"
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
              >
                <option value="">Any status</option>
                {LEAVE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {LEAVE_STATUS_PRESENTATION[status].label}
                  </option>
                ))}
              </SelectField>

              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters(NO_FILTERS)}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {visibleRequests.length === 0 ? (
            /*
              Two different empty states, because telling somebody their leave
              history is empty when their filter was simply too narrow is how
              people conclude their data has been deleted.
            */
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
                isFiltered
                  ? 'Nothing matches those filters'
                  : 'No leave applied for yet'
              }
              description={
                isFiltered
                  ? 'No requests match the type and status you picked.'
                  : `You have not applied for any leave in ${yearLabel}.`
              }
              action={
                isFiltered ? (
                  <Button
                    variant="secondary"
                    onClick={() => setFilters(NO_FILTERS)}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={() => setIsApplying(true)}>
                    <PlusIcon className="h-4 w-4" />
                    Apply for leave
                  </Button>
                )
              }
            />
          ) : (
            <LeaveHistoryTable
              requests={visibleRequests}
              caption={`Your leave requests for ${yearLabel}`}
              onView={setViewing}
            />
          )}
        </div>
      </section>

      {/*
        Overlays are mounted when open and unmounted when closed, so each
        opening starts from clean form state — no leftover values from the last
        attempt, and no reset effect to remember.
      */}
      {isApplying && (
        <LeaveApplicationDialog
          todayWorkDate={todayWorkDate}
          holidayDates={holidayDates}
          balances={balances}
          approverName={APPROVER_NAME}
          onClose={() => setIsApplying(false)}
          onSubmit={handleApply}
        />
      )}

      {viewing && (
        <LeaveDetailDrawer
          request={viewing}
          onClose={() => setViewing(null)}
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
