import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material'
import {
  EMPTY_CHECKPOINT_FORM,
  checkpointSchema,
  toCheckpointFormValues,
} from '../../schemas/probationSchema'
import type { CheckpointFormValues } from '../../schemas/probationSchema'
import { OWNER_ROLES } from '../../types'
import type { ProbationCheckpoint } from '../../types'

interface CheckpointFormDialogProps {
  checkpoint: ProbationCheckpoint | null
  onClose: () => void
  onSave: (values: CheckpointFormValues) => void
}

export function CheckpointFormDialog({
  checkpoint,
  onClose,
  onSave,
}: CheckpointFormDialogProps) {
  const isEditing = checkpoint !== null

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckpointFormValues>({
    resolver: zodResolver(checkpointSchema),
    defaultValues: checkpoint
      ? toCheckpointFormValues(checkpoint)
      : EMPTY_CHECKPOINT_FORM,
  })

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="checkpoint-dialog-title"
    >
      <form onSubmit={handleSubmit(onSave)} noValidate>
        <DialogTitle id="checkpoint-dialog-title">
          {isEditing ? 'Edit checkpoint' : 'Add checkpoint'}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="Checkpoint"
                required
                autoFocus
                error={Boolean(errors.label)}
                helperText={errors.label?.message}
                {...register('label')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Day of probation"
                required
                error={Boolean(errors.atDay)}
                helperText={
                  errors.atDay?.message ?? 'Counted from the joining date'
                }
                {...register('atDay')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="ownerRole"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Owner">
                    {OWNER_ROLES.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEditing ? 'Save changes' : 'Add checkpoint'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
