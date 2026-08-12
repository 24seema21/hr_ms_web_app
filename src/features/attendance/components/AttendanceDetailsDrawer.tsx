import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Drawer } from '@/shared/components/ui/Drawer'
import { ProgressBar } from '@/shared/components/ui/ProgressBar'
import { PencilIcon } from '@/shared/components/ui/icons'
import { primaryActionFor } from '../lib/attendanceState'
import { formatDuration, formatFullDay, spellDuration } from '../lib/duration'
import { STATE_PRESENTATION } from '../lib/statePresentation'
import { totalsForDay } from '../lib/workedMinutes'
import { parseWorkDate } from '../lib/workDate'
import { AttendanceSessionList } from './AttendanceSessionList'
import type { AttendanceDay } from '../types'

interface AttendanceDetailsDrawerProps {
  day: AttendanceDay
  now: Date
  onClose: () => void
  onRegularize: (day: AttendanceDay) => void
}

/**
 * One day, in full, beside the table it was opened from.
 *
 * Read-only, like the employee drawer and for the same reason: looking
 * something up should never put you one keystroke away from changing it. The
 * only action offered is the one the day's state actually supports.
 */
export function AttendanceDetailsDrawer({
  day,
  now,
  onClose,
  onRegularize,
}: AttendanceDetailsDrawerProps) {
  const totals = totalsForDay(day, now)
  const presentation = STATE_PRESENTATION[day.state]
  const canRegularize = primaryActionFor(day.state) === 'regularize'

  return (
    <Drawer
      onClose={onClose}
      eyebrow={day.workDate}
      title={formatFullDay(parseWorkDate(day.workDate))}
      footer={
        canRegularize ? (
          <Button className="w-full" onClick={() => onRegularize(day)}>
            <PencilIcon className="h-4 w-4" />
            Regularise this day
          </Button>
        ) : (
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          tone={
            day.state === 'absent'
              ? 'danger'
              : day.state === 'completed' || day.state === 'regularized'
                ? 'success'
                : day.state === 'half_day' ||
                    day.state === 'regularization_pending'
                  ? 'accent'
                  : 'neutral'
          }
        >
          {presentation.label}
        </Badge>
        {day.holidayName && <Badge tone="brand">{day.holidayName}</Badge>}
      </div>

      {/* ── Hours ──────────────────────────────────────────────────────── */}
      {day.state !== 'weekend' && day.state !== 'holiday' && (
        <div className="mt-6 rounded-card border border-ink-200 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="type-wide text-2xl font-bold tracking-tight tabular-nums text-ink-900">
              {formatDuration(totals.totalMinutes)}
            </p>
            <p className="text-sm text-ink-500">
              of {formatDuration(day.policy.requiredMinutes)} required
            </p>
          </div>

          <ProgressBar
            className="mt-3"
            value={totals.totalMinutes}
            max={day.policy.requiredMinutes}
            tone={totals.remainingMinutes === 0 ? 'accent' : 'brand'}
            label="Hours worked"
            valueText={`${spellDuration(totals.totalMinutes)} of ${spellDuration(day.policy.requiredMinutes)}`}
          />

          {totals.remainingMinutes > 0 && (
            <p className="mt-2 text-xs text-ink-500">
              {formatDuration(totals.remainingMinutes)} short of the required day.
            </p>
          )}
        </div>
      )}

      {/* ── Sessions ───────────────────────────────────────────────────── */}
      <div className="mt-6">
        <p className="type-label text-ink-400">Sessions</p>
        {day.sessions.length > 0 ? (
          <div className="mt-2 -mx-5">
            <AttendanceSessionList sessions={day.sessions} now={now} />
          </div>
        ) : (
          <p className="mt-2 rounded-control border border-dashed border-ink-300 px-4 py-6 text-center text-sm text-ink-500">
            {day.state === 'weekend' || day.state === 'holiday'
              ? 'No attendance was expected on this day.'
              : 'Nothing was recorded on this day.'}
          </p>
        )}
      </div>

      {/* ── Regularisation history ─────────────────────────────────────── */}
      {(day.state === 'regularization_pending' ||
        day.state === 'regularized' ||
        day.state === 'regularization_rejected') && (
        <div className="mt-6">
          <p className="type-label text-ink-400">Regularisation</p>
          <div className="mt-2 rounded-control border border-ink-200 bg-ink-50/60 px-4 py-3 text-sm">
            {day.state === 'regularization_pending' && (
              <p className="text-ink-700">
                Submitted and waiting on your manager. You will get a
                notification either way.
              </p>
            )}
            {day.state === 'regularized' && (
              <p className="text-ink-700">
                Approved — the times above were set by the request, not by a
                check-in.
              </p>
            )}
            {day.state === 'regularization_rejected' && (
              /*
                The reviewer's note, shown in full. A rejection with no reason
                generates a message to the manager within the hour, every time,
                so the note is required at the point of rejection and displayed
                here.
              */
              <p className="text-danger-700">
                Rejected. Reason from your manager will appear here, and you can
                submit a corrected request.
              </p>
            )}
          </div>
        </div>
      )}

      <p className="mt-8 border-t border-ink-200 pt-4 font-mono text-xs text-ink-400">
        Times shown in Asia/Kolkata · recorded by the server
      </p>
    </Drawer>
  )
}
