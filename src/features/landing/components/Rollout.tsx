import { Container } from '@/shared/components/layout/Container'

const STEPS = [
  {
    id: 'import',
    marker: '01',
    title: 'Import your people',
    description:
      'Upload a spreadsheet or connect your existing system. We map the columns and flag anything that looks wrong before it lands.',
  },
  {
    id: 'configure',
    marker: '02',
    title: 'Set your policies',
    description:
      'Leave types, working weeks, probation rules, onboarding stages and approval chains — configured once, applied to everyone automatically.',
  },
  {
    id: 'run',
    marker: '03',
    title: 'Go live',
    description:
      'Admins run the configuration, managers approve from the queue, employees self-serve from their phone. No consultant on site.',
  },
] as const

/*
  What being early actually means, stated as three commitments rather than an
  apology.

  The product is mid-build and the page says so twice already; this is the
  section that turns that into the reason to sign rather than the reason to
  wait. Every line here is something a large vendor structurally cannot offer,
  which is the only honest advantage a small one has.
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
      className="border-b border-ink-200 bg-shell py-20 sm:py-24"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="type-label text-brand-600">Rollout</p>
          <h2
            id="rollout-heading"
            className="type-wide mt-4 text-3xl font-bold tracking-tight text-balance text-ink-900 sm:text-4xl"
          >
            Live in an afternoon
          </h2>
          <p className="mt-5 text-lg text-pretty text-ink-600">
            No implementation consultants, no six-week onboarding project.
          </p>
        </div>

        {/*
          An <ol> because the order is the meaning — step 2 genuinely follows
          step 1, which is also the only reason these carry numbers. A screen
          reader announces "list of 3 items, item 1 of 3", which a stack of
          <div>s would never convey.
        */}
        <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-ink-200 bg-ink-200 md:grid-cols-3">
          {STEPS.map((step) => (
            /*
              The 1px gap over an ink background is the hairline: one border
              between every pair of cells, and no doubled-up edges where they
              meet. Borders on each cell instead would render 2px seams down
              the middle and 1px at the outside — the classic uneven grid.
            */
            <li key={step.id} className="bg-surface p-6 sm:p-7">
              <span className="type-label text-accent-600" aria-hidden="true">
                Step {step.marker}
              </span>
              <h3 className="type-wide mt-3 text-base font-semibold text-ink-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-pretty text-ink-600">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 border-t border-ink-300 pt-8">
          <p className="type-label text-ink-500">Coming in early</p>
          <dl className="mt-5 grid gap-6 sm:grid-cols-3">
            {EARLY_TERMS.map((term) => (
              /*
                <dl>/<dt>/<dd>: each description genuinely *describes* its
                term, and the markup says so rather than leaving a screen
                reader to infer it from two adjacent paragraphs.
              */
              <div key={term.id}>
                <dt className="text-sm font-semibold text-ink-900">
                  {term.title}
                </dt>
                <dd className="mt-1.5 text-sm text-pretty text-ink-600">
                  {term.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  )
}
