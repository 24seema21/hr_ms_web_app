import { useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Toast } from '@/shared/components/ui/Toast'
import { AlertIcon, CalendarIcon, ClockIcon } from '@/shared/components/ui/icons'
import { useTicker } from '../hooks/useTicker'
import { useTodayAttendance } from '../hooks/useTodayAttendance'
import {
  dayStateOf,
  primaryActionFor,
  wouldCheckOutEarly,
} from '../lib/attendanceState'
import {
  formatClockTime,
  formatDuration,
  formatFullDay,
} from '../lib/duration'
import { serverNow } from '../lib/serverClock'
import { firstCheckInOf, lastCheckOutOf, totalsForDay } from '../lib/workedMinutes'
import { AttendanceModePicker } from './AttendanceModePicker'
import { AttendanceProgress } from './AttendanceProgress'
import { AttendanceSessionList } from './AttendanceSessionList'
import { AttendanceStatus } from './AttendanceStatus'
import { CheckInOutButton } from './CheckInOutButton'
import type { AttendanceDay, AttendanceMode } from '../types'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE DASHBOARD'S ATTENDANCE CARD
  ─────────────────────────────────────────────────────────────────────────────
  The most-used control in the product: twice a day, every day, by everyone.
  Everything about it is arranged around four questions, answered top to
  bottom without scrolling and without a click:

      Am I checked in?        → the status, first and largest
      Since when?             → the check-in time, beside it
      How long have I worked? → the big ticking figure
      What do I do now?       → one button, and only ever one

  Two components in this file. `AttendanceCardView` is presentational and takes
  a day; `AttendanceCard` wires it to the hook. The split is what lets every
  state be rendered — and reviewed, and tested — without a network or a clock
  to arrange.
*/

interface AttendanceCardViewProps {
  day: AttendanceDay
  isBusy: boolean
  mode: AttendanceMode
  onModeChange: (mode: AttendanceMode) => void
  onCheckIn: () => void
  onCheckOut: () => void
  error?: string | null
}

