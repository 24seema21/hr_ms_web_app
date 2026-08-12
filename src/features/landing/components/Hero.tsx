import { Container } from '@/shared/components/layout/Container'
import { ButtonLink } from '@/shared/components/ui/ButtonLink'
import { ROUTES } from '@/shared/constants/routes'
import { RosterGrid } from './RosterGrid'

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
              HR · payroll · people ops
            </p>

            {/*
              The one and only <h1> on this page. A page with several <h1>s (or
              none) leaves screen-reader users without a reliable "what is this
              page?" anchor, and search engines guessing.
            */}
            <h1 className="type-wide mt-6 text-hero font-bold text-balance text-ink-900">
              The register every HR module writes in
            </h1>

            <p className="mt-6 max-w-lg text-lg text-pretty text-ink-600">
              Directory, attendance, leave and payroll all read the same
              employee record. Approve one leave request and the timesheet, the
              balance and next month's payslip already agree.
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
              <ButtonLink to="#modules" variant="secondary" size="lg">
                See the six modules
              </ButtonLink>
            </div>

            <p className="mt-6 font-mono text-xs text-ink-500">
              One record per person · no re-keying between modules
            </p>
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
