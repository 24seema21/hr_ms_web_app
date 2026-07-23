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
  id: string
  title: string
  description: string
  /** SVG path data, drawn inside a 24×24 viewBox. */
  iconPath: string
}

export const FEATURES: readonly Feature[] = [
  {
    id: 'directory',
    title: 'Employee directory',
    description:
      'One source of truth for every person — contracts, documents, reporting lines and contact details, searchable in seconds.',
    iconPath:
      'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
  },
  {
    id: 'attendance',
    title: 'Attendance & time',
    description:
      'Clock-in, shifts, overtime and remote days captured automatically, with timesheets that reconcile themselves.',
    iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  {
    id: 'leave',
    title: 'Leave management',
    description:
      'Policy-driven balances, one-tap requests and approvals that reach the right manager without a single email thread.',
    iconPath:
      'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
  },
  {
    id: 'payroll',
    title: 'Payroll',
    description:
      'Salary structures, deductions and statutory compliance calculated from live attendance and leave data — no re-keying.',
    iconPath:
      'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z',
  },
  {
    id: 'performance',
    title: 'Performance reviews',
    description:
      'Goals, check-ins and review cycles that actually get finished, with history every manager can see at a glance.',
    iconPath:
      'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z',
  },
  {
    id: 'reports',
    title: 'Reports & analytics',
    description:
      'Headcount, attrition, cost-per-hire and absence trends, exportable the moment the board asks for them.',
    iconPath:
      'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
  },
]
