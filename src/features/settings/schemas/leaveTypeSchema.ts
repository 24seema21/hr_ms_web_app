import { z } from 'zod'
import { optionalDayCountField } from './formPrimitives'
import type { LeaveTypeSetting } from '../types'

/*
  `uncapped` and `carryForward` are form-only switches: they decide whether the
  matching number field means anything. Keeping them in the form rather than in
  the domain type is what lets `annualQuota` stay `number | null` on the record
  while the input itself is never `null` and never uncontrolled.
*/
export const leaveTypeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Leave type name is required')
      .max(60, 'Name must be 60 characters or fewer'),

    shortCode: z
      .string()
      .trim()
      .min(2, 'Short code must be at least 2 characters')
      .max(5, 'Short code must be 5 characters or fewer')
      .regex(/^[A-Za-z]+$/, 'Short code must be letters only'),

    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Choose a colour tag'),

    paid: z.boolean(),
    uncapped: z.boolean(),
    annualQuota: optionalDayCountField('Annual quota', 1, 365),

    carryForward: z.boolean(),
    carryForwardCap: optionalDayCountField('Carry-forward cap', 1, 365),

    applicability: z.enum(['all', 'confirmed_only', 'probation_included']),
  })
  .refine((values) => values.uncapped || values.annualQuota.trim() !== '', {
    message: 'Enter an annual quota, or mark the type uncapped',
    path: ['annualQuota'],
  })
  .refine(
    (values) => !values.carryForward || values.carryForwardCap.trim() !== '',
    {
      message: 'Enter a cap for how much may be carried forward',
      path: ['carryForwardCap'],
    },
  )

export type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>

export const EMPTY_LEAVE_TYPE_FORM: LeaveTypeFormValues = {
  name: '',
  shortCode: '',
  color: '#2a7c65',
  paid: true,
  uncapped: false,
  annualQuota: '',
  carryForward: false,
  carryForwardCap: '',
  applicability: 'all',
}

export function toLeaveTypeFormValues(
  leaveType: LeaveTypeSetting,
): LeaveTypeFormValues {
  return {
    name: leaveType.name,
    shortCode: leaveType.shortCode,
    color: leaveType.color,
    paid: leaveType.paid,
    uncapped: leaveType.annualQuota === null,
    annualQuota: leaveType.annualQuota?.toString() ?? '',
    carryForward: leaveType.carryForward,
    carryForwardCap: leaveType.carryForwardCap?.toString() ?? '',
    applicability: leaveType.applicability,
  }
}

/** Form values as the record the table renders — the two switches collapsed. */
export function toLeaveTypeSetting(
  id: string,
  values: LeaveTypeFormValues,
): LeaveTypeSetting {
  return {
    id,
    name: values.name,
    shortCode: values.shortCode.toUpperCase(),
    color: values.color,
    paid: values.paid,
    annualQuota: values.uncapped ? null : Number(values.annualQuota),
    carryForward: values.carryForward,
    carryForwardCap: values.carryForward
      ? Number(values.carryForwardCap)
      : null,
    applicability: values.applicability,
  }
}
