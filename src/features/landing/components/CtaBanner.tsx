import { Container } from '@/shared/components/layout/Container'
import { ButtonLink } from '@/shared/components/ui/ButtonLink'
import { ROUTES } from '@/shared/constants/routes'

export function CtaBanner() {
  return (
    <section aria-labelledby="cta-heading" className="py-20 sm:py-24">
      <Container>
        <div className="rounded-card bg-brand-700 px-6 py-14 text-center sm:px-14">
          <h2
            id="cta-heading"
            className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl"
          >
            Give your HR team its afternoons back
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-brand-100">
            Sign in to your workspace, or use the demo credentials on the login
            page to look around first.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink to={ROUTES.LOGIN} variant="inverse" size="lg">
              Sign in
            </ButtonLink>
            <ButtonLink
              to="#features"
              size="lg"
              // A transparent button on a coloured band: the border carries the
              // shape. Passed as `className` rather than becoming a fifth
              // variant, because it is used exactly once.
              className="border border-brand-400 bg-transparent text-white hover:bg-brand-600"
            >
              See what is included
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  )
}
