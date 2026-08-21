import { CheckIcon, LockIcon } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'
import { ScreenCard, ScreenFrame, ScreenLabel } from './ScreenFrame'

/*
  Settings, and the thing this screen has to prove: the tier decides how much
  of the configuration is yours to change, and the locked sections stay
  *visible*.

  Hiding what an upgrade buys is the standard move and it is the wrong one —
  somebody who cannot see the ceiling cannot decide whether it matters, so they
  assume it does and leave. Showing the lock is a smaller cost than the doubt.
*/

const SECTIONS: readonly {
  id: string
  label: string
  locked?: boolean
}[] = [
  { id: 'leave-types', label: 'Leave types' },
  { id: 'working-weeks', label: 'Working weeks' },
  { id: 'locations', label: 'Locations' },
  { id: 'onboarding', label: 'Onboarding stages' },
  { id: 'probation', label: 'Probation rules' },
  { id: 'roles', label: 'Roles & permissions', locked: true },
  { id: 'sso', label: 'SSO & approvals', locked: true },
]

const LEAVE_TYPES: readonly {
  id: string
  name: string
  entitlement: string
  accrual: string
  carry: boolean
}[] = [
  { id: 'earned', name: 'Earned', entitlement: '18 days', accrual: 'Monthly', carry: true },
  { id: 'casual', name: 'Casual', entitlement: '8 days', accrual: 'Yearly', carry: false },
  { id: 'sick', name: 'Sick', entitlement: '6 days', accrual: 'Yearly', carry: false },
  { id: 'unpaid', name: 'Unpaid', entitlement: 'Unlimited', accrual: '—', carry: false },
]

export function SettingsScreen() {
  return (
    <ScreenFrame
      activeNav="settings"
      path="/settings"
      title="Configuration"
      meta="Complete tier"
    >
      {/*
        Two panes below `sm`, stacked above it. The section list is a nav, so
        it goes first in the source as well as on screen — a reader who cannot
        see the layout still meets the menu before the thing it opened.
      */}
      <div className="mt-4 grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <ScreenCard className="p-2">
          {SECTIONS.map((section, index) => (
            <span
              key={section.id}
              className={cn(
                'mt-0.5 flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[0.6875rem] font-medium first:mt-0',
                index === 0 && 'bg-nx-jade-soft text-nx-jade-ink',
                index !== 0 && !section.locked && 'text-nx-muted',
                /*
                  Locked rows are dimmed, never removed. They are also not
                  struck through or greyed to illegibility — you have to be
                  able to read what you would be buying.
                */
                section.locked && 'text-nx-faint',
              )}
            >
              <span className="truncate">{section.label}</span>
              {section.locked && <LockIcon className="h-3 w-3 shrink-0" />}
            </span>
          ))}
        </ScreenCard>

        <ScreenCard>
          <div className="flex items-center justify-between border-b border-nx-line bg-nx-bg/50 px-3 py-2">
            <ScreenLabel>Leave types</ScreenLabel>
            <span className="rounded-full bg-nx-jade-soft px-2 py-0.5 text-[0.625rem] font-semibold text-nx-jade-ink">
              Unlimited on this tier
            </span>
          </div>

          {/*
            A real grid with a header row rather than a <table>: this panel is
            `aria-hidden` decoration, and a table here would add rows and cells
            to the accessibility tree that no reader is meant to walk through.
            The pricing section further down uses a genuine <table>, because
            that one is content.
          */}
          <div className="divide-y divide-nx-line">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 bg-nx-bg/30 px-3 py-1.5">
              <ScreenLabel>Type</ScreenLabel>
              <ScreenLabel>Days</ScreenLabel>
              <ScreenLabel>Accrual</ScreenLabel>
              <ScreenLabel>Carry</ScreenLabel>
            </div>

            {LEAVE_TYPES.map((type) => (
              <div
                key={type.id}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-3 py-2"
              >
                <span className="truncate text-[0.6875rem] font-semibold text-nx-ink">
                  {type.name}
                </span>
                <span className="font-mono text-[0.625rem] text-nx-muted">
                  {type.entitlement}
                </span>
                <span className="font-mono text-[0.625rem] text-nx-muted">
                  {type.accrual}
                </span>
                <span className="flex w-8 justify-center">
                  {type.carry ? (
                    <CheckIcon className="h-3.5 w-3.5 text-nx-jade" />
                  ) : (
                    <span className="font-mono text-[0.625rem] text-nx-faint">
                      –
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-nx-line bg-nx-bg/30 px-3 py-2">
            <span className="text-[0.625rem] text-nx-faint">
              Set once by an admin, applied to everyone, changed without a
              support ticket.
            </span>
          </div>
        </ScreenCard>
      </div>
    </ScreenFrame>
  )
}
