import type { LeaveTypeSetting } from '../types'

/*
  DEMO DATA — replace with GET /api/v1/settings/leave-types.

  The first four ids match the `LeaveType` union the Leave module already ships
  (`features/leave/types.ts`), so this screen configures the same types the
  leave calendar renders rather than a parallel set.
*/

export const LEAVE_TYPE_SETTINGS: LeaveTypeSetting[] = [
  {
    id: 'earned',
    name: 'Earned Leave',
    shortCode: 'EL',
    color: '#2a7c65',
    paid: true,
    annualQuota: 18,
    carryForward: true,
    carryForwardCap: 30,
    applicability: 'confirmed_only',
  },
  {
    id: 'casual',
    name: 'Casual Leave',
    shortCode: 'CL',
    color: '#d6871f',
    paid: true,
    annualQuota: 8,
    carryForward: false,
    carryForwardCap: null,
    applicability: 'probation_included',
  },
  {
    id: 'sick',
    name: 'Sick Leave',
    shortCode: 'SL',
    color: '#b4442f',
    paid: true,
    annualQuota: 10,
    carryForward: false,
    carryForwardCap: null,
    applicability: 'all',
  },
  {
    id: 'unpaid',
    name: 'Loss of Pay',
    shortCode: 'LOP',
    color: '#767d77',
    paid: false,
    annualQuota: null,
    carryForward: false,
    carryForwardCap: null,
    applicability: 'all',
  },
  {
    id: 'maternity',
    name: 'Maternity Leave',
    shortCode: 'ML',
    color: '#4f9982',
    paid: true,
    annualQuota: 182,
    carryForward: false,
    carryForwardCap: null,
    applicability: 'confirmed_only',
  },
  {
    id: 'paternity',
    name: 'Paternity Leave',
    shortCode: 'PL',
    color: '#8c5113',
    paid: true,
    annualQuota: 10,
    carryForward: false,
    carryForwardCap: null,
    applicability: 'confirmed_only',
  },
  {
    id: 'bereavement',
    name: 'Bereavement Leave',
    shortCode: 'BL',
    color: '#146152',
    paid: true,
    annualQuota: 5,
    carryForward: false,
    carryForwardCap: null,
    applicability: 'all',
  },
]
