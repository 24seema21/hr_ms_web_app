import { SparkIcon } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'
import {
  ScreenCard,
  ScreenChrome,
  ScreenLabel,
  ScreenPill,
} from './ScreenChrome'

/*
  A static picture of the leave screen: the balance ledger an employee checks
  before applying, and the queue a manager works through.
*/

/**
 * One row of the entitlement ledger.
 *
 * `used` and `scheduled` are tracked apart on purpose — days already taken and
 * days approved for next month are both spoken for, but only one of them can
 * still be cancelled, and an employee planning December needs to see which.
 * The meter stacks them for the same reason.
 */
const BALANCES = [
  {
    id: 'earned',
    name: 'Earned',
    available: 10,
    entitled: 18,
    used: 6,
    scheduled: 2,
    fill: 'bg-chart-earned',
    track: 'bg-chart-earned-track',
  },
  {
    id: 'casual',
    name: 'Casual',
    available: 3,
    entitled: 8,
    used: 5,
    scheduled: 0,
    fill: 'bg-chart-casual',
    track: 'bg-chart-casual-track',
  },
  {
    id: 'sick',
    name: 'Sick',
    available: 8,
    entitled: 10,
    used: 2,
    scheduled: 0,
    fill: 'bg-chart-sick',
    track: 'bg-chart-sick-track',
  },
  {
    id: 'unpaid',
    name: 'Unpaid',
    available: null,
    entitled: null,
    used: 0,
    scheduled: 0,
    fill: 'bg-chart-unpaid',
    track: 'bg-chart-unpaid-track',
  },
] as const

const REQUESTS = [
  {
    id: 'q1',
    who: 'Rahul Nair',
    initials: 'RN',
    type: 'Earned',
    dates: '08–12 Sep',
    days: '5d',
    status: 'Pending',
    tone: 'accent',
  },
  {
    id: 'q2',
    who: 'Sana Qureshi',
    initials: 'SQ',
    type: 'Sick',
    dates: '21 Aug',
    days: '1d',
    status: 'Approved',
    tone: 'success',
  },
  {
    id: 'q3',
    who: 'Dev Kulkarni',
    initials: 'DK',
    type: 'Casual',
    dates: '29 Aug',
    days: '0.5d',
    status: 'Pending',
    tone: 'accent',
  },
  {
    id: 'q4',
    who: 'Meera Iyer',
    initials: 'MI',
    type: 'Earned',
    dates: '02–03 Sep',
    days: '2d',
    status: 'Rejected',
    tone: 'danger',
  },
] as const

export function LeaveScreen() {
  return (
    <ScreenChrome
      activeNav="Leave"
      title="Leave"
      subtitle="2026 ledger · 4 requests awaiting you"
      action={
        <span className="inline-flex h-8 items-center rounded-control bg-brand-600 px-3 text-xs font-medium text-on-brand">
          Apply for leave
        </span>
      }
    >
      <div className="grid gap-3 lg:grid-cols-5">
        {/* ── Balances ─────────────────────────────────────────────────── */}
        <ScreenCard className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <ScreenLabel>Your balance</ScreenLabel>
            <span className="font-mono text-[0.625rem] text-ink-500">
              as at 20 Aug
            </span>
          </div>

          <ul className="mt-3 space-y-3.5">
            {BALANCES.map((balance) => {
              /*
                Unpaid leave has no ceiling, so it has no meter — a bar with
                nothing to fill against would be a decoration that implies a
                limit the policy does not have.
              */
              const hasCeiling = balance.entitled !== null

              return (
                <li key={balance.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-ink-800">
                      {balance.name}
                    </span>
                    <span className="font-mono text-xs text-ink-500">
                      {hasCeiling ? (
                        <>
                          <span className="text-sm font-semibold text-ink-900">
                            {balance.available}
                          </span>
                          {' / '}
                          {balance.entitled} days
                        </>
                      ) : (
                        'no cap'
                      )}
                    </span>
                  </div>

                  {/* Narrowed on the property rather than on `hasCeiling`, so
                      the divisions below are provably not against `null`. */}
                  {balance.entitled !== null && (
                    <div
                      aria-hidden="true"
                      className={cn(
                        'mt-1.5 flex h-1.5 overflow-hidden rounded-full',
                        balance.track,
                      )}
                    >
                      {/* Taken, then committed: the same ink at two opacities,
                          so the meter reads as one quantity in two states
                          rather than as two unrelated colours. */}
                      <span
                        className={cn('h-full', balance.fill)}
                        style={{
                          width: `${(balance.used / balance.entitled) * 100}%`,
                        }}
                      />
                      <span
                        className={cn('h-full opacity-45', balance.fill)}
                        style={{
                          width: `${(balance.scheduled / balance.entitled) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <p className="mt-4 border-t border-ink-100 pt-3 font-mono text-[0.625rem] text-ink-500">
            solid = taken · faded = approved, upcoming
          </p>
        </ScreenCard>

        {/* ── The approval queue ───────────────────────────────────────── */}
        <ScreenCard className="lg:col-span-3">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5">
            <ScreenLabel>Requests to you</ScreenLabel>
            <span className="font-mono text-[0.625rem] text-ink-500">
              your reports · 6 people
            </span>
          </div>

          <ul className="divide-y divide-ink-100">
            {REQUESTS.map((request) => (
              <li key={request.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="type-label flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  {request.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-ink-900">
                    {request.who}
                  </span>
                  <span className="block font-mono text-[0.625rem] text-ink-500">
                    {request.type} · {request.dates} · {request.days}
                  </span>
                </span>
                <ScreenPill tone={request.tone}>{request.status}</ScreenPill>
              </li>
            ))}
          </ul>

          {/*
            The AI line, shown where it actually appears in the product: on the
            row, before a decision, citing the record it read. An assistant that
            says something useful about *this* request is worth more than a chat
            window bolted to the corner of every screen.
          */}
          <div className="flex items-start gap-2.5 border-t border-ink-100 bg-brand-50/60 px-4 py-3">
            <SparkIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <p className="text-xs text-pretty text-ink-700">
              <span className="font-medium text-ink-900">Assist:</span> approving
              Rahul’s 5 days leaves Engineering with two people on 10 Sep, the
              day of the release. Sana is already off that week.
            </p>
          </div>
        </ScreenCard>
      </div>
    </ScreenChrome>
  )
}
