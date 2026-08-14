import { Container } from '@/shared/components/layout/Container'
import { ButtonLink } from '@/shared/components/ui/ButtonLink'
import { CheckIcon } from '@/shared/components/ui/icons'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/cn'
import { MATRIX_GROUPS, PLANS } from '../data/plans'
import type { MatrixCell } from '../data/plans'

/**
 * One cell of the comparison matrix.
 *
 * Three cases, and the third is the reason this is a component rather than a
 * ternary: most rows are not a yes/no at all, they are a *limit* ("4 types",
 * "25 sites"). A matrix that flattens those into ticks tells the reader they
 * are covered and lets them find the ceiling after they have signed.
 */
function Cell({ value, label }: { value: MatrixCell; label: string }) {
  if (value === 'yes') {
    return (
      <>
        <CheckIcon className="mx-auto h-4 w-4 text-brand-600" />
        {/* The tick is a picture; this is what a screen reader reads out, and
            it names the row so the cell still makes sense out of context. */}
        <span className="sr-only">{label}: included</span>
      </>
    )
  }

  if (value === 'no') {
    return (
      <>
        <span aria-hidden="true" className="font-mono text-sm text-ink-300">
          –
        </span>
        <span className="sr-only">{label}: not included</span>
      </>
    )
  }

  return (
    <span className="font-mono text-xs text-ink-700">
      <span className="sr-only">{label}: </span>
      {value}
    </span>
  )
}

export function Plans() {
  return (
    <section
      id="plans"
      aria-labelledby="plans-heading"
      className="border-b border-ink-200 py-20 sm:py-24"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="type-label text-brand-600">Subscription</p>
          <h2
            id="plans-heading"
            className="type-wide mt-4 text-3xl font-bold tracking-tight text-balance text-ink-900 sm:text-4xl"
          >
            Enterprise depth, at a price you can approve yourself
          </h2>
          <p className="mt-5 text-lg text-pretty text-ink-600">
            One subscription per employee, per month. The tier decides how much
            of the configuration is yours to change — not how many people you
            are allowed to put in the register.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'flex flex-col rounded-card border bg-surface p-6 sm:p-7',
                /*
                  The recommended tier is raised rather than recoloured. A
                  filled marigold card would spend the accent — the mark
                  colour, rationed on purpose — on a sales badge, and the marks
                  in the register above would stop being the loudest thing on
                  the page.
                */
                plan.featured
                  ? 'border-brand-300 shadow-raised lg:-my-2 lg:py-9'
                  : 'border-ink-200 shadow-card',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="type-wide text-lg font-bold text-ink-900">
                  {plan.name}
                </h3>
                {plan.featured && (
                  <span className="type-label rounded-full bg-accent-400 px-2.5 py-1 text-on-accent">
                    Most teams
                  </span>
                )}
              </div>

              <p className="mt-1 font-mono text-xs text-ink-500">
                {plan.audience}
              </p>

              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="type-wide text-4xl font-bold text-ink-900">
                  {plan.price === null ? 'Talk to us' : `₹${plan.price}`}
                </span>
                {plan.price !== null && (
                  <span className="font-mono text-xs text-ink-500">
                    {plan.priceNote}
                  </span>
                )}
              </p>
              {plan.price === null && (
                <p className="mt-1 font-mono text-xs text-ink-500">
                  {plan.priceNote}
                </p>
              )}

              <p className="mt-4 text-sm text-pretty text-ink-600">
                {plan.summary}
              </p>

              <ul className="mt-6 space-y-2.5 border-t border-ink-100 pt-5">
                {plan.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2.5">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <span className="text-sm text-pretty text-ink-700">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>

              {/* `mt-auto` pins the action to the bottom, so three cards with
                  different amounts of copy still line their buttons up. */}
              <div className="mt-auto pt-7">
                <ButtonLink
                  to={ROUTES.LOGIN}
                  variant={plan.featured ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  {plan.price === null
                    ? 'Request a quote'
                    : `Start on ${plan.name}`}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 font-mono text-xs text-pretty text-ink-500">
          Introductory pricing while the product is in build · billed monthly ·
          no per-module upsell · cancel any month and take your CSVs with you
        </p>

        {/* ── The fine print, as a real table ──────────────────────────── */}
        <div className="mt-16">
          <h3 className="type-wide text-xl font-bold text-ink-900">
            What each tier lets you configure
          </h3>
          <p className="mt-2 max-w-2xl text-pretty text-ink-600">
            Every row is a screen inside Settings. The tier decides which of
            them an admin can open.
          </p>

          {/*
            `overflow-x-auto` on the wrapper, not the page: a four-column
            comparison does not fit a 375px phone, and the honest fix is a
            table that scrolls inside its own box rather than a page that
            scrolls sideways.
          */}
          <div className="mt-6 overflow-x-auto rounded-card border border-ink-200 bg-surface shadow-card">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="sr-only">
                Configuration capabilities by subscription tier
              </caption>
              <thead>
                {/*
                  Deliberately not sticky. `overflow-x-auto` on the wrapper
                  makes it the scroll container in *both* axes, so a
                  `sticky top-0` header here would stick to a box that never
                  scrolls vertically — a no-op that reads like a feature. The
                  group rows below are what keep a reader oriented instead.
                */}
                <tr className="border-b border-ink-200 bg-surface">
                  <th scope="col" className="px-5 py-3">
                    <span className="type-label text-ink-400">Capability</span>
                  </th>
                  {PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      scope="col"
                      className="w-32 px-4 py-3 text-center"
                    >
                      <span
                        className={cn(
                          'type-label',
                          plan.featured ? 'text-brand-700' : 'text-ink-500',
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

                Grouping the rows in the markup — rather than dropping a styled
                <tr> between flat rows — is what makes "Lifecycle" read as a
                heading over four capabilities instead of as a fifth capability
                with no values.
              */}
              {MATRIX_GROUPS.map((group) => (
                <tbody key={group.id} className="divide-y divide-ink-100">
                  <tr className="border-t border-ink-200 bg-ink-50">
                    <th
                      scope="colgroup"
                      colSpan={PLANS.length + 1}
                      className="px-5 py-2 text-left"
                    >
                      <span className="type-label text-brand-700">
                        {group.label}
                      </span>
                    </th>
                  </tr>

                  {group.rows.map((row) => (
                    <tr key={row.id}>
                      <th scope="row" className="px-5 py-3 font-normal">
                        <span className="block text-sm font-medium text-ink-900">
                          {row.label}
                        </span>
                        <span className="mt-0.5 block font-mono text-[0.6875rem] text-ink-500">
                          {row.detail}
                        </span>
                      </th>
                      {PLANS.map((plan) => (
                        <td
                          key={plan.id}
                          className={cn(
                            'px-4 py-3 text-center',
                            plan.featured && 'bg-brand-50/40',
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
        </div>
      </Container>
    </section>
  )
}
