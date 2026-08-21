import { useMemo, useState } from 'react'
import { Container } from '@/shared/components/layout/Container'
import { MODULE_ICONS } from '@/shared/components/ui/moduleIcons'
import { cn } from '@/shared/lib/cn'
import { FEATURES, MODULE_STATUSES } from '@/features/landing/data/features'
import type { ModuleStatus } from '@/features/landing/data/features'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE MODULE BOARD
  ─────────────────────────────────────────────────────────────────────────────
  The content is imported from `features/landing/data`, not copied.

  That is deliberate and it is the point of splitting the *design* into its own
  slice: two landing pages are being compared, and if they render two copies of
  the module list then the comparison is also comparing whichever copy somebody
  last remembered to update. One source, two presentations.

  Where the current page renders this as a single long list beside a sticky
  heading, this one is a filterable board. The filter is not decoration: the
  product ships eleven modules at three different stages of completion, and
  "show me only what is live today" is the first question a buyer mid-build
  actually asks. Answering it in one click is worth more than any amount of
  copy explaining the roadmap.
*/

/** The fields every module on the board draws from. */
const SHARED_RECORD = [
  'name',
  'contact',
  'location',
  'reporting line',
  'joining date',
  'shift pattern',
  'probation status',
  'access role',
] as const

/**
 * How each build state is labelled and toned.
 *
 * `live` is the quiet one on purpose. Shipped is the baseline — it is the two
 * unfinished states a buyer needs to spot from across the page, so marigold
 * goes on "in build" and "planned" gets no fill at all.
 */
const STATUS_PRESENTATION: Record<
  ModuleStatus,
  { label: string; chip: string; dot: string; tile: string }
> = {
  live: {
    label: 'Live',
    chip: 'bg-nx-jade-soft text-nx-jade-ink',
    dot: 'bg-nx-jade',
    tile: 'bg-nx-jade-soft text-nx-jade-ink',
  },
  building: {
    label: 'In build',
    chip: 'bg-nx-amber-soft text-nx-amber-ink',
    dot: 'bg-nx-amber',
    tile: 'bg-nx-amber-soft text-nx-amber-ink',
  },
  planned: {
    label: 'Planned',
    chip: 'bg-nx-bg text-nx-faint ring-1 ring-nx-line ring-inset',
    dot: 'bg-nx-line-strong',
    tile: 'bg-nx-bg text-nx-faint',
  },
}

/** `'all'` is a real filter value, not the absence of one. */
type Filter = ModuleStatus | 'all'

