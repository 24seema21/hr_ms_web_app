import type { ProbationPolicy } from '../types'

/* DEMO DATA — replace with GET /api/v1/settings/probation-policy. */

export const PROBATION_POLICY: ProbationPolicy = {
  defaultDurationDays: 90,
  maxExtensionDays: 60,
  extensionsAllowed: 2,
  autoConfirmOnCompletion: false,
  checkpoints: [
    {
      id: 'checkpoint-30',
      label: '30-day settling-in review',
      atDay: 30,
      ownerRole: 'Manager',
    },
    {
      id: 'checkpoint-60',
      label: '60-day performance check',
      atDay: 60,
      ownerRole: 'Manager',
    },
    {
      id: 'checkpoint-85',
      label: 'Confirmation recommendation',
      atDay: 85,
      ownerRole: 'HR',
    },
  ],
  // Keyed by leave type id — see `leaveTypeMock.ts`.
  leaveRules: [
    { leaveTypeId: 'earned', allowed: false, quotaDuringProbation: null },
    { leaveTypeId: 'casual', allowed: true, quotaDuringProbation: 4 },
    { leaveTypeId: 'sick', allowed: true, quotaDuringProbation: 5 },
    { leaveTypeId: 'unpaid', allowed: true, quotaDuringProbation: null },
    { leaveTypeId: 'maternity', allowed: true, quotaDuringProbation: 182 },
    { leaveTypeId: 'paternity', allowed: false, quotaDuringProbation: null },
    { leaveTypeId: 'bereavement', allowed: true, quotaDuringProbation: 3 },
  ],
}
