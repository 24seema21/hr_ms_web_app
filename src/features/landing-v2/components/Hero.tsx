import { Container } from '@/shared/components/layout/Container'
import { ROUTES } from '@/shared/constants/routes'
import { ActionLink } from './ActionLink'
import { WorkspacePreview } from './WorkspacePreview'

/*
  Three numbers under the headline, kept to three.

  They are the pitch compressed: one bill, one record, both audiences. A fourth
  turns a claim into a stat block, which is the thing every SaaS hero does and
  nobody reads.
*/
const PROOF_POINTS = [
  { id: 'price', value: '₹49', label: 'per employee / month' },
  { id: 'modules', value: '11', label: 'modules, one record' },
  { id: 'access', value: '2', label: 'ways in — admin, employee' },
] as const

export function Hero() {
  return (
    <section
      id="start"
      aria-labelledby="hero-heading"
      className="relative scroll-mt-8 pt-14 pb-20 sm:pt-20 sm:pb-28"
    >
      <Container>
        {/*
          Centred, where the current page sets the hero as two columns.

          The reason is the picture underneath: the workspace panel wants the
          full measure to be legible, and a headline beside it would squeeze it
          to half. Centring the copy and giving the panel the whole width lets
          the type get genuinely large and the screenshot stay readable — the
          two things a hero is actually for.
        */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-nx-jade-soft px-3.5 py-1.5 text-xs font-semibold text-nx-jade-ink ring-1 ring-nx-jade-line ring-inset">
            {/* The pulse: the product is being built right now, and this is the
                one place on the page that says so without words. */}
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nx-jade opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nx-jade" />
            </span>
            AI-augmented HRMS · in active build
          </p>

          {/*
            The one and only <h1> on the page. A page with several (or none)
            leaves a screen-reader user without a reliable "what is this?"
            anchor, and a search engine guessing.

            The gradient falls on the second clause rather than the whole line:
            "in one register" is the claim being made, and colouring the entire
            headline would emphasise nothing at all.
          */}
          <h1
            id="hero-heading"
            className="type-tight mt-7 text-nx-hero font-extrabold text-balance text-nx-ink"
          >
            First day to last,{' '}
            <span className="bg-linear-to-r from-nx-jade via-nx-violet to-nx-jade bg-clip-text text-transparent">
              in one register
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-nx-muted sm:text-xl">
            Unity Portal runs onboarding, attendance, leave, assets, tickets and
            goals off a single employee record. Admins configure it, employees
            self-serve on it, and the whole thing costs less than the licence
            fee on one enterprise seat.
          </p>

          {/*
            `flex-col` first, `sm:flex-row` after — mobile-first. We describe
            the small screen as the default and add complexity as the viewport
            grows, which is why nothing overflows at 375px.
          */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ActionLink to={ROUTES.LOGIN} size="lg">
              Sign in to your workspace
            </ActionLink>
            <ActionLink to="#screens" variant="ghost" size="lg">
              See the screens
            </ActionLink>
          </div>

          <dl className="mt-12 flex flex-wrap items-start justify-center gap-x-10 gap-y-6">
            {PROOF_POINTS.map((point) => (
              /*
                <dt> is the *term* and <dd> the description, so the number goes
                in the <dd> and the words in the <dt> — reversed visually with
                `flex-col-reverse` rather than by swapping the tags, which
                would leave a screen reader reading "₹49" as the thing being
                described.
              */
              <div
                key={point.id}
                className="flex flex-col-reverse items-center gap-1"
              >
                <dt className="font-mono text-[0.6875rem] text-nx-faint">
                  {point.label}
                </dt>
                <dd className="type-tight text-3xl font-extrabold text-nx-ink">
                  {point.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-14 sm:mt-16">
          <WorkspacePreview />
        </div>
      </Container>
    </section>
  )
}