export function ModuleBoard() {
  const [filter, setFilter] = useState<Filter>('all')

  /*
    Counts come from the data rather than from a hand-written number beside
    each label. Move a module from `building` to `live` in features.ts and both
    the badge on the card and the count in the filter follow — there is no
    second place to remember.
  */
  const counts = useMemo(() => {
    const byStatus = {} as Record<ModuleStatus, number>
    for (const status of MODULE_STATUSES) {
      byStatus[status] = FEATURES.filter(
        (feature) => feature.status === status,
      ).length
    }
    return byStatus
  }, [])

  const shown = useMemo(
    () =>
      filter === 'all'
        ? FEATURES
        : FEATURES.filter((feature) => feature.status === filter),
    [filter],
  )

  const filters: readonly { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'Everything', count: FEATURES.length },
    ...MODULE_STATUSES.map((status) => ({
      id: status,
      label: STATUS_PRESENTATION[status].label,
      count: counts[status],
    })),
  ]

  return (
    <section
      id="modules"
      aria-labelledby="modules-heading"
      className="relative scroll-mt-8 py-20 sm:py-24"
    >
      <Container>
        <Reveal>
          <SectionHeading
            headingId="modules-heading"
            eyebrow="The shared record"
            title="Eleven modules, one employee record"
            lead="Nothing is entered twice, because there is only one place to enter it. Every card below reads the same row and writes back to it."
          />
        </Reveal>

        {/*
          ── The hub ───────────────────────────────────────────────────────
          The record itself, itemised and given the widest card on the page.

          This is the structural device the whole section rests on: the fields
          at the top, and every module underneath declaring which of them it
          reads. That relationship *is* the argument, so it is rendered as
          information — an arrow diagram of eleven boxes pointing at one box is
          unreadable on a phone and says less.
        */}
        <Reveal delay={80}>
          <div className="mt-12 overflow-hidden rounded-nx-lg bg-linear-to-r from-nx-jade-line via-nx-violet-line to-nx-amber-line p-px shadow-nx-soft">
            {/*
              A 1px gradient sheet with the card sitting on top of all but its
              edge: the cheapest way to draw a gradient border, and the only
              one that keeps a real background behind the content.
            */}
            <div className="rounded-[calc(var(--radius-nx-lg)-1px)] bg-nx-surface p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <p className="font-mono text-[0.6875rem] tracking-widest text-nx-faint uppercase">
                  employee record
                </p>
                <p className="text-sm text-nx-muted">
                  Written once. Read by all eleven.
                </p>
              </div>

              <ul className="mt-5 flex flex-wrap gap-2">
                {SHARED_RECORD.map((field) => (
                  <li
                    key={field}
                    className="rounded-lg bg-nx-bg px-2.5 py-1.5 font-mono text-xs text-nx-muted ring-1 ring-nx-line ring-inset"
                  >
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {/*
          ── The filter ────────────────────────────────────────────────────
          Real <button>s in a labelled group, not links and not a <select>.

          `aria-pressed` is the right state here because each one is a toggle
          that is currently on or off — unlike a tablist, where the widget owns
          a selection. It also means the buttons keep working as buttons: space
          and enter both fire, and nothing about the page navigates.
        */}
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Filter modules by build status"
            className="flex flex-wrap gap-1.5"
          >
            {filters.map((option) => {
              const isActive = option.id === filter

              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setFilter(option.id)}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-nx-ink text-nx-bg'
                      : 'bg-nx-surface text-nx-muted ring-1 ring-nx-line ring-inset hover:text-nx-ink hover:ring-nx-line-strong',
                  )}
                >
                  {option.label}
                  <span
                    className={cn(
                      'font-mono text-[0.6875rem]',
                      isActive ? 'text-nx-bg/70' : 'text-nx-faint',
                    )}
                  >
                    {option.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/*
            Said once, plainly, right beside the control that makes it
            checkable. A roadmap disclosed on the landing page is a smaller
            problem than a roadmap discovered during the trial.
          */}
          <p className="ml-auto text-sm text-pretty text-nx-faint">
            We are mid-build and we label it.
          </p>
        </div>

        {/*
          `aria-live="polite"` announces the new count after a filter click.
          Without it the change is silent for a screen-reader user: the button
          says "pressed" and nothing explains that two thirds of the page just
          disappeared.
        */}
        <p aria-live="polite" className="sr-only">
          Showing {shown.length} of {FEATURES.length} modules.
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((feature, index) => {
            /*
              The glyph is looked up from the module id, so the data file stays
              plain data — and TypeScript rejects a module whose id has no
              icon, which is the kind of mistake that otherwise ships as an
              invisible gap in a card.
            */
            const Icon = MODULE_ICONS[feature.id]
            const status = STATUS_PRESENTATION[feature.status]

            return (
              /*
                `key={feature.id}` — a stable identity, never the array index.
                It matters more here than usual: filtering reorders and removes
                items, and with index keys React would reuse the wrong node, so
                a card's reveal animation would land on its neighbour.
              */
              <li key={feature.id}>
                <Reveal
                  /* Capped, so re-filtering never runs a half-second cascade. */
                  delay={Math.min(index, 6) * 45}
                  className="h-full"
                >
                  <article className="group flex h-full flex-col rounded-nx border border-nx-line bg-nx-surface p-5 shadow-nx-soft transition-[border-color,box-shadow,translate] duration-300 ease-out-quart hover:-translate-y-1 hover:border-nx-jade-line hover:shadow-nx-lift">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 ease-out-quart group-hover:scale-105',
                          status.tile,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold',
                          status.chip,
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            status.dot,
                          )}
                        />
                        {status.label}
                      </span>
                    </div>

                    <h3 className="type-tight mt-4 text-base font-bold text-nx-ink">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-pretty text-nx-muted">
                      {feature.description}
                    </p>

                    {/* `mt-auto` pins the footer down, so cards with two lines
                        of copy and cards with four still line their rules up. */}
                    <div className="mt-auto border-t border-nx-line pt-4">
                      <p className="font-mono text-[0.625rem] tracking-widest text-nx-faint uppercase">
                        reads
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {feature.reads.map((field) => (
                          <li
                            key={field}
                            className="rounded-md bg-nx-bg px-2 py-0.5 font-mono text-[0.6875rem] text-nx-muted"
                          >
                            {field}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </Reveal>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
