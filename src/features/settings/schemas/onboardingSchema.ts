import { z } from 'zod'
import { OWNER_ROLES } from '../types'
import type { OnboardingStage, OnboardingTask } from '../types'

export const stageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Stage name is required')
    .max(60, 'Stage name must be 60 characters or fewer'),

  description: z
    .string()
    .trim()
    .max(160, 'Description must be 160 characters or fewer'),
})

export type StageFormValues = z.infer<typeof stageSchema>

export const EMPTY_STAGE_FORM: StageFormValues = { name: '', description: '' }

export function toStageFormValues(stage: OnboardingStage): StageFormValues {
  return { name: stage.name, description: stage.description }
}

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task name is required')
    .max(120, 'Task name must be 120 characters or fewer'),

  ownerRole: z.enum(OWNER_ROLES),

  // `0` is meaningful — it means "before or on the joining date".
  dueWithinDays: z
    .string()
    .trim()
    .min(1, 'Due-by is required')
    .regex(/^\d+$/, 'Due-by must be a whole number of days')
    .refine(
      (value) => Number(value) <= 180,
      'Due-by must be within 180 days of joining',
    ),

  mandatory: z.boolean(),
})

export type TaskFormValues = z.infer<typeof taskSchema>

export const EMPTY_TASK_FORM: TaskFormValues = {
  title: '',
  ownerRole: 'HR',
  dueWithinDays: '3',
  mandatory: true,
}

export function toTaskFormValues(task: OnboardingTask): TaskFormValues {
  return {
    title: task.title,
    ownerRole: task.ownerRole,
    dueWithinDays: task.dueWithinDays.toString(),
    mandatory: task.mandatory,
  }
}

export function toOnboardingTask(
  id: string,
  values: TaskFormValues,
): OnboardingTask {
  return {
    id,
    title: values.title,
    ownerRole: values.ownerRole,
    dueWithinDays: Number(values.dueWithinDays),
    mandatory: values.mandatory,
  }
}
