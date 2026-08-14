import { cn } from '@/shared/lib/cn'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE MUSTER ROLL
  ─────────────────────────────────────────────────────────────────────────────
  The signature element of the whole product, and the one place the design
  spends its boldness.

  HR ops has an artifact older than any software: the muster roll — names down
  the side, days across the top, a mark in every cell. Every module in this
  product is, underneath, a different way of writing into that grid or reading
  back out of it. So the hero is not an abstract dashboard mock-up or a
  gradient; it is the register itself, filling in.

  Everything else on the page stays quiet so that this can be loud.
*/

/**
 * One mark per cell, encoded as a single character so a person's fortnight
 * reads as a string in the source: `'PPRLPWW'`.
 *
 * The alternative — an array of objects per cell — is 14 lines of JSON per
 * employee, and no reviewer would ever spot that Tuesday was wrong.
 */
const MARKS = {
  P: {
    label: 'Present',
    /* Solid ink: the default state, and the one the eye should skim past. */
    className: 'bg-brand-600',
  },
  R: {
    label: 'Remote',
    /* Same ink, hollowed out — present, elsewhere. */
    className: 'border-2 border-brand-500 bg-brand-50',
  },
  L: {
    label: 'Leave',
    /* Marigold: the exception, and the only thing on the grid worth stopping
       for. This is why the accent colour exists at all. */
    className: 'bg-accent-400',
  },
  W: {
    label: 'Weekend',
    className: 'bg-ink-100',
  },
} as const

type MarkCode = keyof typeof MARKS

/*
  A fortnight, Monday to Sunday twice over, so the weekends fall in visible
  columns and the grid is legibly a calendar rather than an abstract pattern.
*/
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const
const DAYS_PER_ROW = 14

interface RosterRow {
  id: string
  name: string
  initials: string
  role: string
  /** Exactly `DAYS_PER_ROW` characters. */
  marks: string
}

/*
  Deliberately hand-written rather than randomised.

  Random marks would make the hero flicker into a different shape on every
  reload, and — worse — occasionally generate something absurd, like an entire
  team on leave. These six fortnights were composed: a normal week, a Friday
  the office works from home, one long leave, one person who joined mid-sprint.
*/
const ROSTER: readonly RosterRow[] = [
  {
    id: 'asha',
    name: 'Asha Rao',
    initials: 'AR',
    role: 'Design',
    marks: 'PPPPRWWPPPPRWW',
  },
  {
    id: 'rahul',
    name: 'Rahul Nair',
    initials: 'RN',
    role: 'Engineering',
    marks: 'PPRPPWWPLLLPWW',
  },
  {
    id: 'meera',
    name: 'Meera Iyer',
    initials: 'MI',
    role: 'Finance',
    marks: 'PPPPPWWPPPPPWW',
  },
  {
    id: 'dev',
    name: 'Dev Kulkarni',
    initials: 'DK',
    role: 'Support',
    marks: 'RRPPPWWPPRRPWW',
  },
  {
    id: 'sana',
    name: 'Sana Qureshi',
    initials: 'SQ',
    role: 'Recruiting',
    marks: 'PPPLLWWPPPPRWW',
  },
  {
    id: 'joseph',
    name: 'Joseph Mathew',
    initials: 'JM',
    role: 'Operations',
    marks: 'PPPPPWWRPPPPWW',
  },
]

/** `'P'` → the mark, `anything else` → weekend. Narrowing without a cast. */
function markFor(code: string) {
  return MARKS[code as MarkCode] ?? MARKS.W
}

