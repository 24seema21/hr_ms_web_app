import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { COUNTRIES, TIMEZONES } from '../../mock/locationMock'
import {
  EMPTY_LOCATION_FORM,
  locationSchema,
  toLocationFormValues,
} from '../../schemas/locationSchema'
import type { LocationFormValues } from '../../schemas/locationSchema'
import { WEEKDAYS } from '../../types'
import type { OfficeLocation } from '../../types'

interface LocationFormDialogProps {
  /** `null` creates; a location edits that location. */
  location: OfficeLocation | null
  onClose: () => void
  onSave: (values: LocationFormValues) => void
}

/**
 * Create/edit for a location, in a dialog.
 *
 * Mounted only while open, so `defaultValues` are read once per opening and
 * there is no "reset when the record changes" effect to get wrong.
 */
export function LocationFormDialog({
  location,
  onClose,
  onSave,
}: LocationFormDialogProps) {
  const isEditing = location !== null

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: location
      ? toLocationFormValues(location)
      : EMPTY_LOCATION_FORM,
  })

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="location-dialog-title"
    >
      <form onSubmit={handleSubmit(onSave)} noValidate>
        <DialogTitle id="location-dialog-title">
          {isEditing ? `Edit ${location.name}` : 'Add location'}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="Location name"
                required
                autoFocus
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                {...register('name')}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Address"
                required
                error={Boolean(errors.addressLine)}
                helperText={errors.addressLine?.message}
                {...register('addressLine')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="City"
                required
                error={Boolean(errors.city)}
                helperText={errors.city?.message}
                {...register('city')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="State or region"
                required
                error={Boolean(errors.state)}
                helperText={errors.state?.message}
                {...register('state')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Country"
                    required
                    error={Boolean(errors.country)}
                    helperText={errors.country?.message}
                  >
                    {COUNTRIES.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Timezone"
                    required
                    error={Boolean(errors.timezone)}
                    helperText={errors.timezone?.message}
                  >
                    {TIMEZONES.map((zone) => (
                      <MenuItem key={zone} value={zone}>
                        {zone}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="workingDays"
                control={control}
                render={({ field }) => (
                  <FormControl error={Boolean(errors.workingDays)} fullWidth>
                    <FormLabel
                      id="working-days-label"
                      sx={{ mb: 1, fontSize: '0.875rem' }}
                    >
                      Working days
                    </FormLabel>

                    {/*
                      A multi-select toggle group rather than seven checkboxes:
                      the working week is read at a glance far more often than
                      it is edited.
                    */}
                    <ToggleButtonGroup
                      {...field}
                      aria-labelledby="working-days-label"
                      size="small"
                      onChange={(_, value: string[]) => field.onChange(value)}
                      sx={{ flexWrap: 'wrap' }}
                    >
                      {WEEKDAYS.map((day) => (
                        <ToggleButton
                          key={day.key}
                          value={day.key}
                          sx={{ px: 2 }}
                        >
                          {day.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>

                    {errors.workingDays ? (
                      <FormHelperText>
                        {errors.workingDays.message}
                      </FormHelperText>
                    ) : null}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Status">
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEditing ? 'Save changes' : 'Add location'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
