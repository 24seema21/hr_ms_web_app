import { Container } from '@/shared/components/layout/Container'

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
      'Leave types, shift patterns, approval chains and salary components — configured once, applied everywhere automatically.',
  },
  {
    id: 'run',
    title: 'Go live',
    description:
      'Managers approve from their inbox, employees self-serve from their phone, and payroll reconciles itself at month end.',
  },
] as const

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="bg-ink-50 py-20 sm:py-24"
    >
      <Container>
        <div className="max-w-2xl">
          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl"
          >
            Live in an afternoon
          </h2>
          <p className="mt-4 text-lg text-pretty text-ink-600">
            No implementation consultants, no six-week onboarding project.
          </p>
        </div>

        {/*
          An <ol> because the order is the meaning — step 2 genuinely follows
          step 1. A screen reader announces "list of 3 items, item 1 of 3",
          which a stack of <div>s would never convey.
        */}
        <ol className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.id} className="relative">
              {/*
                The number is derived from position, which is fine — it is
                *display* only. The `key` above still uses the stable id.
              */}
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <h3 className="mt-5 text-base font-semibold text-ink-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-pretty text-ink-600">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
