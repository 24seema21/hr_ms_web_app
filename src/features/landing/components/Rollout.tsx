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
      'Leave types, shift patterns, approval chains and salary components — configured once, applied everywhere automatically.',
  },
  {
    id: 'run',
    marker: '03',
    title: 'Go live',
    description:
      'Managers approve from their inbox, employees self-serve from their phone, and payroll reconciles itself at month end.',
  },
] as const

/*
  Three promises about the data, and each one is a real property of the system
  rather than a slogan: DELETE is a deactivation, so history survives; every
  module reads one row; the export is the customer's own data.
*/
const DATA_RULES = [
  {
    id: 'soft-delete',
    title: 'Nothing is really deleted',
    description:
      'Removing someone deactivates the record. Payroll and attendance history stay intact and auditable.',
  },
  {
    id: 'single-record',
    title: 'One row, six readers',
    description:
      'Modules never keep their own copy of an employee, so they cannot disagree about one.',
  },
  {
    id: 'export',
    title: 'Your data leaves when you do',
    description:
      'Every table exports to CSV on request. No ransom, no migration project, no support ticket.',
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
            <li key={step.id} className="bg-white p-6 sm:p-7">
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
          <p className="type-label text-ink-500">And once you are in</p>
          <dl className="mt-5 grid gap-6 sm:grid-cols-3">
            {DATA_RULES.map((rule) => (
              /*
                <dl>/<dt>/<dd>: each description genuinely *describes* its
                term, and the markup says so rather than leaving a screen
                reader to infer it from two adjacent paragraphs.
              */
              <div key={rule.id}>
                <dt className="text-sm font-semibold text-ink-900">
                  {rule.title}
                </dt>
                <dd className="mt-1.5 text-sm text-pretty text-ink-600">
                  {rule.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  )
}
