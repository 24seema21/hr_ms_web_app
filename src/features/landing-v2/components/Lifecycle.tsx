import { Container } from '@/shared/components/layout/Container'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

/*
  The employment, as one track with five stops.

  This is the one place on the page where a sequence genuinely *is* the
  meaning — offer really does come before exit — so it gets an <ol>, a
  connected track, and the only numerals on the page. Everywhere else the
  content is a set rather than a series, and 01 / 02 / 03 over a set is
  decoration wearing information's clothes.
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
      className="relative scroll-mt-8 py-20 sm:py-24"
    >
      <Container>
        <Reveal>
          <SectionHeading
            headingId="lifecycle-heading"
            eyebrow="One pack, not nine tools"
            title="The whole employment, on one track"
            lead="Most teams buy onboarding from one vendor, attendance from another and an asset spreadsheet from nobody. Unity Portal is one subscription that covers the line end to end."
          />
        </Reveal>

        {/*
          One <ol>, two directions. Stacked with a vertical track on a phone,
          laid out along a horizontal one from `lg`. The track is drawn per
          item — a node plus the segment that leaves it — rather than as one
          line behind the row, because a single absolutely-positioned rule has
          to be re-measured at every breakpoint and always ends up a few pixels
          off the first and last node.
        */}
        <ol className="mt-14 grid lg:grid-cols-5 lg:gap-x-5">
          {STAGES.map((stage, index) => {
            const isLast = index === STAGES.length - 1

            return (
              <li key={stage.id}>
                <Reveal delay={index * 80} className="flex gap-4 lg:block">
                  {/* ── The track ─────────────────────────────────────── */}
                  <div
                    aria-hidden="true"
                    className="flex flex-col items-center lg:flex-row"
                  >
                    <span className="type-tight flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-nx-jade-line bg-nx-surface font-mono text-xs font-semibold text-nx-jade-ink shadow-nx-soft">
                      {index + 1}
                    </span>

                    {/*
                      The segment fades out along its length. A hard line
                      between two nodes reads as a fixed connection; one that
                      dissolves reads as continuing — which is the point, since
                      the stage after this one is a different card, not a
                      different product.
                    */}
                    {!isLast && (
                      <span className="w-px flex-1 bg-linear-to-b from-nx-jade-line to-nx-line lg:ml-3 lg:h-px lg:w-auto lg:flex-1 lg:bg-linear-to-r" />
                    )}
                  </div>

                  {/* ── The stop ──────────────────────────────────────── */}
                  {/*
                    `pb-10` on the text, not `gap-y` on the list. The vertical
                    track is drawn inside each item, so a gap between items
                    would chop it into five dashes; padding inside the item
                    leaves the track running the full height to the next node.
                  */}
                  <div className="pb-10 lg:pt-6 lg:pr-4 lg:pb-0">
                    <p className="text-xs font-bold tracking-wide text-nx-jade-ink uppercase">
                      {stage.stage}
                    </p>
                    <h3 className="type-tight mt-2 text-base font-bold text-balance text-nx-ink">
                      {stage.line}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-pretty text-nx-muted">
                      {stage.detail}
                    </p>
                  </div>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </Container>
    </section>
  )
}
