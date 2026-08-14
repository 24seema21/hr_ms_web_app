import { z } from 'zod'
import type { UserRole } from '../types'

/*
  The dialog collects a role's identity only. Permissions are edited directly
  in the matrix, where the grid of modules against actions is the whole point —
  folding twenty checkboxes into this form would hide the comparison between
  roles that the matrix exists to show.
*/
export const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Role name is required')
    .max(50, 'Role name must be 50 characters or fewer'),

  description: z
    .string()
    .trim()
    .min(1, 'Describe what this role is for')
    .max(160, 'Description must be 160 characters or fewer'),
})

export type RoleFormValues = z.infer<typeof roleSchema>

export const EMPTY_ROLE_FORM: RoleFormValues = { name: '', description: '' }

export function toRoleFormValues(role: UserRole): RoleFormValues {
  return { name: role.name, description: role.description }
}
