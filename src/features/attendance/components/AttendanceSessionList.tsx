import { Badge } from '@/shared/components/ui/Badge'
import { BuildingIcon, HomeIcon } from '@/shared/components/ui/icons'
import { formatClockTime, formatDuration, minutesBetween } from '../lib/duration'
import { LiveDuration } from './LiveDuration'
import type { AttendanceSession } from '../types'

interface AttendanceSessionListProps {
  sessions: AttendanceSession[]
  /** "Now" for measuring closed sessions. The open one ticks on its own. */
  now: Date
}

/**
 * Today's sessions, one row each.
 *
 * A day with two sessions is the normal case, not an edge case — lunch exists
 * — so this is not hidden behind a disclosure. It is also the only place that
 * shows *where* each stretch was worked, which is the whole reason mode is
 * recorded per session rather than per day.
 *
 * An `<ol>`: the sessions are genuinely sequential, which is what makes the
 * 01 / 02 numbering information rather than decoration.
 */
export function AttendanceSessionList({
  sessions,
  now,
}: AttendanceSessionListProps) {
  if (sessions.length === 0) return null

  return (
    <ol className="divide-y divide-ink-100">
      {sessions.map((session, index) => {
        const isRunning = session.checkOutAt === null
        const ModeIcon = session.mode === 'office' ? BuildingIcon : HomeIcon

        return (
          <li
            key={session.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5"
          >
            <span className="type-label w-6 shrink-0 text-ink-400" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>

            <p className="font-mono text-sm tabular-nums text-ink-800">
              {formatClockTime(session.checkInAt)}
              <span className="mx-1.5 text-ink-300">→</span>
              {session.checkOutAt ? (
                formatClockTime(session.checkOutAt)
              ) : (
                // A dashed placeholder, not a blank: "still running" is a
                // fact, and an empty cell reads as missing data.
                <span className="text-ink-400">· · ·</span>
              )}
            </p>

            <p className="text-sm font-medium text-ink-900">
              {isRunning ? (
                <LiveDuration from={session.checkInAt} running />
              ) : (
                <span className="tabular-nums">
                  {formatDuration(
                    minutesBetween(session.checkInAt, session.checkOutAt ?? now),
                  )}
                </span>
              )}
            </p>

            <span className="ml-auto flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-ink-500">
                <ModeIcon className="h-4 w-4 text-ink-400" />
                {session.locationLabel ??
                  (session.mode === 'office' ? 'Office' : 'Remote')}
              </span>

              {isRunning ? (
                <Badge tone="brand">Running</Badge>
              ) : (
                <Badge>Closed</Badge>
              )}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
