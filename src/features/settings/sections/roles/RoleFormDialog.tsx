import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import {
  EMPTY_ROLE_FORM,
  roleSchema,
  toRoleFormValues,
} from '../../schemas/roleSchema'
import type { RoleFormValues } from '../../schemas/roleSchema'
import type { UserRole } from '../../types'

interface RoleFormDialogProps {
  role: UserRole | null
  onClose: () => void
  onSave: (values: RoleFormValues) => void
}

export function RoleFormDialog({
  role,
  onClose,
  onSave,
}: RoleFormDialogProps) {
  const isEditing = role !== null

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: role ? toRoleFormValues(role) : EMPTY_ROLE_FORM,
  })

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="role-dialog-title"
    >
      <form onSubmit={handleSubmit(onSave)} noValidate>
        <DialogTitle id="role-dialog-title">
          {isEditing ? `Edit ${role.name}` : 'Add role'}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Role name"
              required
              autoFocus
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register('name')}
            />

            <TextField
              label="Description"
              required
              multiline
              minRows={2}
              error={Boolean(errors.description)}
              helperText={
                errors.description?.message ??
                'Permissions are set in the matrix after the role is created.'
              }
              {...register('description')}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEditing ? 'Save changes' : 'Add role'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
