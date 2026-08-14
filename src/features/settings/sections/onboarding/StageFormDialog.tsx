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
  EMPTY_STAGE_FORM,
  stageSchema,
  toStageFormValues,
} from '../../schemas/onboardingSchema'
import type { StageFormValues } from '../../schemas/onboardingSchema'
import type { OnboardingStage } from '../../types'

interface StageFormDialogProps {
  stage: OnboardingStage | null
  onClose: () => void
  onSave: (values: StageFormValues) => void
}

export function StageFormDialog({
  stage,
  onClose,
  onSave,
}: StageFormDialogProps) {
  const isEditing = stage !== null

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StageFormValues>({
    resolver: zodResolver(stageSchema),
    defaultValues: stage ? toStageFormValues(stage) : EMPTY_STAGE_FORM,
  })

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="stage-dialog-title"
    >
      <form onSubmit={handleSubmit(onSave)} noValidate>
        <DialogTitle id="stage-dialog-title">
          {isEditing ? `Edit ${stage.name}` : 'Add stage'}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Stage name"
              required
              autoFocus
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register('name')}
            />

            <TextField
              label="Description"
              multiline
              minRows={2}
              error={Boolean(errors.description)}
              helperText={
                errors.description?.message ??
                'Shown to whoever is completing this stage.'
              }
              {...register('description')}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEditing ? 'Save changes' : 'Add stage'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
