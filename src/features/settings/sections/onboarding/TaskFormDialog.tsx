import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material'
import {
  EMPTY_TASK_FORM,
  taskSchema,
  toTaskFormValues,
} from '../../schemas/onboardingSchema'
import type { TaskFormValues } from '../../schemas/onboardingSchema'
import { OWNER_ROLES } from '../../types'
import type { OnboardingTask } from '../../types'

interface TaskFormDialogProps {
  task: OnboardingTask | null
  /** Named in the title so it is clear which stage the task is joining. */
  stageName: string
  onClose: () => void
  onSave: (values: TaskFormValues) => void
}

export function TaskFormDialog({
  task,
  stageName,
  onClose,
  onSave,
}: TaskFormDialogProps) {
  const isEditing = task !== null

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? toTaskFormValues(task) : EMPTY_TASK_FORM,
  })

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="task-dialog-title"
    >
      <form onSubmit={handleSubmit(onSave)} noValidate>
        <DialogTitle id="task-dialog-title">
          {isEditing ? 'Edit task' : `Add task to ${stageName}`}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="Task"
                required
                autoFocus
                error={Boolean(errors.title)}
                helperText={errors.title?.message}
                {...register('title')}
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Due within (days of joining)"
                required
                error={Boolean(errors.dueWithinDays)}
                helperText={
                  errors.dueWithinDays?.message ?? '0 means on the joining date'
                }
                {...register('dueWithinDays')}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="mandatory"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(event) =>
                          field.onChange(event.target.checked)
                        }
                      />
                    }
                    label="Mandatory — onboarding cannot complete without it"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEditing ? 'Save changes' : 'Add task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
