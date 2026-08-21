import { Container } from '@/shared/components/layout/Container'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

/*
  Getting live, in three steps that genuinely happen in this order — which is
  the only reason they carry numbers. The module board above deliberately has
  none: eleven modules are a set, and numbering a set is decoration.
*/
const STEPS = [
  {
    id: 'import',
    title: 'Import your people',
    description:
      'Upload a spreadsheet or connect your existing system. We map the columns and flag anything that looks wrong before it lands.',
  },
  {
    id: 'configure',
    title: 'Set your policies',
    description:
      'Leave types, working weeks, probation rules, onboarding stages and approval chains — configured once, applied to everyone automatically.',
  },
  {
    id: 'run',
    title: 'Go live',
    description:
      'Admins run the configuration, managers approve from the queue, employees self-serve from their phone. No consultant on site.',
  },
] as const

/*
  What being early actually means, stated as three commitments rather than an
  apology.

  The product is mid-build and the page has said so twice already; this is the
  part that turns that into the reason to sign rather than the reason to wait.
  Every line here is something a large vendor structurally cannot offer, which
  is the only honest advantage a small one has.
*/
const EARLY_TERMS = [
  {
    id: 'shape',
    title: 'You shape what ships next',
    description:
      'Early customers set the roadmap order. Payroll is next; what follows it is decided by the people already using this.',
  },
  {
    id: 'changes',
    title: 'Change requests, not tickets',
    description:
      'Configuration covers most needs. When it does not, the change is scoped with you directly — there is no queue behind a partner network.',
  },
  {
    id: 'price',
    title: 'Your price is held',
    description:
      'Introductory pricing stays yours as modules ship. The bill does not grow when assets, tickets and goals come out of build.',
  },
] as const

export function Rollout() {
  return (
    <section
      id="rollout"
      aria-labelledby="rollout-heading"
      className="relative scroll-mt-8 py-20 sm:py-24"
    >
      <Container>
        <Reveal>
          <SectionHeading
            headingId="rollout-heading"
            eyebrow="Rollout"
            title="Live in an afternoon"
            lead="No implementation consultants, no six-week onboarding project — the three things below are the whole of it."
          />
        </Reveal>

        {/*
          An <ol> because the order is the meaning: step 2 genuinely follows
          step 1. A screen reader announces "list of 3 items, item 1 of 3",
          which a stack of <div>s would never convey.
        */}
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.id}>
              <Reveal delay={index * 80} className="h-full">
                <div className="group h-full rounded-nx-lg border border-nx-line bg-nx-surface p-6 shadow-nx-soft transition-[border-color,box-shadow,translate] duration-300 ease-out-quart hover:-translate-y-1 hover:border-nx-jade-line hover:shadow-nx-lift sm:p-7">
                  {/*
                    The numeral is set large and hollow — a gradient clipped to
                    the glyph — so it reads as a marker on the page rather than
                    as a value in the copy. `aria-hidden` because the <ol>
                    already numbers these for anyone listening.
                  */}
                  <span
                    aria-hidden="true"
                    className="type-tight block bg-linear-to-br from-nx-jade to-nx-violet bg-clip-text text-5xl font-extrabold text-transparent"
                  >
                    {index + 1}
                  </span>

                  <h3 className="type-tight mt-4 text-base font-bold text-nx-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-pretty text-nx-muted">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal delay={120}>
          <div className="mt-12 rounded-nx-lg border border-nx-line bg-nx-surface/60 p-6 sm:p-8">
            <p className="text-xs font-bold tracking-wide text-nx-violet-ink uppercase">
              Coming in early
            </p>

            <dl className="mt-6 grid gap-6 sm:grid-cols-3">
              {EARLY_TERMS.map((term) => (
                /*
                  <dl>/<dt>/<dd>: each description genuinely *describes* its
                  term, and the markup says so rather than leaving a screen
                  reader to infer it from two adjacent paragraphs.
                */
                <div key={term.id}>
                  <dt className="text-sm font-bold text-nx-ink">
                    {term.title}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-pretty text-nx-muted">
                    {term.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
