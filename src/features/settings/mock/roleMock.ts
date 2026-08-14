import { PERMISSION_MODULES } from '../types'
import type {
  PermissionAction,
  PermissionMatrix,
  PermissionModule,
  UserRole,
} from '../types'

/* DEMO DATA — replace with GET /api/v1/settings/roles. */

const NO_ACCESS: Record<PermissionAction, boolean> = {
  view: false,
  create: false,
  edit: false,
  delete: false,
}

/** An all-false matrix — the starting point for a new role. */
export function emptyPermissionMatrix(): PermissionMatrix {
  return Object.fromEntries(
    PERMISSION_MODULES.map((module) => [module.value, { ...NO_ACCESS }]),
  ) as PermissionMatrix
}

/**
 * Shorthand for the seed data below: `matrix({ employees: 'view edit' })`.
 * Anything omitted stays false.
 */
function matrix(
  grants: Partial<Record<PermissionModule, string>>,
): PermissionMatrix {
  const result = emptyPermissionMatrix()

  for (const [module, actions] of Object.entries(grants)) {
    for (const action of actions.split(' ')) {
      result[module as PermissionModule][action as PermissionAction] = true
    }
  }

  return result
}

export const USER_ROLES: UserRole[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    description: 'Unrestricted access, including settings and role management.',
    system: true,
    memberCount: 2,
    permissions: matrix({
      employees: 'view create edit delete',
      attendance: 'view create edit delete',
      leave: 'view create edit delete',
      payroll: 'view create edit delete',
      settings: 'view create edit delete',
    }),
  },
  {
    id: 'role-hr-manager',
    name: 'HR Manager',
    description:
      'Owns the employee record, leave approvals and onboarding configuration.',
    system: true,
    memberCount: 5,
    permissions: matrix({
      employees: 'view create edit delete',
      attendance: 'view edit',
      leave: 'view create edit delete',
      payroll: 'view',
      settings: 'view edit',
    }),
  },
  {
    id: 'role-manager',
    name: 'Reporting Manager',
    description: 'Approves leave and attendance for direct reports only.',
    system: true,
    memberCount: 23,
    permissions: matrix({
      employees: 'view',
      attendance: 'view edit',
      leave: 'view edit',
    }),
  },
  {
    id: 'role-finance',
    name: 'Finance',
    description: 'Payroll processing and read access to attendance records.',
    system: false,
    memberCount: 4,
    permissions: matrix({
      employees: 'view',
      attendance: 'view',
      leave: 'view',
      payroll: 'view create edit',
    }),
  },
  {
    id: 'role-employee',
    name: 'Employee',
    description: 'Self-service access to their own record and requests.',
    system: true,
    memberCount: 214,
    permissions: matrix({
      employees: 'view',
      attendance: 'view create',
      leave: 'view create',
    }),
  },
  {
    id: 'role-auditor',
    name: 'Auditor',
    description: 'Read-only access across every module for compliance review.',
    system: false,
    memberCount: 1,
    permissions: matrix({
      employees: 'view',
      attendance: 'view',
      leave: 'view',
      payroll: 'view',
      settings: 'view',
    }),
  },
]
