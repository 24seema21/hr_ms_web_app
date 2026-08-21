import { AlertIcon } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'
import { SCREEN_FILLS, SCREEN_TONES } from '../../lib/screenTones'
import type { ScreenTone } from '../../lib/screenTones'
import { ScreenCard, ScreenFrame, ScreenLabel } from './ScreenFrame'

/*
  Leave, shown from both ends at once: the ledger an employee checks before
  applying, and the queue a manager works through — reading the same
  entitlement rules configured on the Settings screen next door.

  Putting them in one frame is the point. Two screenshots would suggest two
  products; one screen with two panes is what "self-service and approval read
  the same row" actually looks like.
*/

const BALANCES: readonly {
  id: string
  label: string
  used: number
  total: number
  tone: ScreenTone
}[] = [
  { id: 'earned', label: 'Earned', used: 5.5, total: 18, tone: 'jade' },
  { id: 'casual', label: 'Casual', used: 5, total: 8, tone: 'violet' },
  { id: 'sick', label: 'Sick', used: 0, total: 6, tone: 'amber' },
]

const QUEUE: readonly {
  id: string
  initials: string
  name: string
  request: string
  days: string
  warning?: string
  tone: ScreenTone
}[] = [
  {
    id: 'rahul',
    initials: 'RN',
    name: 'Rahul Nair',
    request: 'Earned · 18–22 Aug',
    days: '5 days',
    warning: 'Overlaps 2 others in Engineering',
    tone: 'amber',
  },
  {
    id: 'dev',
    initials: 'DK',
    name: 'Dev Kulkarni',
    request: 'Casual · 21 Aug',
    days: 'Half day',
    tone: 'jade',
  },
  {
    id: 'joseph',
    initials: 'JM',
    name: 'Joseph Mathew',
    request: 'Sick · 12 Aug',
    days: '1 day',
    tone: 'jade',
  },
]

export function LeaveScreen() {
  return (
    <ScreenFrame
      activeNav="leave"
      path="/leave"
      title="Leave & balances"
      meta="3 to approve"
    >
      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        {/* ── The employee's ledger ──────────────────────────────────── */}
        <ScreenCard>
          <div className="border-b border-nx-line bg-nx-bg/50 px-3 py-2">
            <ScreenLabel>Your balance, before you apply</ScreenLabel>
          </div>

          <div className="space-y-3 p-3">
            {BALANCES.map((balance) => {
              const left = balance.total - balance.used

              return (
                <div key={balance.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[0.6875rem] font-semibold text-nx-ink">
                      {balance.label}
                    </span>
                    <span className="font-mono text-[0.625rem] text-nx-muted">
                      {left} of {balance.total} left
                    </span>
                  </div>

                  {/*
                    The meter fills with what has been *used*, so the empty part
                    is what is left — the number the employee came to find. A
                    bar that fills with the remainder reads as progress towards
                    something, which is the opposite of what a balance is.
                  */}
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-nx-bg">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        SCREEN_FILLS[balance.tone],
                      )}
                      style={{
                        width: `${(balance.used / balance.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-nx-line bg-nx-bg/30 px-3 py-2">
            <span className="text-[0.625rem] text-nx-faint">
              Accrued monthly · carry-forward applied on 01 Apr
            </span>
          </div>
        </ScreenCard>

        {/* ── The manager's queue ────────────────────────────────────── */}
        <ScreenCard>
          <div className="flex items-center justify-between border-b border-nx-line bg-nx-bg/50 px-3 py-2">
            <ScreenLabel>Waiting on you</ScreenLabel>
            <span className="font-mono text-[0.625rem] text-nx-faint">
              oldest 2 days
            </span>
          </div>

          <div className="divide-y divide-nx-line">
            {QUEUE.map((item) => (
              <div key={item.id} className="px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold',
                      SCREEN_TONES[item.tone],
                    )}
                  >
                    {item.initials}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-nx-ink">
                      {item.name}
                    </span>
                    <span className="block truncate font-mono text-[0.625rem] text-nx-faint">
                      {item.request} · {item.days}
                    </span>
                  </span>

                  <span className="flex shrink-0 gap-1.5">
                    <span className="rounded-full bg-nx-jade px-2.5 py-1 text-[0.625rem] font-semibold text-nx-on-fill">
                      Approve
                    </span>
                    <span className="rounded-full px-2.5 py-1 text-[0.625rem] font-semibold text-nx-muted ring-1 ring-nx-line ring-inset">
                      Decline
                    </span>
                  </span>
                </div>

                {/*
                  The warning sits on the row it is about, while the decision
                  is still open. A coverage clash discovered in a monthly
                  exception report is a coverage clash that already happened.
                */}
                {item.warning && (
                  <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-nx-amber-soft px-2 py-1 text-[0.625rem] font-medium text-nx-amber-ink">
                    <AlertIcon className="h-3 w-3 shrink-0" />
                    {item.warning}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScreenCard>
      </div>
    </ScreenFrame>
  )
}