export function RosterGrid() {
  return (
    /*
      A <figure> with an sr-only <figcaption>.

      The grid itself is `aria-hidden`: 84 cells announced one at a time is
      punishment, not information. The caption says what the picture shows in
      one sentence, which is what a screen-reader user actually needs — the
      same courtesy as alt text on a photograph.
    */
    <figure className="animate-rise-in relative">
      <figcaption className="sr-only">
        An attendance register for six employees over two weeks. Most days are
        marked present, with a few remote days and one week of leave — the same
        record that onboarding, attendance, leave and every other module in
        Unity Portal reads from.
      </figcaption>

      <div
        aria-hidden="true"
        className="overflow-hidden rounded-panel border border-ink-200 bg-surface shadow-raised"
      >
        {/* ── Register header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 border-b border-ink-200 bg-ink-50/70 px-4 py-3 sm:px-5">
          <div className="flex items-baseline gap-3">
            <span className="type-label text-brand-700">Muster roll</span>
            <span className="font-mono text-xs text-ink-500">
              01–14 Aug · 6 people
            </span>
          </div>

          {/* The live marker: what the register is for, said in one number. */}
          <span className="hidden items-center gap-2 sm:inline-flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
            </span>
            <span className="type-label text-ink-500">Syncing</span>
          </span>
        </div>

        {/* ── Day columns ──────────────────────────────────────────────── */}
        {/*
          `minmax(0, 1fr)` on the day block, and cells that are square rather
          than a fixed pixel width. Fourteen 20px cells plus a name column do
          not fit a 375px phone, and the fix is not a media query per size —
          it is columns that divide whatever width is left and cells that
          follow them. The grid stays a fortnight wide at every viewport.
        */}
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-3 border-b border-ink-100 px-4 py-2 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-x-4 sm:px-5">
          <span className="type-label text-ink-400">Employee</span>
          <div
            className="grid gap-1 sm:gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${DAYS_PER_ROW}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: DAYS_PER_ROW }, (_, index) => (
              <span
                key={index}
                className="text-center font-mono text-[0.5625rem] text-ink-400"
              >
                {DAY_LABELS[index % DAY_LABELS.length]}
              </span>
            ))}
          </div>
        </div>

        {/* ── Rows ─────────────────────────────────────────────────────── */}
        <div className="divide-y divide-ink-100">
          {ROSTER.map((row, rowIndex) => (
            <div
              key={row.id}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-3 px-4 py-2.5 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-x-4 sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="type-label hidden h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700 sm:flex">
                  {row.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-ink-900 sm:text-sm">
                    {row.name}
                  </span>
                  <span className="hidden truncate text-[0.6875rem] text-ink-500 sm:block">
                    {row.role}
                  </span>
                </span>
              </div>

              <div
                className="grid gap-1 sm:gap-1.5"
                style={{
                  gridTemplateColumns: `repeat(${DAYS_PER_ROW}, minmax(0, 1fr))`,
                }}
              >
                {row.marks.split('').map((code, dayIndex) => (
                  <span
                    key={dayIndex}
                    className={cn(
                      'animate-mark-in aspect-square w-full rounded-[3px]',
                      markFor(code).className,
                    )}
                    /*
                      The wave.

                      Delay grows along the diagonal — column faster than row —
                      so the marks land left-to-right the way somebody filling
                      in a register actually writes, instead of appearing all at
                      once or in an obviously mechanical sweep. The whole thing
                      is over in about a second, and `prefers-reduced-motion`
                      collapses it to nothing (see index.css).
                    */
                    style={{
                      animationDelay: `${dayIndex * 38 + rowIndex * 70}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Legend + the payoff line ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-ink-200 bg-ink-50/70 px-4 py-3 sm:px-5">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {(Object.keys(MARKS) as MarkCode[]).map((code) => (
              <li key={code} className="flex items-center gap-1.5">
                <span
                  className={cn('h-3 w-3 rounded-[2px]', MARKS[code].className)}
                />
                <span className="type-label text-ink-500">
                  {MARKS[code].label}
                </span>
              </li>
            ))}
          </ul>

          <p className="font-mono text-xs text-ink-600">
            <span className="font-semibold text-ink-900">72</span> shifts ·{' '}
            <span className="font-semibold text-ink-900">4</span> leave days ·{' '}
            <span className="font-semibold text-ink-900">0</span> left to{' '}
            <span className="text-brand-700">reconcile</span>
          </p>
        </div>
      </div>
    </figure>
  )
}
