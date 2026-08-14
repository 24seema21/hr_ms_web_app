/**
 * The Settings module's domain types.
 *
 * These mirror the shapes the configuration endpoints are expected to return,
 * so wiring the real API later is a change to the mock files and nothing else.
 */

export type SettingsSectionId =
  | 'onboarding'
  | 'locations'
  | 'leave-types'
  | 'probation'
  | 'roles'

/** Anything the mock CRUD helper can manage. */
export interface Identified {
  id: string
}

/* ── Shared ─────────────────────────────────────────────────────────────── */

export const OWNER_ROLES = [
  'HR',
  'IT',
  'Manager',
  'Finance',
  'Employee',
] as const
export type OwnerRole = (typeof OWNER_ROLES)[number]

export const WEEKDAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
] as const
export type WeekdayKey = (typeof WEEKDAYS)[number]['key']

/* ── Onboarding ─────────────────────────────────────────────────────────── */

export interface OnboardingTask extends Identified {
  title: string
  ownerRole: OwnerRole
  /** Days from the joining date by which the task is due. */
  dueWithinDays: number
  mandatory: boolean
}

export interface OnboardingStage extends Identified {
  name: string
  description: string
  tasks: OnboardingTask[]
}

/* ── Locations ──────────────────────────────────────────────────────────── */

export type LocationStatus = 'active' | 'inactive'

export interface OfficeLocation extends Identified {
  name: string
  addressLine: string
  city: string
  state: string
  country: string
  timezone: string
  workingDays: WeekdayKey[]
  status: LocationStatus
}

/* ── Leave types ────────────────────────────────────────────────────────── */

export const LEAVE_APPLICABILITY = [
  { value: 'all', label: 'All employees' },
  { value: 'confirmed_only', label: 'Confirmed employees only' },
  { value: 'probation_included', label: 'Includes probation, reduced quota' },
] as const
export type LeaveApplicability = (typeof LEAVE_APPLICABILITY)[number]['value']

export interface LeaveTypeSetting extends Identified {
  name: string
  shortCode: string
  /** Hex, used as the calendar/chip tag for this type elsewhere in the app. */
  color: string
  paid: boolean
  /** `null` means uncapped — used by unpaid leave. */
  annualQuota: number | null
  carryForward: boolean
  /** Only meaningful when `carryForward` is true. */
  carryForwardCap: number | null
  applicability: LeaveApplicability
}

/* ── Probation ──────────────────────────────────────────────────────────── */

export interface ProbationCheckpoint extends Identified {
  label: string
  /** Days from the joining date at which the review happens. */
  atDay: number
  ownerRole: OwnerRole
}

export interface ProbationLeaveRule {
  leaveTypeId: string
  allowed: boolean
  /** `null` when the type is blocked or follows its standard quota. */
  quotaDuringProbation: number | null
}

export interface ProbationPolicy {
  defaultDurationDays: number
  maxExtensionDays: number
  extensionsAllowed: number
  autoConfirmOnCompletion: boolean
  checkpoints: ProbationCheckpoint[]
  leaveRules: ProbationLeaveRule[]
}

/* ── Roles ──────────────────────────────────────────────────────────────── */

export const PERMISSION_ACTIONS = [
  { value: 'view', label: 'View' },
  { value: 'create', label: 'Create' },
  { value: 'edit', label: 'Edit' },
  { value: 'delete', label: 'Delete' },
] as const
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number]['value']

export const PERMISSION_MODULES = [
  { value: 'employees', label: 'Employees' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'leave', label: 'Leave' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'settings', label: 'Settings' },
] as const
export type PermissionModule = (typeof PERMISSION_MODULES)[number]['value']

export type PermissionMatrix = Record<
  PermissionModule,
  Record<PermissionAction, boolean>
>

export interface UserRole extends Identified {
  name: string
  description: string
  /** Built-in roles can be edited but never deleted. */
  system: boolean
  memberCount: number
  permissions: PermissionMatrix
}