export function AttendanceCardView({
  day,
  isBusy,
  mode,
  onModeChange,
  onCheckIn,
  onCheckOut,
  error,
}: AttendanceCardViewProps) {
  const [isConfirmingEarly, setIsConfirmingEarly] = useState(false)

  /*
    A slow tick for the card as a whole: the progress bar, "1h 15m left" and
    the totals only need to be right to the minute. The seconds-level display
    lives in `LiveDuration`, which owns its own one-second interval so that
    this card is not re-rendered sixty times a minute for a value that changes
    once.
  */
  const hasOpenSession = day.sessions.some((s) => s.checkOutAt === null)
  const now = useTicker(hasOpenSession, 30_000)

  const state = dayStateOf(day, now)
  const action = primaryActionFor(state)
  const totals = totalsForDay(day, now)
  const checkedInAt = firstCheckInOf(day)
  const checkedOutAt = lastCheckOutOf(day)

  const isOffDay = state === 'weekend' || state === 'holiday' || state === 'leave'

  const handleCheckOutClick = () => {
    // Confirm only when it would leave the day short. A dialog on every
    // check-out is one people learn to click through, and then it protects
    // nothing on the day it mattered.
    if (wouldCheckOutEarly(day, now)) {
      setIsConfirmingEarly(true)
      return
    }
    onCheckOut()
  }

  return (
    <section
      aria-labelledby="attendance-heading"
      className="overflow-hidden rounded-card border border-ink-200 bg-surface shadow-card"
    >
      {/* ── Date + mode ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 bg-ink-50/60 px-4 py-3 sm:px-5">
        <h2 id="attendance-heading" className="type-label flex items-center gap-2 text-ink-500">
          <CalendarIcon className="h-4 w-4 text-ink-400" />
          {formatFullDay(now)}
        </h2>

        {/*
          Hidden entirely on a day nobody is expected to work: a disabled
          Office/Remote toggle on a public holiday is a control that answers a
          question no one asked.

          Otherwise locked while a session is running — the mode belongs to
          that session, and changing it retroactively would rewrite where
          somebody already worked. Checking out and back in is how you switch.
        */}
        {!isOffDay && (
          <AttendanceModePicker
            value={hasOpenSession ? (totals.openSession?.mode ?? mode) : mode}
            onChange={onModeChange}
            disabled={hasOpenSession || isBusy}
          />
        )}
      </div>

      {/* ── Status, hours, action ──────────────────────────────────────── */}
      <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8">
        <div className="min-w-0">
          <AttendanceStatus state={state} />

          {isOffDay ? (
            <p className="mt-2 text-sm text-ink-600">
              {state === 'holiday'
                ? `${day.holidayName ?? 'Public holiday'} — no attendance needed today.`
                : state === 'leave'
                  ? 'Approved leave — no attendance needed today.'
                  : 'Enjoy the weekend. No attendance needed today.'}
            </p>
          ) : (
            <>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600">
                {checkedInAt ? (
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4 text-ink-400" />
                    Checked in{' '}
                    <span className="font-medium text-ink-900">
                      {formatClockTime(checkedInAt)}
                    </span>
                  </span>
                ) : (
                  <span>Your day has not started yet.</span>
                )}

                {checkedOutAt && !hasOpenSession && (
                  <span>
                    Checked out{' '}
                    <span className="font-medium text-ink-900">
                      {formatClockTime(checkedOutAt)}
                    </span>
                  </span>
                )}
              </p>

              <div className="mt-5">
                <AttendanceProgress
                  totals={totals}
                  requiredMinutes={day.policy.requiredMinutes}
                />
              </div>

              {totals.currentMinutes !== null && (
                <p className="mt-3 text-sm text-ink-500">
                  Current session {formatDuration(totals.currentMinutes)} ·{' '}
                  {day.sessions.length}{' '}
                  {day.sessions.length === 1 ? 'session' : 'sessions'} today
                </p>
              )}
            </>
          )}
        </div>

        {/*
          The action sits in its own column on desktop and full-width at the
          bottom on mobile, where the thumb is. Nothing else in the card is a
          primary button, so there is never a question about which one to press.
        */}
        {!isOffDay && (
          <CheckInOutButton
            action={action}
            isBusy={isBusy}
            onCheckIn={onCheckIn}
            onCheckOut={handleCheckOutClick}
            className="w-full lg:w-48"
          />
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 border-t border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 sm:px-5"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {/* ── Sessions ───────────────────────────────────────────────────── */}
      {day.sessions.length > 0 && (
        <div className="border-t border-ink-200">
          <p className="type-label px-4 pt-4 pb-2 text-ink-400 sm:px-5">
            Sessions today
          </p>
          <AttendanceSessionList sessions={day.sessions} now={now} />
        </div>
      )}

      {isConfirmingEarly && (
        <Modal
          onClose={() => setIsConfirmingEarly(false)}
          eyebrow="Short day"
          title={`Check out at ${formatDuration(totals.totalMinutes)}?`}
          className="max-w-md"
          footer={
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => setIsConfirmingEarly(false)}
              >
                Keep working
              </Button>
              <Button
                onClick={() => {
                  setIsConfirmingEarly(false)
                  onCheckOut()
                }}
              >
                Check out anyway
              </Button>
            </div>
          }
        >
          <p className="text-sm text-ink-700">
            You are{' '}
            <span className="font-semibold text-ink-900">
              {formatDuration(totals.remainingMinutes)}
            </span>{' '}
            under your {formatDuration(day.policy.requiredMinutes)} for today.
          </p>
          <p className="mt-3 text-sm text-ink-500">
            You can check in again later — the day adds up across every session,
            so a break does not cost you the morning.
          </p>
        </Modal>
      )}
    </section>
  )
}

/**
 * The container: state from `useTodayAttendance`, confirmation toasts, and the
 * skeleton that holds the card's shape while the first response is in flight.
 */
export function AttendanceCard() {
  const { day, status, error, isBusy, checkIn, checkOut } = useTodayAttendance()
  const [mode, setMode] = useState<AttendanceMode>('office')
  const [notice, setNotice] = useState<{ id: number; message: string } | null>(
    null,
  )

  if (status === 'loading' || !day) return <AttendanceCardSkeleton />

  const handleCheckIn = async () => {
    await checkIn(mode)
    /*
      The toast is where the state change gets announced — `role="status"`,
      polite, one sentence. This is the counterpart to the ticking timer being
      `aria-hidden`: transitions are worth interrupting for, seconds are not.
    */
    setNotice({
      id: Date.now(),
      message: `Checked in at ${formatClockTime(serverNow())}, ${mode === 'office' ? 'office' : 'remote'}.`,
    })
  }

  const handleCheckOut = async () => {
    await checkOut()
    setNotice({
      id: Date.now(),
      message: `Checked out at ${formatClockTime(serverNow())}.`,
    })
  }

  return (
    <>
      <AttendanceCardView
        day={day}
        isBusy={isBusy}
        mode={mode}
        onModeChange={setMode}
        onCheckIn={() => void handleCheckIn()}
        onCheckOut={() => void handleCheckOut()}
        error={error}
      />

      {notice && (
        <Toast
          key={notice.id}
          message={notice.message}
          onDismiss={() => setNotice(null)}
        />
      )}
    </>
  )
}

/** The card's shape, before the card. See `Skeleton` for why not a spinner. */
function AttendanceCardSkeleton() {
  return (
    <section
      className="overflow-hidden rounded-card border border-ink-200 bg-surface shadow-card"
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        Loading today's attendance…
      </span>

      <div className="flex items-center justify-between gap-3 border-b border-ink-200 bg-ink-50/60 px-5 py-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-7 w-36" />
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-3 h-4 w-56" />
          <Skeleton className="mt-6 h-9 w-64" />
          <Skeleton className="mt-3 h-2 w-full rounded-full" />
        </div>
        <Skeleton className="h-12 w-full lg:w-48" />
      </div>
    </section>
  )
}
