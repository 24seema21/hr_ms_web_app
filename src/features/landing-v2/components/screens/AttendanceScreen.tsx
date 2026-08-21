import { SparkIcon } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'
import { SCREEN_FILLS, SCREEN_TONES } from '../../lib/screenTones'
import type { ScreenTone } from '../../lib/screenTones'
import { ScreenCard, ScreenFrame, ScreenLabel } from './ScreenFrame'

/*
  Attendance, and the one idea that makes it different from a punch clock: a
  day is a set of *sessions*, not an in/out pair. An office morning and a
  remote afternoon are one day here, and anything the clock cannot explain
  becomes a regularisation with a remark rather than a message to HR.

  The timeline is the argument, so it gets the top of the screen.
*/

/*
  The day runs 08:00–19:00 — eleven hours, which is the denominator for every
  percentage below. Offsets are written as the arithmetic rather than as the
  answer, so a session can be moved by editing a clock time instead of by
  re-deriving a decimal nobody can check.
*/
const DAY_START = 8
const DAY_HOURS = 11

const SESSIONS: readonly {
  id: string
  label: string
  from: number
  to: number
  tone: ScreenTone
}[] = [
  { id: 'office', label: 'Office · 09:12 → 13:30', from: 9.2, to: 13.5, tone: 'jade' },
  { id: 'remote', label: 'Remote · 14:10 → 18:04', from: 14.17, to: 18.07, tone: 'violet' },
]

/*
  Ticks are positioned by the same formula as the sessions, not spread with
  `justify-between`. The hours are not evenly spaced (08→11→14→17→19), so
  distributing them evenly would put the labels under the wrong part of the
  track — the one thing a timeline axis must never do.
*/
const HOUR_TICKS = [8, 11, 14, 17, 19] as const

const EXCEPTIONS: readonly {
  id: string
  date: string
  detail: string
  status: string
  tone: ScreenTone
}[] = [
  {
    id: 'aug-08',
    date: 'Fri 08 Aug',
    detail: '09:40 → no check-out',
    status: 'Needs remark',
    tone: 'amber',
  },
  {
    id: 'aug-07',
    date: 'Thu 07 Aug',
    detail: '10:55 → 18:20 · late start',
    status: 'Regularised',
    tone: 'jade',
  },
  {
    id: 'aug-06',
    date: 'Wed 06 Aug',
    detail: 'Check-in from Mumbai site',
    status: 'Approved',
    tone: 'jade',
  },
]

export function AttendanceScreen() {
  return (
    <ScreenFrame
      activeNav="attendance"
      path="/attendance"
      title="Attendance"
      meta="Asha Rao · Aug"
    >
      <ScreenCard className="mt-4">
        <div className="flex items-center justify-between border-b border-nx-line bg-nx-bg/50 px-3 py-2">
          <ScreenLabel>Tuesday, one day, two sessions</ScreenLabel>
          <span className="font-mono text-[0.625rem] text-nx-faint">8h 12m</span>
        </div>

        <div className="p-3 sm:p-4">
          {/*
            The track. Segments are absolutely positioned inside it rather than
            laid out with flex, because their gaps carry meaning — the empty
            span between 13:30 and 14:10 is the lunch break, and a flex row
            would have to fake it with a spacer that means nothing.
          */}
          <div className="relative h-9 overflow-hidden rounded-lg bg-nx-bg">
            {SESSIONS.map((session) => (
              <span
                key={session.id}
                className={cn(
                  'absolute inset-y-0 flex items-center justify-center rounded-lg text-[0.5625rem] font-semibold',
                  SCREEN_TONES[session.tone],
                )}
                style={{
                  left: `${((session.from - DAY_START) / DAY_HOURS) * 100}%`,
                  width: `${((session.to - session.from) / DAY_HOURS) * 100}%`,
                }}
              >
                {session.id === 'office' ? 'Office' : 'Remote'}
              </span>
            ))}
          </div>

          <div className="relative mt-1.5 h-3 font-mono text-[0.5625rem] text-nx-faint">
            {HOUR_TICKS.map((hour) => (
              <span
                key={hour}
                className="absolute -translate-x-1/2"
                style={{
                  left: `${((hour - DAY_START) / DAY_HOURS) * 100}%`,
                }}
              >
                {String(hour).padStart(2, '0')}
              </span>
            ))}
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {SESSIONS.map((session) => (
              <li
                key={session.id}
                className="flex items-center gap-1.5 font-mono text-[0.625rem] text-nx-muted"
              >
                {/* A solid fill, not the tint: a 8px dot in a 12%-opacity wash
                    is invisible, and the legend is the key to the track. */}
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    SCREEN_FILLS[session.tone],
                  )}
                />
                {session.label}
              </li>
            ))}
          </ul>
        </div>
      </ScreenCard>

      <ScreenCard className="mt-3">
        <div className="border-b border-nx-line bg-nx-bg/50 px-3 py-2">
          <ScreenLabel>Anything the clock cannot explain</ScreenLabel>
        </div>

        <div className="divide-y divide-nx-line">
          {EXCEPTIONS.map((row) => (
            <div key={row.id} className="flex items-center gap-3 px-3 py-2.5">
              <span className="w-20 shrink-0 font-mono text-[0.625rem] text-nx-muted">
                {row.date}
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.6875rem] text-nx-ink">
                {row.detail}
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold whitespace-nowrap',
                  SCREEN_TONES[row.tone],
                )}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </ScreenCard>

      {/* The drafted remark: written from the sessions above, and unsent. */}
      <div className="mt-3 rounded-xl bg-nx-violet-soft p-3">
        <p className="flex items-center gap-2 text-[0.625rem] font-semibold text-nx-violet-ink">
          <SparkIcon className="h-3.5 w-3.5" />
          Drafted from your sessions — edit or discard
        </p>
        <p className="mt-1.5 text-[0.6875rem] leading-snug text-nx-violet-ink/90">
          “Worked 09:40–18:15 on 08 Aug from Pune HQ; forgot to check out
          before leaving for the vendor meeting.”
        </p>
        <div className="mt-2.5 flex gap-2">
          <span className="rounded-full bg-nx-violet px-2.5 py-1 text-[0.625rem] font-semibold text-white">
            Submit regularisation
          </span>
          <span className="rounded-full px-2.5 py-1 text-[0.625rem] font-semibold text-nx-violet-ink ring-1 ring-nx-violet-line ring-inset">
            Discard
          </span>
        </div>
      </div>
    </ScreenFrame>
  )
}
