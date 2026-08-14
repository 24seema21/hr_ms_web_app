import { Container } from '@/shared/components/layout/Container'

/*
  The employee lifecycle, as one continuous rule with five marked stops.

  This is the one place on the page where a sequence is genuinely the meaning —
  offer really does come before exit — so it gets an <ol> and a timeline. It
  deliberately does *not* get 01/02/03 markers: the stages are named, and a
  number in front of a name it already carries is decoration.

  The rule that runs through the marks is the register motif again, turned on
  its side. Same hairline, same marigold cell, one section apart.
*/
const STAGES = [
  {
    id: 'join',
    stage: 'Joining',
    line: 'Offer accepted, record created',
    detail:
      'Onboarding stages fire off with owners and due dates counted from the joining date.',
  },
  {
    id: 'settle',
    stage: 'Probation',
    line: 'Reviews and reduced entitlements',
    detail:
      'Probation rules override leave accrual automatically until the review clears.',
  },
  {
    id: 'work',
    stage: 'Working',
    line: 'Attendance, leave, assets, tickets',
    detail:
      'The everyday register — check-ins, regularisation remarks, balances and requests.',
  },
  {
    id: 'grow',
    stage: 'Growing',
    line: 'Goals, check-ins, review cycles',
    detail:
      'Goals and reviews read the same reporting line, so nobody rebuilds the org chart.',
  },
  {
    id: 'exit',
    stage: 'Exit',
    line: 'Assets back, access revoked',
    detail:
      'The record is deactivated, never deleted, so the history stays auditable.',
  },
] as const

export function Lifecycle() {
  return (
    <section
      id="lifecycle"
      aria-labelledby="lifecycle-heading"
      className="border-b border-ink-200 bg-shell py-20 sm:py-24"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="type-label text-brand-600">One pack, not nine tools</p>
          <h2
            id="lifecycle-heading"
            className="type-wide mt-4 text-3xl font-bold tracking-tight text-balance text-ink-900 sm:text-4xl"
          >
            The whole employment, on one page of the register
          </h2>
          <p className="mt-5 text-lg text-pretty text-ink-600">
            Most teams buy onboarding from one vendor, attendance from another
            and an asset spreadsheet from nobody. Unity Portal is one
            subscription that covers the line end to end.
          </p>
        </div>

        {/*
          No column gap at `lg`, and the breathing room moved to `pr` inside
          each cell instead. That is what lets the hairlines in adjacent cells
          meet and read as one rule running the width of the section — a gap
          would chop it into five dashes.
        */}
        <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-0">
          {STAGES.map((stage) => (
            <li key={stage.id}>
              {/*
                The mark on the rule: the register's marigold cell, laid on its
                side. Decorative — the order is already carried by the <ol> —
                so it is hidden from the accessibility tree, and it only
                appears at `lg`, where the stages actually sit in a row. Five
                stacked cards on a phone need no connector to be read in order.

                It sits *outside* the padded text block on purpose. Padding the
                whole cell would inset the hairline by the same amount and chop
                the rule into five dashes, which is the thing removing the
                column gap was meant to prevent.
              */}
              <div
                aria-hidden="true"
                className="mb-5 hidden items-center lg:flex"
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-accent-400" />
                <span className="h-px flex-1 bg-ink-300" />
              </div>

              <div className="lg:pr-6">
                <p className="type-label text-accent-600">{stage.stage}</p>
                <h3 className="type-wide mt-2.5 text-base font-semibold text-balance text-ink-900">
                  {stage.line}
                </h3>
                <p className="mt-2 text-sm text-pretty text-ink-600">
                  {stage.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
