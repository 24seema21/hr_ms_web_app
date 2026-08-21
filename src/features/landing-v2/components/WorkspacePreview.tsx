import { SparkIcon } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'
import { SCREEN_TONES } from '../lib/screenTones'
import type { ScreenTone } from '../lib/screenTones'
import { ScreenCard, ScreenFrame, ScreenLabel } from './screens/ScreenFrame'

/*
  The hero's picture: a morning in the product.

  It is a dashboard rather than an abstract graphic because the page's argument
  is that everything lands in one place — and the fastest way to make that
  argument is to show the one place. Every number below is marketing content,
  which is why this file imports a frame and some icons and nothing else: a
  landing page that pulls in the attendance slice to draw a picture of it ships
  the attendance slice.
*/

const STATS: readonly {
  id: string
  label: string
  value: string
  note: string
  tone: ScreenTone
}[] = [
  { id: 'present', label: 'In office', value: '42', note: '+3 on yesterday', tone: 'jade' },
  { id: 'remote', label: 'Remote', value: '9', note: 'across 4 sites', tone: 'violet' },
  { id: 'leave', label: 'On leave', value: '4', note: '2 awaiting you', tone: 'amber' },
]

/*
  Four rows, composed rather than plausible-looking filler: one ordinary day,
  one missing check-out, one remote afternoon, one approved leave. Between them
  they show every state a row can be in, which is the only thing that makes a
  fabricated table worth drawing.
*/
const ROWS: readonly {
  id: string
  initials: string
  name: string
  role: string
  window: string
  status: string
  tone: ScreenTone
}[] = [
  {
    id: 'asha',
    initials: 'AR',
    name: 'Asha Rao',
    role: 'Design',
    window: '09:12 → 18:04',
    status: 'Present',
    tone: 'jade',
  },
  {
    id: 'rahul',
    initials: 'RN',
    name: 'Rahul Nair',
    role: 'Engineering',
    window: '09:40 → —',
    status: 'No check-out',
    tone: 'amber',
  },
  {
    id: 'meera',
    initials: 'MI',
    name: 'Meera Iyer',
    role: 'Finance',
    window: '09:00 → 17:30',
    status: 'Remote',
    tone: 'violet',
  },
  {
    id: 'sana',
    initials: 'SQ',
    name: 'Sana Qureshi',
    role: 'Recruiting',
    window: 'Earned leave',
    status: 'On leave',
    tone: 'amber',
  },
]

export function WorkspacePreview() {
  return (
    <div className="relative">
      {/*
        The light the panel sits in: a blurred copy of the aurora's three hues,
        tucked behind and slightly larger than the frame, so the card appears
        lit from underneath rather than pasted on.
      */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-6 -top-4 bottom-10 rounded-nx-xl bg-linear-to-r from-nx-jade/30 via-nx-violet/25 to-nx-amber/20 blur-3xl"
      />

      {/*
        A <figure> with an sr-only <figcaption>. The frame itself is hidden
        from the accessibility tree (see ScreenFrame); this sentence is what a
        screen-reader user gets instead, and it is the whole picture.
      */}
      <figure className="relative">
        <figcaption className="sr-only">
          The Unity Portal dashboard on a Tuesday morning: 42 people in the
          office, 9 remote and 4 on leave, above a register of the day’s
          check-ins — including one missing check-out that the assistant has
          flagged and drafted a remark for.
        </figcaption>

        <ScreenFrame
          activeNav="dashboard"
          path="/dashboard"
          title="Tuesday, 12 August"
          meta="Pune HQ"
        >
          {/* Three tiles, `grid-cols-3` at every width — the numbers are short
              enough to survive a phone without stacking. */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {STATS.map((stat) => (
              <div
                key={stat.id}
                className="rounded-xl border border-nx-line bg-nx-bg/50 p-3"
              >
                <p className="text-[0.625rem] font-medium text-nx-muted">
                  {stat.label}
                </p>
                <p className="type-tight mt-1 text-2xl font-extrabold text-nx-ink">
                  {stat.value}
                </p>
                <p
                  className={cn(
                    'mt-1.5 inline-block rounded-full px-1.5 py-0.5 font-mono text-[0.5625rem]',
                    SCREEN_TONES[stat.tone],
                  )}
                >
                  {stat.note}
                </p>
              </div>
            ))}
          </div>

          <ScreenCard className="mt-4">
            <div className="flex items-center justify-between border-b border-nx-line bg-nx-bg/50 px-3 py-2">
              <ScreenLabel>Today’s sessions</ScreenLabel>
              <span className="font-mono text-[0.625rem] text-nx-faint">
                55 of 55
              </span>
            </div>

            <div className="divide-y divide-nx-line">
              {ROWS.map((row) => (
                <div key={row.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold',
                      SCREEN_TONES[row.tone],
                    )}
                  >
                    {row.initials}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-nx-ink">
                      {row.name}
                    </span>
                    <span className="block truncate text-[0.625rem] text-nx-faint">
                      {row.role}
                    </span>
                  </span>

                  {/* The clock column goes first when space runs out: the pill
                      beside it already carries the meaning. */}
                  <span className="hidden font-mono text-[0.625rem] text-nx-muted sm:block">
                    {row.window}
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

          {/*
            The assist, shown doing the exact thing the AI section later claims
            it does: it noticed, it drafted, and it is waiting to be told yes.
            Violet, which is this page's colour for the machine's half of the
            work from here to the footer.
          */}
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-nx-violet-soft px-3 py-2.5">
            <SparkIcon className="h-4 w-4 shrink-0 text-nx-violet-ink" />
            <p className="min-w-0 flex-1 text-[0.6875rem] leading-snug text-nx-violet-ink">
              <span className="font-semibold">1 day needs a remark.</span>{' '}
              <span className="hidden sm:inline">
                Rahul’s check-out is missing — a regularisation note is drafted
                from his sessions.
              </span>
            </p>
            <span className="shrink-0 rounded-full bg-nx-violet px-2.5 py-1 text-[0.625rem] font-semibold text-white">
              Review
            </span>
          </div>
        </ScreenFrame>
      </figure>
    </div>
  )
}
