import { Container } from '@/shared/components/layout/Container'
import { FEATURES } from '../data/features'

export function FeatureGrid() {
  return (
    /*
      `id="features"` is the target of the header's "#features" anchor.
      `aria-labelledby` ties this section to its own heading, so a screen
      reader announces "Features, region" instead of just "region".
    */
    <section id="features" aria-labelledby="features-heading" className="py-20 sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl"
          >
            Six modules, one employee record
          </h2>
          <p className="mt-4 text-lg text-pretty text-ink-600">
            Each module reads from the same data, so a leave approval updates
            attendance, and attendance feeds payroll. Nothing is entered twice.
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            /*
              `key={feature.id}` — a stable identity, never the array index.
              See the comment on `Feature.id` in ../data/features.ts for what
              actually breaks when you reach for the index.
            */
            <li
              key={feature.id}
              className="rounded-card border border-ink-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d={feature.iconPath} />
                </svg>
              </span>

              <h3 className="mt-5 text-base font-semibold text-ink-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-pretty text-ink-600">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
