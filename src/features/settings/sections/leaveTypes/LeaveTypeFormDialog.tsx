import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { LEAVE_COLOR_SWATCHES } from '../../theme/settingsTokens'
import {
  EMPTY_LEAVE_TYPE_FORM,
  leaveTypeSchema,
  toLeaveTypeFormValues,
} from '../../schemas/leaveTypeSchema'
import type { LeaveTypeFormValues } from '../../schemas/leaveTypeSchema'
import { LEAVE_APPLICABILITY } from '../../types'
import type { LeaveTypeSetting } from '../../types'

interface LeaveTypeFormDialogProps {
  leaveType: LeaveTypeSetting | null
  onClose: () => void
  onSave: (values: LeaveTypeFormValues) => void
}

export function LeaveTypeFormDialog({
  leaveType,
  onClose,
  onSave,
}: LeaveTypeFormDialogProps) {
  const isEditing = leaveType !== null

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: leaveType
      ? toLeaveTypeFormValues(leaveType)
      : EMPTY_LEAVE_TYPE_FORM,
  })

  /*
    `useWatch` rather than the `watch()` returned by `useForm`: watch() is a
    function identity React Compiler refuses to memoise around, which opts this
    whole component out of compilation. Both values drive whether a field below
    is usable, so the component does have to re-render when they change.
  */
  const isUncapped = useWatch({ control, name: 'uncapped' })
  const carriesForward = useWatch({ control, name: 'carryForward' })

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="leave-type-dialog-title"
    >
      <form onSubmit={handleSubmit(onSave)} noValidate>
        <DialogTitle id="leave-type-dialog-title">
          {isEditing ? `Edit ${leaveType.name}` : 'Add leave type'}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label="Leave type name"
                required
                autoFocus
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                {...register('name')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Short code"
                required
                error={Boolean(errors.shortCode)}
                helperText={errors.shortCode?.message ?? 'e.g. CL, SL, EL'}
                slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
                {...register('shortCode')}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <FormControl error={Boolean(errors.color)} fullWidth>
                    <FormLabel
                      id="colour-tag-label"
                      sx={{ mb: 1, fontSize: '0.875rem' }}
                    >
                      Colour tag
                    </FormLabel>

                    {/*
                      Radios styled as swatches. `role="radiogroup"` plus a
                      checked state per button is what makes this reachable by
                      arrow key and announced as a choice, which a row of
                      coloured `<div>`s would not be.
                    */}
                    <Box
                      role="radiogroup"
                      aria-labelledby="colour-tag-label"
                      sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
                    >
                      {LEAVE_COLOR_SWATCHES.map((swatch) => {
                        const isSelected = field.value === swatch

                        return (
                          <Box
                            key={swatch}
                            component="button"
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={`Colour ${swatch}`}
                            onClick={() => field.onChange(swatch)}
                            sx={{
                              width: 36,
                              height: 36,
                              p: 0,
                              cursor: 'pointer',
                              borderRadius: '50%',
                              backgroundColor: swatch,
                              border: 2,
                              borderColor: isSelected
                                ? 'text.primary'
                                : 'transparent',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#fff',
                            }}
                          >
                            {isSelected ? (
                              <CheckIcon sx={{ fontSize: 18 }} />
                            ) : null}
                          </Box>
                        )
                      })}
                    </Box>

                    {errors.color ? (
                      <FormHelperText>{errors.color.message}</FormHelperText>
                    ) : null}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="paid"
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
                    label="Paid leave"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="uncapped"
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
                    label="Uncapped"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Annual quota (days)"
                disabled={isUncapped}
                error={Boolean(errors.annualQuota)}
                helperText={
                  isUncapped
                    ? 'No annual limit applies'
                    : errors.annualQuota?.message
                }
                {...register('annualQuota')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="carryForward"
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
                    label="Carry forward unused days"
                  />
                )}
              />
            </Grid>

            {carriesForward ? (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Carry-forward cap (days)"
                  error={Boolean(errors.carryForwardCap)}
                  helperText={
                    errors.carryForwardCap?.message ??
                    'Maximum balance that may roll into next year'
                  }
                  {...register('carryForwardCap')}
                />
              </Grid>
            ) : null}

            <Grid size={12}>
              <Controller
                name="applicability"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Applies to">
                    {LEAVE_APPLICABILITY.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
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
            {isEditing ? 'Save changes' : 'Add leave type'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
