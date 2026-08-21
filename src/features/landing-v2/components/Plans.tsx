import { Container } from '@/shared/components/layout/Container'
import { CheckIcon } from '@/shared/components/ui/icons'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/cn'
import { MATRIX_GROUPS, PLANS } from '@/features/landing/data/plans'
import type { MatrixCell } from '@/features/landing/data/plans'
import { ActionLink } from './ActionLink'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

/**
 * One cell of the comparison matrix.
 *
 * Three cases, and the third is why this is a component rather than a ternary:
 * most rows are not a yes/no at all, they are a *limit* ("4 types", "25
 * sites"). A matrix that flattens those into ticks tells the reader they are
 * covered and lets them find the ceiling after they have signed.
 */
function Cell({ value, label }: { value: MatrixCell; label: string }) {
  if (value === 'yes') {
    return (
      <>
        <CheckIcon className="mx-auto h-4 w-4 text-nx-jade" />
        {/* The tick is a picture; this is what a screen reader reads out, and
            it names the row so the cell still makes sense out of context. */}
        <span className="sr-only">{label}: included</span>
      </>
    )
  }

  if (value === 'no') {
    return (
      <>
        <span aria-hidden="true" className="font-mono text-sm text-nx-faint">
          –
        </span>
        <span className="sr-only">{label}: not included</span>
      </>
    )
  }

  return (
    <span className="font-mono text-xs text-nx-muted">
      <span className="sr-only">{label}: </span>
      {value}
    </span>
  )
}

export function Plans() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative scroll-mt-8 py-20 sm:py-24"
    >
      <Container>
        <Reveal>
          <SectionHeading
            headingId="pricing-heading"
            eyebrow="Subscription"
            title="Enterprise depth, at a price you can approve yourself"
            lead="One subscription per employee, per month. The tier decides how much of the configuration is yours to change — not how many people you are allowed to put in the register."
            align="center"
          />
        </Reveal>

        <div className="mt-14 grid items-start gap-5 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 80} className="h-full">
              {/*
                The recommended tier is *ringed*, not recoloured.

                A fully filled card would spend the page's strongest colour on
                a sales badge, and every tinted status chip above it — live, in
                build, planned — would stop reading as information. The
                gradient hairline says "this one" without shouting over the
                argument the rest of the page just finished making.
              */}
              <div
                className={cn(
                  'h-full rounded-nx-lg p-px',
                  plan.featured
                    ? 'bg-linear-to-b from-nx-jade via-nx-violet to-nx-jade shadow-nx-lift'
                    : 'bg-nx-line shadow-nx-soft',
                )}
              >
                <div
                  className={cn(
                    'flex h-full flex-col rounded-[calc(var(--radius-nx-lg)-1px)] bg-nx-surface p-6 sm:p-7',
                    plan.featured && 'lg:py-9',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="type-tight text-lg font-extrabold text-nx-ink">
                      {plan.name}
                    </h3>
                    {plan.featured && (
                      <span className="rounded-full bg-nx-ink px-2.5 py-1 text-[0.6875rem] font-semibold text-nx-bg">
                        Most teams
                      </span>
                    )}
                  </div>

                  <p className="mt-1 font-mono text-xs text-nx-faint">
                    {plan.audience}
                  </p>

                  <p className="mt-6 flex items-baseline gap-1.5">
                    <span className="type-tight text-4xl font-extrabold text-nx-ink">
                      {plan.price === null ? 'Talk to us' : `₹${plan.price}`}
                    </span>
                    {plan.price !== null && (
                      <span className="font-mono text-xs text-nx-faint">
                        {plan.priceNote}
                      </span>
                    )}
                  </p>
                  {plan.price === null && (
                    <p className="mt-1 font-mono text-xs text-nx-faint">
                      {plan.priceNote}
                    </p>
                  )}

                  <p className="mt-4 text-sm leading-relaxed text-pretty text-nx-muted">
                    {plan.summary}
                  </p>

                  <ul className="mt-6 space-y-3 border-t border-nx-line pt-6">
                    {plan.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2.5">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-nx-jade" />
                        <span className="text-sm text-pretty text-nx-muted">
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* `mt-auto` pins the action down, so three cards with
                      different amounts of copy still line their buttons up. */}
                  <div className="mt-auto pt-7">
                    <ActionLink
                      to={ROUTES.LOGIN}
                      variant={plan.featured ? 'primary' : 'ghost'}
                      className="w-full"
                    >
                      {plan.price === null
                        ? 'Request a quote'
                        : `Start on ${plan.name}`}
                    </ActionLink>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-center font-mono text-xs text-pretty text-nx-faint">
          Introductory pricing while the product is in build · billed monthly ·
          no per-module upsell · cancel any month and take your CSVs with you
        </p>

        {/* ── The fine print, as a real table ──────────────────────────── */}
        <Reveal className="mt-16">
          <h3 className="type-tight text-xl font-extrabold text-nx-ink">
            What each tier lets you configure
          </h3>
          <p className="mt-2 max-w-2xl text-pretty text-nx-muted">
            Every row is a screen inside Settings. The tier decides which of
            them an admin can open.
          </p>

          {/*
            `overflow-x-auto` on the wrapper, not the page: a four-column
            comparison does not fit a 375px phone, and the honest fix is a
            table that scrolls inside its own box rather than a page that
            scrolls sideways.
          */}
          <div className="mt-6 overflow-x-auto rounded-nx-lg border border-nx-line bg-nx-surface shadow-nx-soft">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="sr-only">
                Configuration capabilities by subscription tier
              </caption>
              <thead>
                <tr className="border-b border-nx-line">
                  <th scope="col" className="px-5 py-3.5">
                    <span className="font-mono text-[0.6875rem] tracking-widest text-nx-faint uppercase">
                      Capability
                    </span>
                  </th>
                  {PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      scope="col"
                      className="w-32 px-4 py-3.5 text-center"
                    >
                      <span
                        className={cn(
                          'text-xs font-bold',
                          plan.featured ? 'text-nx-jade-ink' : 'text-nx-muted',
                        )}
                      >
                        {plan.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              {/*
                One <tbody> per group, each introduced by its own row.

                Grouping in the markup — rather than dropping a styled <tr>
                between flat rows — is what makes "Lifecycle" read as a heading
                over four capabilities instead of as a fifth capability with no
                values.
              */}
              {MATRIX_GROUPS.map((group) => (
                <tbody key={group.id} className="divide-y divide-nx-line">
                  <tr className="border-t border-nx-line bg-nx-bg/60">
                    <th
                      scope="colgroup"
                      colSpan={PLANS.length + 1}
                      className="px-5 py-2.5 text-left"
                    >
                      <span className="font-mono text-[0.6875rem] tracking-widest text-nx-jade-ink uppercase">
                        {group.label}
                      </span>
                    </th>
                  </tr>

                  {group.rows.map((row) => (
                    <tr key={row.id}>
                      <th scope="row" className="px-5 py-3 font-normal">
                        <span className="block text-sm font-semibold text-nx-ink">
                          {row.label}
                        </span>
                        <span className="mt-0.5 block font-mono text-[0.6875rem] text-nx-faint">
                          {row.detail}
                        </span>
                      </th>
                      {PLANS.map((plan) => (
                        <td
                          key={plan.id}
                          className={cn(
                            'px-4 py-3 text-center',
                            plan.featured && 'bg-nx-jade-soft/40',
                          )}
                        >
                          <Cell value={row.cells[plan.id]} label={row.label} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
