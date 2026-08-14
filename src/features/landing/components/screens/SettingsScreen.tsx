import { LockIcon } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'
import {
  ScreenCard,
  ScreenChrome,
  ScreenLabel,
  ScreenPill,
} from './ScreenChrome'

/*
  A static picture of the settings screen — the module the whole subscription
  argument rests on, so the panel is built to show two things at once: the
  depth of what an admin can configure, and the fact that the plan decides how
  much of that list is reachable.
*/

/**
 * The settings sections, with the plan that unlocks each.
 *
 * `locked` is not a scare tactic here: showing a locked row is how somebody on
 * Essential learns the capability exists at all. Hiding it means they go
 * looking for a second product instead of an upgrade.
 */
const SECTIONS = [
  { id: 'onboarding', label: 'Onboarding', count: '4 stages', locked: false },
  { id: 'locations', label: 'Locations', count: '3 sites', locked: false },
  { id: 'leave-types', label: 'Leave Types', count: '5 types', locked: false },
  { id: 'probation', label: 'Probation', count: '90 days', locked: false },
  { id: 'roles', label: 'User Roles', count: '6 roles', locked: false },
  { id: 'assets', label: 'Assets', count: 'Complete', locked: true },
  { id: 'tickets', label: 'Tickets', count: 'Complete', locked: true },
  { id: 'goals', label: 'Goals', count: 'Complete', locked: true },
] as const

const ACTIVE_SECTION = 'leave-types'

/*
  The leave-type table: the single best example of "configured once, applied to
  everyone". Every column here is a rule that the leave module, the balance
  view and eventually payroll all read — which is the argument the page has
  been making since the hero, shown rather than asserted.
*/
const LEAVE_TYPES = [
  {
    id: 'earned',
    name: 'Earned leave',
    code: 'EL',
    days: '18 / year',
    accrual: 'Monthly',
    carry: 'Up to 10',
    probation: 'Accrues, not usable',
    swatch: 'bg-chart-earned',
  },
  {
    id: 'casual',
    name: 'Casual leave',
    code: 'CL',
    days: '8 / year',
    accrual: 'Up front',
    carry: 'Lapses',
    probation: 'Half entitlement',
    swatch: 'bg-chart-casual',
  },
  {
    id: 'sick',
    name: 'Sick leave',
    code: 'SL',
    days: '10 / year',
    accrual: 'Up front',
    carry: 'Lapses',
    probation: 'Full entitlement',
    swatch: 'bg-chart-sick',
  },
  {
    id: 'unpaid',
    name: 'Unpaid leave',
    code: 'LWP',
    days: 'No cap',
    accrual: '—',
    carry: '—',
    probation: 'Full entitlement',
    swatch: 'bg-chart-unpaid',
  },
] as const

export function SettingsScreen() {
  return (
    <ScreenChrome
      activeNav="Settings"
      title="Settings"
      subtitle="Configuration · admin only · Complete plan"
      action={
        <span className="inline-flex h-8 items-center rounded-control border border-ink-300 bg-surface px-3 text-xs font-medium text-ink-800">
          Add leave type
        </span>
      }
    >
      <div className="grid gap-3 lg:grid-cols-4">
        {/* ── Section nav ──────────────────────────────────────────────── */}
        <ScreenCard className="p-2 lg:col-span-1">
          {/*
            Horizontally scrollable below `lg` and a stacked list above it.
            Eight settings sections in a column on a phone would push the table
            — the thing the panel is actually showing — off the bottom.
          */}
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SECTIONS.map((section) => (
              <li key={section.id} className="shrink-0 lg:shrink">
                <span
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-control px-2.5 py-2 text-xs font-medium whitespace-nowrap',
                    section.id === ACTIVE_SECTION
                      ? 'bg-brand-50 text-brand-700'
                      : section.locked
                        ? 'text-ink-400'
                        : 'text-ink-700',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {section.locked && <LockIcon className="h-3.5 w-3.5" />}
                    {section.label}
                  </span>
                  <span
                    className={cn(
                      'hidden font-mono text-[0.625rem] lg:inline',
                      section.locked ? 'text-accent-600' : 'text-ink-400',
                    )}
                  >
                    {section.count}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </ScreenCard>

        {/* ── The active section ───────────────────────────────────────── */}
        <ScreenCard className="lg:col-span-3">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5">
            <div>
              <h4 className="text-sm font-semibold text-ink-900">Leave types</h4>
              <p className="mt-0.5 font-mono text-[0.625rem] text-ink-500">
                Entitlements, accrual and carry-forward rules
              </p>
            </div>
            <ScreenPill tone="brand">Applies to 128 people</ScreenPill>
          </div>

          {/*
            A real <table>, not a grid of divs.

            This is configuration data with column headers, and a screen reader
            can only announce "Carry forward: lapses" if the markup says which
            column that cell is in. `overflow-x-auto` on the wrapper keeps the
            page itself from scrolling sideways on a phone.
          */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-ink-100">
                  <th scope="col" className="px-4 py-2">
                    <ScreenLabel>Type</ScreenLabel>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <ScreenLabel>Entitlement</ScreenLabel>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <ScreenLabel>Accrual</ScreenLabel>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <ScreenLabel>Carry forward</ScreenLabel>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <ScreenLabel>On probation</ScreenLabel>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {LEAVE_TYPES.map((type) => (
                  <tr key={type.id}>
                    <th scope="row" className="px-4 py-2.5 font-normal">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            'h-2.5 w-2.5 shrink-0 rounded-[2px]',
                            type.swatch,
                          )}
                        />
                        <span className="text-xs font-medium text-ink-900">
                          {type.name}
                        </span>
                        <span className="font-mono text-[0.625rem] text-ink-400">
                          {type.code}
                        </span>
                      </span>
                    </th>
                    <td className="px-3 py-2.5 font-mono text-xs text-ink-700">
                      {type.days}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-ink-600">
                      {type.accrual}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-ink-600">
                      {type.carry}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-ink-600">
                      {type.probation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/*
            The cross-reference. Leave types and probation are two settings
            screens that constrain each other, and the product says so on the
            screen rather than in a PDF nobody opens.
          */}
          <p className="border-t border-ink-100 px-4 py-2.5 text-xs text-pretty text-ink-500">
            Probation behaviour is inherited from{' '}
            <span className="font-medium text-brand-700">
              Settings → Probation
            </span>{' '}
            · 90 days, one review at day 75.
          </p>
        </ScreenCard>
      </div>
    </ScreenChrome>
  )
}
