import type { ModuleIconName } from '@/shared/components/ui/moduleIcons'

/**
 * Everything Unity Portal ships, advertised on the landing page.
 *
 * Content lives in data, not in markup. The index component then renders
 * whatever is in this array — adding a module is an edit here, and no JSX
 * changes at all.
 */

/**
 * How finished a module is.
 *
 * This exists because the product is genuinely mid-build, and a landing page
 * that lists eleven modules as if all eleven were shipping is the fastest way
 * to lose a customer in week two. Saying "building" on the page costs one
 * badge; saying it in the demo call costs the deal.
 */
export const MODULE_STATUSES = ['live', 'building', 'planned'] as const
export type ModuleStatus = (typeof MODULE_STATUSES)[number]

export interface Feature {
  /**
   * A stable identity for this item.
   *
   * This is what React's `key` uses. It must never be the array index:
   * React uses `key` to decide which DOM node maps to which item across
   * renders. With index keys, reordering or removing an item makes React
   * reuse the wrong node — so state that lives *inside* a card (a focused
   * input, an open menu, a CSS animation) silently jumps to a neighbour.
   * With a real id, React moves the right node and everything follows it.
   */
  id: ModuleIconName
  title: string
  description: string
  status: ModuleStatus
  /**
   * What this module reads out of the shared employee record.
   *
   * The page's whole argument is that every module reads one record, and an
   * argument is more convincing when it is itemised. This is also the reason
   * the section needs no numbering: the modules are a set, not a sequence,
   * and "01 / 02 / 03" over a set is decoration pretending to be information.
   */
  reads: readonly string[]
}

/*
  The icon is *not* in this array. It used to be an SVG path string, which
  meant a content file carried 400 characters of geometry per row and nobody
  could tell what any of them drew. Now the `id` doubles as the key into
  `MODULE_ICONS` — so the data stays readable and the compiler checks that
  every module has a glyph, because `id` is typed as `ModuleIconName`.

  Ordered by the employee lifecycle rather than by importance, because that is
  the order a buyer walks through the product in their head: someone joins,
  works, is equipped, is measured, and eventually leaves.
*/
export const FEATURES: readonly Feature[] = [
  {
    id: 'onboarding',
    title: 'Onboarding',
    description:
      'Stages and tasks for every new joiner, each with an owner and a due date counted from the joining date. Nobody chases IT for a laptop over email.',
    status: 'live',
    reads: ['joining date', 'location', 'reporting line'],
  },
  {
    id: 'directory',
    title: 'Employee directory',
    description:
      'One source of truth for every person — contact details, reporting lines, documents and history, searchable in seconds.',
    status: 'live',
    reads: ['name', 'contact', 'location'],
  },
  {
    id: 'attendance',
    title: 'Attendance & remarks',
    description:
      'Check in from the office or home, split a day across sessions, and raise a regularisation with a remark when the clock and the day disagree.',
    status: 'live',
    reads: ['shift pattern', 'location', 'working week'],
  },
  {
    id: 'leave',
    title: 'Leave & balances',
    description:
      'Policy-driven entitlements, carry-forward, half days and a live balance every employee can see before they apply — approvals reach the right manager without an email thread.',
    status: 'live',
    reads: ['reporting line', 'joining date', 'probation status'],
  },
  {
    id: 'config',
    title: 'Configuration',
    description:
      'Leave types, probation rules, locations, working weeks, onboarding stages, roles and permissions. Set once by an admin, applied to everyone, changeable without a support ticket.',
    status: 'live',
    reads: ['every module on this page'],
  },
  {
    id: 'assets',
    title: 'Assets',
    description:
      'Laptops, phones, access cards and licences issued against a person, so the offboarding checklist already knows what to collect back.',
    status: 'building',
    reads: ['location', 'joining date'],
  },
  {
    id: 'tickets',
    title: 'Tickets',
    description:
      'Employee requests routed to HR, IT or Finance by category, with the thread kept against the employee record instead of in somebody’s inbox.',
    status: 'building',
    reads: ['reporting line', 'role'],
  },
  {
    id: 'goals',
    title: 'Goals & reviews',
    description:
      'Goals, check-ins and review cycles that actually get finished, with history every manager can see at a glance.',
    status: 'building',
    reads: ['reporting line', 'role'],
  },
  {
    id: 'reports',
    title: 'Reports',
    description:
      'Headcount, attrition, absence trends and attendance exceptions, exportable to CSV the moment the board asks.',
    status: 'building',
    reads: ['every module above'],
  },
  {
    id: 'offboarding',
    title: 'Offboarding',
    description:
      'Exit checklist, asset recovery, final leave settlement and access revocation — the record is deactivated, never deleted, so history stays auditable.',
    status: 'planned',
    reads: ['assets', 'leave balance', 'access roles'],
  },
  {
    id: 'payroll',
    title: 'Payroll',
    description:
      'Salary structures, deductions and statutory compliance calculated from live attendance and leave. Next on the roadmap, and the reason the register is built the way it is.',
    status: 'planned',
    reads: ['attendance', 'leave', 'salary structure'],
  },
]
