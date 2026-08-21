import type { ComponentType } from 'react'
import { Container } from '@/shared/components/layout/Container'
import { ShieldIcon, SparkIcon } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

/*
  Two columns that answer the same question from opposite ends: what will this
  thing do for me, and what will it do *to* me.

  Putting the AI claims and the safety guarantees side by side is the argument.
  A page that lists AI features and then buries the controls three sections
  down is asking the reader to take the second half on trust — and the second
  half is the half that is about trust.
*/

const ASSISTS = [
  {
    id: 'flags',
    title: 'Flags the day before you do',
    detail:
      'A missing check-out, a short day, a check-in from an unusual location — surfaced on the row with the record it read, not in a monthly exception report.',
  },
  {
    id: 'drafts',
    title: 'Drafts the remark, you sign it',
    detail:
      'Regularisation notes and rejection reasons come pre-written from the actual sessions. Edit or discard — nothing is submitted for you.',
  },
  {
    id: 'policy',
    title: 'Answers from your configuration',
    detail:
      '“How much sick leave do I have left on probation?” is answered from your leave types and your probation rules, not from a generic HR handbook.',
  },
  {
    id: 'context',
    title: 'Warns before an approval bites',
    detail:
      'Coverage clashes, overlapping leave in the same team and balances that will go negative are shown while the decision is still open.',
  },
] as const

const GUARANTEES = [
  {
    id: 'roles',
    title: 'Role-scoped, top to bottom',
    detail:
      'An employee sees their own record; a manager sees their reports; an admin sees the configuration. The permissions matrix is a setting, not a code change.',
  },
  {
    id: 'audit',
    title: 'Every change is attributable',
    detail:
      'Who changed what, when, and what it was before. Approvals, regularisations and configuration edits all leave a trail.',
  },
  {
    id: 'soft-delete',
    title: 'Nothing is really deleted',
    detail:
      'Removing someone deactivates the record. Attendance and leave history stay intact, which is what makes an audit survivable.',
  },
  {
    id: 'export',
    title: 'Your data leaves when you do',
    detail:
      'Every table exports to CSV on request. No ransom, no migration project, and your records are never training data.',
  },
] as const

/*
  The two halves, declared with an explicit type rather than inferred.

  Inference would give this array a *union* of two different readonly tuple
  types, and `.map()` over a union of arrays is exactly the shape TypeScript
  refuses to call. Naming the element type collapses it to one.
*/
interface AssistColumn {
  id: string
  Icon: ComponentType<{ className?: string }>
  label: string
  /** The promise the column makes, in one line under its title. */
  strap: string
  /** Jade for what it does, violet for what it may not. */
  accent: 'jade' | 'violet'
  items: readonly { id: string; title: string; detail: string }[]
}

const ACCENTS = {
  jade: {
    rule: 'bg-nx-jade',
    tile: 'bg-nx-jade-soft text-nx-jade-ink',
    label: 'text-nx-jade-ink',
    marker: 'bg-nx-jade',
  },
  violet: {
    rule: 'bg-nx-violet',
    tile: 'bg-nx-violet-soft text-nx-violet-ink',
    label: 'text-nx-violet-ink',
    marker: 'bg-nx-violet',
  },
} as const

const COLUMNS: readonly AssistColumn[] = [
  {
    id: 'assist',
    Icon: SparkIcon,
    label: 'What it does',
    strap: 'Four jobs, all of them narrow.',
    accent: 'jade',
    items: ASSISTS,
  },
  {
    id: 'trust',
    Icon: ShieldIcon,
    label: 'What it cannot do',
    strap: 'Four limits, none of them optional.',
    accent: 'violet',
    items: GUARANTEES,
  },
]

export function AiAndTrust() {
  return (
    <section
      id="assist"
      aria-labelledby="assist-heading"
      className="relative scroll-mt-8 py-20 sm:py-24"
    >
      <Container>
        <Reveal>
          <SectionHeading
            headingId="assist-heading"
            eyebrow="Assistance & control"
            title="AI that reads your register, not the internet"
            lead="The assist is useful because it is narrow: it only ever works from your own records and your own configuration, and it never takes the decision."
            tone="violet"
          />
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {COLUMNS.map((column, index) => {
            const accent = ACCENTS[column.accent]

            return (
              <Reveal key={column.id} delay={index * 100} className="h-full">
                <div className="flex h-full flex-col overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface shadow-nx-soft">
                  {/* The colour key, stated as a 3px rule across the top —
                      loud enough to sort the two halves at a glance, quiet
                      enough not to become the thing you look at. */}
                  <div className={cn('h-[3px] w-full', accent.rule)} />

                  <div className="flex-1 p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl',
                          accent.tile,
                        )}
                      >
                        <column.Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p
                          className={cn(
                            'type-tight text-lg font-bold',
                            accent.label,
                          )}
                        >
                          {column.label}
                        </p>
                        <p className="text-xs text-nx-faint">{column.strap}</p>
                      </div>
                    </div>

                    {/*
                      <dl>/<dt>/<dd>: each detail genuinely *describes* its
                      title, and the markup says so rather than leaving a
                      screen reader to infer it from two adjacent paragraphs.
                    */}
                    <dl className="mt-7 space-y-5">
                      {column.items.map((item) => (
                        <div key={item.id} className="flex gap-3.5">
                          <span
                            aria-hidden="true"
                            className={cn(
                              'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                              accent.marker,
                            )}
                          />
                          <div className="min-w-0">
                            <dt className="text-sm font-bold text-nx-ink">
                              {item.title}
                            </dt>
                            <dd className="mt-1 text-sm leading-relaxed text-pretty text-nx-muted">
                              {item.detail}
                            </dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <p className="mt-6 text-center text-sm text-pretty text-nx-faint">
          Need it to work differently? Configuration covers most of it, and we
          take the rest as a change request — being small is the point.
        </p>
      </Container>
    </section>
  )
}
