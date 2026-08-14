import { useCallback, useState } from 'react'
import { Alert, Button, Card, Link as MuiLink } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { SectionHeader } from '../../components/SectionHeader'
import { SettingsEmptyState } from '../../components/SettingsEmptyState'
import { useFeedback } from '../../hooks/useFeedback'
import { createMockId, useMockCollection } from '../../hooks/useMockCollection'
import { LEAVE_TYPE_SETTINGS } from '../../mock/leaveTypeMock'
import { toLeaveTypeSetting } from '../../schemas/leaveTypeSchema'
import type { LeaveTypeFormValues } from '../../schemas/leaveTypeSchema'
import type { LeaveTypeSetting, SettingsSectionId } from '../../types'
import { LeaveTypeFormDialog } from './LeaveTypeFormDialog'
import { LeaveTypeTable } from './LeaveTypeTable'

interface LeaveTypeConfigProps {
  /** Lets the cross-reference below jump to the probation section. */
  onNavigate: (section: SettingsSectionId) => void
}

export function LeaveTypeConfig({ onNavigate }: LeaveTypeConfigProps) {
  const { items, create, update, remove } =
    useMockCollection(LEAVE_TYPE_SETTINGS)
  const { notify } = useFeedback()

  const [formTarget, setFormTarget] = useState<
    LeaveTypeSetting | 'new' | null
  >(null)
  const [pendingDelete, setPendingDelete] = useState<LeaveTypeSetting | null>(
    null,
  )

  const handleSave = useCallback(
    (values: LeaveTypeFormValues) => {
      const isEditing = formTarget !== null && formTarget !== 'new'
      const id = isEditing ? formTarget.id : createMockId('leave')
      const record = toLeaveTypeSetting(id, values)

      if (isEditing) {
        update(record)
        notify(`${record.name} updated`)
      } else {
        create(record)
        notify(`${record.name} added`)
      }

      setFormTarget(null)
    },
    [formTarget, create, update, notify],
  )

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return

    remove(pendingDelete.id)
    notify(`${pendingDelete.name} deleted`)
    setPendingDelete(null)
  }, [pendingDelete, remove, notify])

  const handleEdit = useCallback(
    (leaveType: LeaveTypeSetting) => setFormTarget(leaveType),
    [],
  )

  const addButton = (
    <Button
      variant="contained"
      startIcon={<AddOutlinedIcon />}
      onClick={() => setFormTarget('new')}
    >
      Add leave type
    </Button>
  )

  return (
    <>
      <SectionHeader
        title="Leave Type Configuration"
        description="The leave types employees can apply for, their entitlements and how unused balance is treated at year end."
        action={items.length > 0 ? addButton : undefined}
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        Employees serving probation may be entitled to less than the quotas
        below.{' '}
        <MuiLink
          component="button"
          type="button"
          onClick={() => onNavigate('probation')}
        >
          Review the probation rules
        </MuiLink>
        .
      </Alert>

      {items.length === 0 ? (
        <SettingsEmptyState
          title="No leave types configured"
          description="Employees cannot apply for leave until at least one type exists. Start with the statutory types your locations require."
          action={addButton}
        />
      ) : (
        <Card>
          <LeaveTypeTable
            leaveTypes={items}
            onEdit={handleEdit}
            onDelete={setPendingDelete}
          />
        </Card>
      )}

      {formTarget !== null && (
        <LeaveTypeFormDialog
          leaveType={formTarget === 'new' ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete leave type?"
        description={`${pendingDelete?.name ?? 'This leave type'} will no longer be available to employees. Requests already approved against it are unaffected.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
