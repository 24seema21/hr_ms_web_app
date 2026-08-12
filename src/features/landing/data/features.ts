import type { ModuleIconName } from '@/shared/components/ui/moduleIcons'

/**
 * The six HRMS modules advertised on the landing page.
 *
 * Content lives in data, not in markup. The grid component then renders
 * whatever is in this array — adding a seventh module is an edit here, and
 * no JSX changes at all.
 */
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
  /**
   * What this module reads out of the shared employee record.
   *
   * The page's whole argument is that six modules read one record, and an
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
*/
export const FEATURES: readonly Feature[] = [
  {
    id: 'directory',
    title: 'Employee directory',
    description:
      'One source of truth for every person — contact details, reporting lines, documents and history, searchable in seconds.',
    reads: ['name', 'contact', 'location'],
  },
  {
    id: 'attendance',
    title: 'Attendance & time',
    description:
      'Clock-ins, shifts, overtime and remote days land in the register automatically, and the timesheet adds itself up.',
    reads: ['shift pattern', 'location'],
  },
  {
    id: 'leave',
    title: 'Leave management',
    description:
      'Policy-driven balances and one-tap approvals that reach the right manager without a single email thread.',
    reads: ['reporting line', 'joining date'],
  },
  {
    id: 'payroll',
    title: 'Payroll',
    description:
      'Salary structures, deductions and statutory compliance calculated from live attendance and leave. Nothing re-keyed.',
    reads: ['attendance', 'leave', 'salary structure'],
  },
  {
    id: 'performance',
    title: 'Performance reviews',
    description:
      'Goals, check-ins and review cycles that actually get finished, with history every manager can see at a glance.',
    reads: ['reporting line', 'role'],
  },
  {
    id: 'reports',
    title: 'Reports & analytics',
    description:
      'Headcount, attrition, cost-per-hire and absence trends, exportable the moment the board asks for them.',
    reads: ['every module above'],
  },
]
