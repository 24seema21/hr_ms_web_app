import { z } from 'zod'
import { dayCountField } from './formPrimitives'
import { OWNER_ROLES } from '../types'
import type { ProbationCheckpoint, ProbationPolicy } from '../types'

export const probationPolicySchema = z
  .object({
    defaultDurationDays: dayCountField('Probation duration', 7, 365),
    maxExtensionDays: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Maximum extension must be a whole number')
      .refine(
        (value) => Number(value) <= 365,
        'Maximum extension must be 365 days or fewer',
      ),
    extensionsAllowed: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Extensions allowed must be a whole number')
      .refine((value) => Number(value) <= 5, 'Allow at most 5 extensions'),
    autoConfirmOnCompletion: z.boolean(),
  })
  .refine(
    (values) =>
      Number(values.extensionsAllowed) === 0 ||
      Number(values.maxExtensionDays) > 0,
    {
      message: 'Set a maximum extension length, or allow zero extensions',
      path: ['maxExtensionDays'],
    },
  )

export type ProbationPolicyFormValues = z.infer<typeof probationPolicySchema>

export function toProbationFormValues(
  policy: ProbationPolicy,
): ProbationPolicyFormValues {
  return {
    defaultDurationDays: policy.defaultDurationDays.toString(),
    maxExtensionDays: policy.maxExtensionDays.toString(),
    extensionsAllowed: policy.extensionsAllowed.toString(),
    autoConfirmOnCompletion: policy.autoConfirmOnCompletion,
  }
}

export const checkpointSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Checkpoint name is required')
    .max(80, 'Checkpoint name must be 80 characters or fewer'),

  atDay: dayCountField('Checkpoint day', 1, 365),

  ownerRole: z.enum(OWNER_ROLES),
})

export type CheckpointFormValues = z.infer<typeof checkpointSchema>

export const EMPTY_CHECKPOINT_FORM: CheckpointFormValues = {
  label: '',
  atDay: '',
  ownerRole: 'Manager',
}

export function toCheckpointFormValues(
  checkpoint: ProbationCheckpoint,
): CheckpointFormValues {
  return {
    label: checkpoint.label,
    atDay: checkpoint.atDay.toString(),
    ownerRole: checkpoint.ownerRole,
  }
}

export function toProbationCheckpoint(
  id: string,
  values: CheckpointFormValues,
): ProbationCheckpoint {
  return {
    id,
    label: values.label,
    atDay: Number(values.atDay),
    ownerRole: values.ownerRole,
  }
}
