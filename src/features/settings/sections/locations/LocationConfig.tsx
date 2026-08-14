import { useCallback, useState } from 'react'
import { Button, Card } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { SectionHeader } from '../../components/SectionHeader'
import { SettingsEmptyState } from '../../components/SettingsEmptyState'
import { useFeedback } from '../../hooks/useFeedback'
import { createMockId, useMockCollection } from '../../hooks/useMockCollection'
import { OFFICE_LOCATIONS } from '../../mock/locationMock'
import type { LocationFormValues } from '../../schemas/locationSchema'
import type { OfficeLocation } from '../../types'
import { LocationFormDialog } from './LocationFormDialog'
import { LocationTable } from './LocationTable'

export function LocationConfig() {
  const { items, create, update, remove } = useMockCollection(OFFICE_LOCATIONS)
  const { notify } = useFeedback()

  // `null` while closed. Opening for a new record uses the `'new'` sentinel so
  // one piece of state covers create, edit and closed without three booleans.
  const [formTarget, setFormTarget] = useState<OfficeLocation | 'new' | null>(
    null,
  )
  const [pendingDelete, setPendingDelete] = useState<OfficeLocation | null>(
    null,
  )

  const closeForm = useCallback(() => setFormTarget(null), [])

  const handleSave = useCallback(
    (values: LocationFormValues) => {
      const isEditing = formTarget !== null && formTarget !== 'new'

      if (isEditing) {
        update({ ...formTarget, ...values })
        notify(`${values.name} updated`)
      } else {
        create({ id: createMockId('loc'), ...values })
        notify(`${values.name} added`)
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
    (location: OfficeLocation) => setFormTarget(location),
    [],
  )

  const addButton = (
    <Button
      variant="contained"
      startIcon={<AddOutlinedIcon />}
      onClick={() => setFormTarget('new')}
    >
      Add location
    </Button>
  )

  return (
    <>
      <SectionHeader
        title="Location Configuration"
        description="Offices and branches employees can be assigned to, with the working week each one keeps."
        action={items.length > 0 ? addButton : undefined}
      />

      {items.length === 0 ? (
        <SettingsEmptyState
          title="No locations yet"
          description="Add your first office or branch. Employees are assigned to a location, and attendance rules follow its working week."
          action={addButton}
        />
      ) : (
        <Card>
          <LocationTable
            locations={items}
            onEdit={handleEdit}
            onDelete={setPendingDelete}
          />
        </Card>
      )}

      {formTarget !== null && (
        <LocationFormDialog
          location={formTarget === 'new' ? null : formTarget}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete location?"
        description={`${pendingDelete?.name ?? 'This location'} will be removed. Employees assigned to it will need a new location before payroll can run.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
