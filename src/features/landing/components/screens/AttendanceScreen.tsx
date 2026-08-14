import { cn } from '@/shared/lib/cn'
import {
  ScreenCard,
  ScreenChrome,
  ScreenLabel,
  ScreenPill,
} from './ScreenChrome'

/*
  A static picture of the attendance screen. Every value below is content, not
  state — see the note at the top of ScreenChrome.tsx for why these panels are
  markup rather than screenshots.
*/

/** The day's sessions. Two of them, because that is the ordinary case: office
    in the morning, home after lunch — the pattern a single check-in/check-out
    pair cannot represent, which is why the product models sessions. */
const SESSIONS = [
  { id: 's1', in: '09:12', out: '13:40', mode: 'Office', place: 'Pune HQ' },
  { id: 's2', in: '14:25', out: '—', mode: 'Remote', place: 'Home' },
] as const

/*
  A month of marks, as one string per week.

  Same encoding as the hero's muster roll: one character per day, so a week
  reads as a word in the source and a reviewer can actually see that Thursday
  is wrong. P present · R remote · L leave · G regularised · H holiday
  · W weekend · · not yet reached.
*/
const WEEKS = ['WPPPPPW', 'WPPRPPW', 'WPPLLGW', 'WHPPPPW', 'WPP····'] as const

const DAY_STATES = {
  P: { label: 'Present', className: 'bg-brand-600' },
  R: { label: 'Remote', className: 'border-2 border-brand-500 bg-brand-50' },
  L: { label: 'Leave', className: 'bg-accent-400' },
  G: { label: 'Regularised', className: 'bg-accent-200' },
  H: { label: 'Holiday', className: 'bg-ink-200' },
  W: { label: 'Weekend', className: 'bg-ink-100' },
  '·': { label: 'Upcoming', className: 'border border-dashed border-ink-300' },
} as const

/** The legend only names the states worth explaining; weekend and upcoming
    read for themselves and would just make the row longer. */
const LEGEND = ['P', 'R', 'L', 'G'] as const

/*
  The regularisation queue — the "remarks" half of the module.

  This is the part of attendance that costs HR their afternoon everywhere else:
  a missed check-out becomes a WhatsApp message, which becomes a spreadsheet
  note, which becomes an argument at month end. Here it is a row with a remark
  and a state.
*/
const REMARKS = [
  {
    id: 'r1',
    date: '12 Aug',
    issue: 'No check-out recorded',
    remark: 'Client visit ran late, left site at 19:30',
    status: 'Approved',
    tone: 'success',
  },
  {
    id: 'r2',
    date: '14 Aug',
    issue: 'Short day — 5h 40m',
    remark: 'Half day taken, balance already deducted',
    status: 'Pending',
    tone: 'accent',
  },
  {
    id: 'r3',
    date: '19 Aug',
    issue: 'Check-in from new IP',
    remark: 'Working from Bengaluru office this week',
    status: 'Approved',
    tone: 'success',
  },
] as const

function stateFor(code: string) {
  return DAY_STATES[code as keyof typeof DAY_STATES] ?? DAY_STATES.W
}

export function AttendanceScreen() {
  return (
    <ScreenChrome
      activeNav="Attendance"
      title="Attendance"
      subtitle="August 2026 · Asha Rao · Pune HQ"
      action={
        <span className="inline-flex h-8 items-center rounded-control bg-brand-600 px-3 text-xs font-medium text-on-brand">
          Check out
        </span>
      }
    >
      <div className="grid gap-3 lg:grid-cols-5">
        {/* ── Today ────────────────────────────────────────────────────── */}
        <ScreenCard className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <ScreenLabel>Today · Thu 20 Aug</ScreenLabel>
            <ScreenPill tone="brand">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-600" />
              </span>
              Working
            </ScreenPill>
          </div>

          {/*
            The duration is the biggest number on the screen because it is the
            one thing an employee opens this page to see. `tabular-nums` so the
            digits do not shuffle as the seconds tick over in the real app.
          */}
          <p className="type-wide mt-3 text-4xl font-bold tabular-nums text-ink-900">
            07:48<span className="text-ink-400">:12</span>
          </p>
          <p className="mt-1 font-mono text-xs text-ink-500">
            worked today · 8h 00m expected
          </p>

          {/* The progress toward a full day, as a meter rather than a number
              said twice. */}
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full w-[97%] rounded-full bg-brand-600" />
          </div>

          <div className="mt-4 border-t border-ink-100 pt-3">
            <ScreenLabel>Sessions</ScreenLabel>
            <ul className="mt-2 space-y-2">
              {SESSIONS.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="font-mono text-xs text-ink-800">
                    {session.in} – {session.out}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ScreenPill
                      tone={session.mode === 'Office' ? 'neutral' : 'brand'}
                    >
                      {session.mode}
                    </ScreenPill>
                    <span className="hidden font-mono text-[0.625rem] text-ink-400 sm:inline">
                      {session.place}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </ScreenCard>

        {/* ── The month ────────────────────────────────────────────────── */}
        <ScreenCard className="p-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <ScreenLabel>August</ScreenLabel>
            <span className="font-mono text-[0.625rem] text-ink-500">
              18 present · 2 leave · 1 regularised
            </span>
          </div>

          <div
            aria-hidden="true"
            className="mt-3 grid grid-cols-7 gap-1 sm:gap-1.5"
          >
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <span
                key={index}
                className="text-center font-mono text-[0.5625rem] text-ink-400"
              >
                {day}
              </span>
            ))}

            {WEEKS.flatMap((week, weekIndex) =>
              week.split('').map((code, dayIndex) => (
                <span
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    'aspect-square w-full rounded-[3px]',
                    stateFor(code).className,
                  )}
                />
              )),
            )}
          </div>

          <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-ink-100 pt-3">
            {LEGEND.map((code) => (
              <li key={code} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-[2px]',
                    stateFor(code).className,
                  )}
                />
                <span className="font-mono text-[0.625rem] text-ink-500">
                  {stateFor(code).label}
                </span>
              </li>
            ))}
          </ul>
        </ScreenCard>

        {/* ── Regularisation & remarks ─────────────────────────────────── */}
        <ScreenCard className="lg:col-span-5">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5">
            <ScreenLabel>Regularisation & remarks</ScreenLabel>
            <span className="font-mono text-[0.625rem] text-ink-500">
              1 awaiting manager
            </span>
          </div>

          <ul className="divide-y divide-ink-100">
            {REMARKS.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-3 px-4 py-2.5 sm:gap-4"
              >
                <span className="w-12 shrink-0 font-mono text-xs text-ink-500">
                  {row.date}
                </span>
                <span className="w-36 shrink-0 truncate text-xs font-medium text-ink-800">
                  {row.issue}
                </span>
                {/* The remark itself is the wide, low-priority column — visible
                    on desktop, dropped on a phone where the date, the issue and
                    the decision are what matter. */}
                <span className="hidden min-w-0 flex-1 truncate text-xs text-ink-500 md:block">
                  “{row.remark}”
                </span>
                <span className="ml-auto shrink-0 md:ml-0">
                  <ScreenPill tone={row.tone}>{row.status}</ScreenPill>
                </span>
              </li>
            ))}
          </ul>
        </ScreenCard>
      </div>
    </ScreenChrome>
  )
}
