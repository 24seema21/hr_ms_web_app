import { Container } from '@/shared/components/layout/Container'
import { MODULE_ICONS } from '@/shared/components/ui/moduleIcons'
import { FEATURES } from '../data/features'

/** The fields every module in the list below draws from. */
const SHARED_RECORD = [
  'name',
  'contact',
  'location',
  'reporting line',
  'shift pattern',
  'salary structure',
] as const

export function ModuleIndex() {
  return (
    /*
      `id="modules"` is the target of the header's "#modules" anchor.
      `aria-labelledby` ties this section to its own heading, so a screen
      reader announces "Modules, region" instead of just "region".
    */
    <section
      id="modules"
      aria-labelledby="modules-heading"
      className="border-b border-ink-200 py-20 sm:py-24"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          {/*
            Sticky on desktop: the module list is roughly twice the height of
            this column, and a heading that scrolls away leaves the reader
            halfway down a list of "reads: attendance · leave" lines with
            nothing left on screen to say what they are reading from.
          */}
          <div className="lg:sticky lg:top-24 lg:col-span-5">
            <p className="type-label text-brand-600">The shared record</p>
            <h2
              id="modules-heading"
              className="type-wide mt-4 text-3xl font-bold tracking-tight text-balance text-ink-900 sm:text-4xl"
            >
              Six modules, one employee record
            </h2>
            <p className="mt-5 max-w-md text-lg text-pretty text-ink-600">
              Nothing is entered twice, because there is only one place to enter
              it. Each module below reads the same row and writes back to it.
            </p>

            {/*
              The record itself, itemised.

              This is the structural device the section is built on: the list
              of fields at the top, and every module underneath declaring which
              of them it reads. That relationship is the argument — so it is
              rendered as information rather than illustrated with an arrow
              diagram nobody can read on a phone.
            */}
            <div className="mt-8 rounded-card border border-ink-200 bg-surface p-5 shadow-card">
              <p className="type-label text-ink-400">employee record</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {SHARED_RECORD.map((field) => (
                  <li
                    key={field}
                    className="rounded-md bg-brand-50 px-2 py-1 font-mono text-xs text-brand-700"
                  >
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="lg:col-span-7">
            {FEATURES.map((feature) => {
              /*
                The glyph is looked up from the module id, so `features.ts`
                stays a data file with no JSX in it — and TypeScript rejects a
                module whose id has no icon, which is the kind of mistake that
                otherwise ships as an invisible gap in a card.
              */
              const Icon = MODULE_ICONS[feature.id]

              return (
                /*
                  `key={feature.id}` — a stable identity, never the array index.
                  See the comment on `Feature.id` in ../data/features.ts for
                  what actually breaks when you reach for the index.
                */
                <li
                  key={feature.id}
                  className="group flex gap-4 border-t border-ink-200 py-6 first:border-t-0 first:pt-0 sm:gap-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card border border-ink-200 bg-surface text-brand-600 shadow-card transition-colors duration-200 group-hover:border-brand-200 group-hover:bg-brand-50">
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <h3 className="type-wide text-base font-semibold text-ink-900">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-pretty text-ink-600">
                      {feature.description}
                    </p>

                    <p className="mt-3 font-mono text-xs text-ink-500">
                      <span className="text-ink-400">reads</span>{' '}
                      {feature.reads.join(' · ')}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </Container>
    </section>
  )
}
