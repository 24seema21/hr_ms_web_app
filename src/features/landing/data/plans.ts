/*
  ─────────────────────────────────────────────────────────────────────────────
  SUBSCRIPTIONS
  ─────────────────────────────────────────────────────────────────────────────
  Two shapes, deliberately kept apart.

  `PLANS` is the sales pitch — who a tier is for, what it costs, the three or
  four lines that make somebody self-select. `CAPABILITY_MATRIX` is the fine
  print: the same tiers, row by row, with no adjectives.

  They are separate because they answer different questions and are read at
  different moments. Folding the full matrix into each card gives three columns
  of thirteen ticks that nobody compares; folding the pitch into the matrix
  gives a table with marketing copy in it.
*/

export const PLAN_IDS = ['essential', 'complete', 'scale'] as const
export type PlanId = (typeof PLAN_IDS)[number]

export interface Plan {
  id: PlanId
  name: string
  /** Who should stop reading here and pick this one. */
  audience: string
  /** Per employee, per month. `null` where it is quoted rather than listed. */
  price: number | null
  priceNote: string
  /** The one line that says what this tier *is*. */
  summary: string
  highlights: readonly string[]
  /** Exactly one tier carries this. Two "most popular" badges is none. */
  featured?: boolean
}

export const PLANS: readonly Plan[] = [
  {
    id: 'essential',
    name: 'Essential',
    audience: 'Teams up to 50',
    price: 49,
    priceNote: 'per employee / month',
    summary:
      'The register itself: people, attendance and leave, configured to your working week.',
    highlights: [
      'Directory, attendance and leave',
      'Leave types and location setup',
      'Employee self-service on mobile',
      'CSV export of every table',
    ],
  },
  {
    id: 'complete',
    name: 'Complete',
    audience: 'Teams of 50–500',
    price: 99,
    priceNote: 'per employee / month',
    summary:
      'Everything an HR team touches in a week, including the configuration depth enterprise suites charge separately for.',
    highlights: [
      'Everything in Essential',
      'Onboarding, probation and offboarding',
      'Assets, tickets and goals',
      'Roles and permissions matrix',
      'AI assist across attendance and leave',
    ],
    featured: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    audience: 'Multi-entity and regulated',
    price: null,
    priceNote: 'quoted per org',
    summary:
      'For groups running several entities, or anyone whose auditor asks where the data lives.',
    highlights: [
      'Everything in Complete',
      'SSO and custom approval chains',
      'Multi-entity and multi-country locations',
      'API access and scheduled exports',
      'Named support contact',
    ],
  },
]

/**
 * One configurable capability, and the tier that unlocks it.
 *
 * `'—'` is a real value rather than an absent one: a matrix cell that is
 * *empty* reads as an oversight, and a cell that says "not included" reads as
 * an answer.
 */
export type MatrixCell = 'yes' | 'no' | string

export interface MatrixRow {
  id: string
  label: string
  /** What an admin actually sets here, in the words used inside the product. */
  detail: string
  cells: Readonly<Record<PlanId, MatrixCell>>
}

export const MATRIX_GROUPS: readonly {
  id: string
  label: string
  rows: readonly MatrixRow[]
}[] = [
  {
    id: 'people',
    label: 'People & time',
    rows: [
      {
        id: 'directory',
        label: 'Employee directory',
        detail: 'Records, documents, reporting lines',
        cells: { essential: 'yes', complete: 'yes', scale: 'yes' },
      },
      {
        id: 'attendance',
        label: 'Attendance & regularisation',
        detail: 'Sessions, office/remote, remarks',
        cells: { essential: 'yes', complete: 'yes', scale: 'yes' },
      },
      {
        id: 'leave-types',
        label: 'Leave types',
        detail: 'Entitlement, accrual, carry-forward',
        cells: { essential: '4 types', complete: 'Unlimited', scale: 'Unlimited' },
      },
      {
        id: 'locations',
        label: 'Locations',
        detail: 'Offices, timezones, working weeks',
        cells: { essential: '2 sites', complete: '25 sites', scale: 'Unlimited' },
      },
    ],
  },
  {
    id: 'lifecycle',
    label: 'Lifecycle',
    rows: [
      {
        id: 'onboarding',
        label: 'Onboarding stages',
        detail: 'Tasks, owners, due-by-joining-date',
        cells: { essential: 'no', complete: 'yes', scale: 'yes' },
      },
      {
        id: 'probation',
        label: 'Probation rules',
        detail: 'Duration, reviews, leave overrides',
        cells: { essential: 'no', complete: 'yes', scale: 'yes' },
      },
      {
        id: 'offboarding',
        label: 'Offboarding checklist',
        detail: 'Exit tasks, asset recovery, revocation',
        cells: { essential: 'no', complete: 'Building', scale: 'Building' },
      },
    ],
  },
  {
    id: 'operations',
    label: 'Day-to-day operations',
    rows: [
      {
        id: 'assets',
        label: 'Asset register',
        detail: 'Issue, return, custody history',
        cells: { essential: 'no', complete: 'yes', scale: 'yes' },
      },
      {
        id: 'tickets',
        label: 'Tickets',
        detail: 'Categories, routing, SLA targets',
        cells: { essential: 'no', complete: 'yes', scale: 'yes' },
      },
      {
        id: 'goals',
        label: 'Goals & review cycles',
        detail: 'Cadence, templates, visibility',
        cells: { essential: 'no', complete: 'yes', scale: 'yes' },
      },
      {
        id: 'roles',
        label: 'Roles & permissions',
        detail: 'Who sees and edits what, per module',
        cells: { essential: '3 roles', complete: 'Unlimited', scale: 'Unlimited' },
      },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    rows: [
      {
        id: 'ai',
        label: 'AI assist',
        detail: 'Drafted remarks, policy answers, flags',
        cells: { essential: 'no', complete: 'yes', scale: 'yes' },
      },
      {
        id: 'sso',
        label: 'SSO & approval chains',
        detail: 'SAML, multi-step approvals',
        cells: { essential: 'no', complete: 'no', scale: 'yes' },
      },
      {
        id: 'api',
        label: 'API & scheduled exports',
        detail: 'Read/write API, nightly CSV drops',
        cells: { essential: 'no', complete: 'Read-only', scale: 'yes' },
      },
      {
        id: 'payroll',
        label: 'Payroll',
        detail: 'Structures, deductions, compliance',
        cells: { essential: 'Planned', complete: 'Planned', scale: 'Planned' },
      },
    ],
  },
]
