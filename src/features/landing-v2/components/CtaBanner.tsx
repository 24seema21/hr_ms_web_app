import { Container } from '@/shared/components/layout/Container'
import { ROUTES } from '@/shared/constants/routes'
import { ActionLink } from './ActionLink'
import { Reveal } from './Reveal'

export function CtaBanner() {
  return (
    <section aria-labelledby="cta-heading" className="relative py-20 sm:py-24">
      <Container>
        <Reveal>
          {/*
            The one saturated surface on the page.

            Everything above it is white cards over a pale aurora; this band is
            the aurora brought fully forward, and it lands hard precisely
            because nothing before it did. Fixed hues rather than tokens that
            flip — the panel is dark in both themes, which is what lets the
            white button on it stay white.
          */}
          <div className="relative overflow-hidden rounded-nx-xl bg-linear-to-br from-[#0b3f33] via-[#123a5c] to-[#2b2560] px-6 py-16 shadow-nx-hero sm:px-14">
            {/* Two soft lights inside the panel, so the gradient reads as a
                lit surface rather than as a flat ramp. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-nx-jade opacity-30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-nx-violet opacity-30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="nx-noise pointer-events-none absolute inset-0 opacity-[0.05]"
            />

            <div className="relative mx-auto max-w-2xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 ring-inset">
                Ready when you are
              </p>

              <h2
                id="cta-heading"
                className="type-tight mt-6 text-nx-title font-extrabold text-balance text-white"
              >
                Give your HR team its afternoons back
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-pretty text-white/70">
                Start with the directory — the one record onboarding,
                attendance, leave and everything after them is built on.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <ActionLink to={ROUTES.LOGIN} variant="inverse" size="lg">
                  Sign in to Unity Portal
                </ActionLink>
                <ActionLink to="#pricing" variant="outline" size="lg">
                  Compare the plans
                </ActionLink>
              </div>

              <p className="mt-8 font-mono text-xs text-white/50">
                ₹49 per employee / month · admin and employee access included ·
                payroll next
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
