import { Container } from '@/shared/components/layout/Container'
import { ButtonLink } from '@/shared/components/ui/ButtonLink'
import { ROUTES } from '@/shared/constants/routes'

export function CtaBanner() {
  return (
    <section aria-labelledby="cta-heading" className="py-20 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-panel bg-panel px-6 py-16 sm:px-14">
          {/*
            The register ruling again, this time inverted for the dark panel —
            the `register-rules` utility draws in ink-200, which would be
            invisible here. Same rhythm, same idea, one page apart: that
            repetition is what makes a motif rather than an effect.
          */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            aria-hidden="true"
            style={{
              backgroundImage:
                'linear-gradient(to right, var(--color-panel-rule) 1px, transparent 1px), linear-gradient(to bottom, var(--color-panel-rule) 1px, transparent 1px)',
              backgroundSize: '3.5rem 3.5rem',
              maskImage:
                'radial-gradient(ellipse 80% 70% at 50% 0%, black, transparent)',
            }}
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <p className="type-label text-panel-mark">Ready when you are</p>

            <h2
              id="cta-heading"
              className="type-wide mt-4 text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl"
            >
              Give your HR team its afternoons back
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-lg text-pretty text-panel-muted">
              Start with the directory — the one record onboarding, attendance,
              leave and everything after them is built on.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink to={ROUTES.LOGIN} variant="accent" size="lg">
                Sign in to Unity Portal
              </ButtonLink>
              <ButtonLink
                to="#plans"
                size="lg"
                // A transparent button on a coloured band: the border carries
                // the shape. Passed as `className` rather than becoming a
                // seventh variant, because it is used exactly once.
                className="border border-panel-line bg-transparent text-white hover:bg-panel-hover"
              >
                Compare the plans
              </ButtonLink>
            </div>

            <p className="mt-8 font-mono text-xs text-panel-faint">
              ₹49 per employee / month · admin and employee access included ·
              payroll next
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
