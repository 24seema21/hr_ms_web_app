import { useCallback, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { RowActions } from '../../components/RowActions'
import { SectionHeader } from '../../components/SectionHeader'
import { useFeedback } from '../../hooks/useFeedback'
import { createMockId } from '../../hooks/useMockCollection'
import { PROBATION_POLICY } from '../../mock/probationMock'
import {
  probationPolicySchema,
  toProbationCheckpoint,
  toProbationFormValues,
} from '../../schemas/probationSchema'
import type {
  CheckpointFormValues,
  ProbationPolicyFormValues,
} from '../../schemas/probationSchema'
import type { ProbationCheckpoint, ProbationLeaveRule } from '../../types'
import { CheckpointFormDialog } from './CheckpointFormDialog'
import { ProbationLeaveRules } from './ProbationLeaveRules'

/**
 * Probation rules — one policy object rather than a list, so this section uses
 * plain `useState` instead of the collection hook the other sections share.
 */
export function ProbationConfig() {
  const { notify } = useFeedback()

  const [checkpoints, setCheckpoints] = useState<ProbationCheckpoint[]>(
    PROBATION_POLICY.checkpoints,
  )
  const [leaveRules, setLeaveRules] = useState<ProbationLeaveRule[]>(
    PROBATION_POLICY.leaveRules,
  )

  const [checkpointForm, setCheckpointForm] = useState<
    ProbationCheckpoint | 'new' | null
  >(null)
  const [pendingDelete, setPendingDelete] =
    useState<ProbationCheckpoint | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProbationPolicyFormValues>({
    resolver: zodResolver(probationPolicySchema),
    defaultValues: toProbationFormValues(PROBATION_POLICY),
  })

  const savePolicy = useCallback(
    (values: ProbationPolicyFormValues) => {
      // `reset(values)` re-baselines the form so `isDirty` goes back to false
      // and the Save button correctly reads as "nothing to save".
      reset(values)
      notify('Probation policy saved')
    },
    [reset, notify],
  )

  /* ── Checkpoints ──────────────────────────────────────────────────────── */

  const saveCheckpoint = useCallback(
    (values: CheckpointFormValues) => {
      const isEditing = checkpointForm !== null && checkpointForm !== 'new'
      const record = toProbationCheckpoint(
        isEditing ? checkpointForm.id : createMockId('checkpoint'),
        values,
      )

      setCheckpoints((current) => {
        const next = isEditing
          ? current.map((item) => (item.id === record.id ? record : item))
          : [...current, record]

        // Kept in day order, because a checkpoint list that reads 30, 85, 60 is
        // a list nobody can sanity-check at a glance.
        return [...next].sort((a, b) => a.atDay - b.atDay)
      })

      notify(isEditing ? 'Checkpoint updated' : 'Checkpoint added')
      setCheckpointForm(null)
    },
    [checkpointForm, notify],
  )

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return

    setCheckpoints((current) =>
      current.filter((item) => item.id !== pendingDelete.id),
    )
    notify(`${pendingDelete.label} deleted`)
    setPendingDelete(null)
  }, [pendingDelete, notify])

  /* ── Leave rules ──────────────────────────────────────────────────────── */

  const toggleLeaveRule = useCallback((leaveTypeId: string, allowed: boolean) => {
    setLeaveRules((current) => {
      const exists = current.some((rule) => rule.leaveTypeId === leaveTypeId)

      if (!exists) {
        return [...current, { leaveTypeId, allowed, quotaDuringProbation: null }]
      }

      return current.map((rule) =>
        rule.leaveTypeId === leaveTypeId
          ? {
              ...rule,
              allowed,
              // Blocking a type clears its quota, so re-enabling it never
              // silently restores a number nobody has looked at since.
              quotaDuringProbation: allowed ? rule.quotaDuringProbation : null,
            }
          : rule,
      )
    })
  }, [])

  const changeLeaveQuota = useCallback((leaveTypeId: string, quota: string) => {
    // Non-numeric keystrokes are dropped rather than rejected after the fact —
    // this grid has no submit button to hang a validation message off.
    const digits = quota.replace(/\D/g, '')

    setLeaveRules((current) =>
      current.map((rule) =>
        rule.leaveTypeId === leaveTypeId
          ? {
              ...rule,
              quotaDuringProbation: digits === '' ? null : Number(digits),
            }
          : rule,
      ),
    )
  }, [])

  return (
    <>
      <SectionHeader
        title="Probation Period Configuration"
        description="How long probation runs, when it is reviewed, and which leave types behave differently while it lasts."
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Probation period"
              slotProps={{ title: { variant: 'subtitle1', fontWeight: 600 } }}
            />
            <Divider />

            <form onSubmit={handleSubmit(savePolicy)} noValidate>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Default duration (days)"
                      required
                      error={Boolean(errors.defaultDurationDays)}
                      helperText={errors.defaultDurationDays?.message}
                      {...register('defaultDurationDays')}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Extensions allowed"
                      error={Boolean(errors.extensionsAllowed)}
                      helperText={
                        errors.extensionsAllowed?.message ?? '0 to disallow'
                      }
                      {...register('extensionsAllowed')}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Maximum extension (days)"
                      error={Boolean(errors.maxExtensionDays)}
                      helperText={errors.maxExtensionDays?.message}
                      {...register('maxExtensionDays')}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Controller
                      name="autoConfirmOnCompletion"
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
                          label="Confirm automatically when probation ends"
                        />
                      )}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block' }}
                    >
                      When off, HR must confirm each employee manually.
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>

              <Divider />

              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" disabled={!isDirty}>
                  Save policy
                </Button>
              </Box>
            </form>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Evaluation checkpoints"
              slotProps={{ title: { variant: 'subtitle1', fontWeight: 600 } }}
              action={
                <Button
                  size="small"
                  startIcon={<AddOutlinedIcon />}
                  onClick={() => setCheckpointForm('new')}
                >
                  Add
                </Button>
              }
            />
            <Divider />

            {checkpoints.length === 0 ? (
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  No checkpoints set. Probation will run to its end date without
                  a scheduled review.
                </Typography>
              </CardContent>
            ) : (
              <List disablePadding>
                {checkpoints.map((checkpoint, index) => (
                  <ListItem
                    key={checkpoint.id}
                    divider={index < checkpoints.length - 1}
                    secondaryAction={
                      <RowActions
                        label={checkpoint.label}
                        onEdit={() => setCheckpointForm(checkpoint)}
                        onDelete={() => setPendingDelete(checkpoint)}
                      />
                    }
                  >
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                        >
                          <Typography variant="body2">
                            {checkpoint.label}
                          </Typography>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`Day ${checkpoint.atDay}`}
                          />
                        </Stack>
                      }
                      secondary={`Owner: ${checkpoint.ownerRole}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardHeader
              title="Leave during probation"
              subheader="Overrides the standard entitlements while an employee is on probation."
              slotProps={{
                title: { variant: 'subtitle1', fontWeight: 600 },
                subheader: { variant: 'body2' },
              }}
            />
            <Divider />

            <ProbationLeaveRules
              rules={leaveRules}
              onToggle={toggleLeaveRule}
              onQuotaChange={changeLeaveQuota}
            />
          </Card>
        </Grid>
      </Grid>

      {checkpointForm !== null && (
        <CheckpointFormDialog
          checkpoint={checkpointForm === 'new' ? null : checkpointForm}
          onClose={() => setCheckpointForm(null)}
          onSave={saveCheckpoint}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete checkpoint?"
        description={`${pendingDelete?.label ?? 'This checkpoint'} will no longer be scheduled during probation.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
