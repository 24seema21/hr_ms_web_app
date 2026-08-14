import type { ComponentType } from 'react'
import { Container } from '@/shared/components/layout/Container'
import { ShieldIcon, SparkIcon } from '@/shared/components/ui/icons'

/*
  Two columns that answer the same question from opposite ends: what will this
  thing do for me, and what will it do *to* me.

  Putting the AI claims and the safety guarantees side by side is the argument.
  A page that lists AI features and then buries the controls three sections
  down is asking the reader to take the second half on trust.
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
  items: readonly { id: string; title: string; detail: string }[]
}

const COLUMNS: readonly AssistColumn[] = [
  { id: 'assist', Icon: SparkIcon, label: 'What it does', items: ASSISTS },
  {
    id: 'trust',
    Icon: ShieldIcon,
    label: 'What it cannot do',
    items: GUARANTEES,
  },
]

export function AiAndTrust() {
  return (
    <section
      id="assist"
      aria-labelledby="assist-heading"
      className="border-b border-ink-200 bg-shell py-20 sm:py-24"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="type-label text-brand-600">Assistance & control</p>
          <h2
            id="assist-heading"
            className="type-wide mt-4 text-3xl font-bold tracking-tight text-balance text-ink-900 sm:text-4xl"
          >
            AI that reads your register, not the internet
          </h2>
          <p className="mt-5 text-lg text-pretty text-ink-600">
            The assist is useful because it is narrow: it only ever works from
            your own records and your own configuration, and it never takes the
            decision.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-card border border-ink-200 bg-ink-200 lg:grid-cols-2">
          {/*
            The 1px gap over an ink background is the hairline: one border
            between the two halves, and no doubled-up edge where they meet.
          */}
          {COLUMNS.map((column) => (
            <div key={column.id} className="bg-surface p-6 sm:p-8">
              <p className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-card bg-brand-50 text-brand-600">
                  <column.Icon className="h-4 w-4" />
                </span>
                <span className="type-label text-ink-500">{column.label}</span>
              </p>

              <dl className="mt-6 space-y-5">
                {column.items.map((item) => (
                  <div key={item.id}>
                    <dt className="text-sm font-semibold text-ink-900">
                      {item.title}
                    </dt>
                    <dd className="mt-1.5 text-sm text-pretty text-ink-600">
                      {item.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <p className="mt-6 font-mono text-xs text-pretty text-ink-500">
          Need it to work differently? Configuration covers most of it, and we
          take the rest as a change request — being small is the point.
        </p>
      </Container>
    </section>
  )
}
