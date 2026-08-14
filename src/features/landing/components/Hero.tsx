import { Container } from '@/shared/components/layout/Container'
import { ButtonLink } from '@/shared/components/ui/ButtonLink'
import { ROUTES } from '@/shared/constants/routes'
import { RosterGrid } from './RosterGrid'

/*
  Three numbers under the fold-line, kept to three.

  They are the pitch compressed: one bill, one record, both audiences. A fourth
  would turn a claim into a stat block, which is the thing every SaaS hero
  does and nobody reads.
*/
const PROOF_POINTS = [
  { id: 'price', value: '₹49', label: 'per employee / month' },
  { id: 'modules', value: '11', label: 'modules, one record' },
  { id: 'access', value: '2', label: 'ways in — admin, employee' },
] as const

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-200 bg-paper">
      {/*
        The ruled ground of a register page, behind everything and faded out
        before it reaches the content. Purely decorative, so it is hidden from
        the accessibility tree and sits at a z-index below the text.
      */}
      <div
        className="register-rules pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      />

      <Container className="relative py-14 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="type-label inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
              AI-augmented HRMS · in active build
            </p>

            {/*
              The one and only <h1> on this page. A page with several <h1>s (or
              none) leaves screen-reader users without a reliable "what is this
              page?" anchor, and search engines guessing.
            */}
            <h1 className="type-wide mt-6 text-hero font-bold text-balance text-ink-900">
              First day to last, in one register
            </h1>

            <p className="mt-6 max-w-lg text-lg text-pretty text-ink-600">
              Unity Portal runs onboarding, attendance, leave, assets, tickets
              and goals off a single employee record. Admins configure it,
              employees self-serve on it, and the whole thing costs less than
              the licence fee on one enterprise seat.
            </p>

            {/*
              `flex-col` first, `sm:flex-row` after — mobile-first. We describe
              the small screen as the default and only add complexity as the
              viewport grows, which is why nothing overflows at 375px.
            */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to={ROUTES.LOGIN} size="lg">
                Sign in to your workspace
              </ButtonLink>
              <ButtonLink to="#tour" variant="secondary" size="lg">
                See the screens
              </ButtonLink>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-ink-200 pt-6">
              {PROOF_POINTS.map((point) => (
                /*
                  <dt> is the *term* and <dd> the description, so the number
                  goes in the <dd> and the words in the <dt> — visually
                  reversed with `flex-col-reverse` rather than by swapping the
                  tags, which would leave a screen reader reading "₹49" as the
                  thing being described.
                */
                <div key={point.id} className="flex flex-col-reverse gap-1">
                  <dt className="font-mono text-[0.6875rem] text-pretty text-ink-500">
                    {point.label}
                  </dt>
                  <dd className="type-wide text-2xl font-bold text-ink-900">
                    {point.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/*
            The signature element gets the larger half of the grid and sits
            beside the copy on desktop, under it on mobile — where a fortnight
            of marks still reads as a register, just a narrower one.
          */}
          <div className="lg:col-span-7">
            <RosterGrid />
          </div>
        </div>
      </Container>
    </section>
  )
}
