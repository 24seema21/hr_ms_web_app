import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardHeader,
  Divider,
  Grid,
} from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { SectionHeader } from '../../components/SectionHeader'
import { SettingsEmptyState } from '../../components/SettingsEmptyState'
import { useFeedback } from '../../hooks/useFeedback'
import { createMockId, useMockCollection } from '../../hooks/useMockCollection'
import { USER_ROLES, emptyPermissionMatrix } from '../../mock/roleMock'
import { PERMISSION_ACTIONS } from '../../types'
import type { RoleFormValues } from '../../schemas/roleSchema'
import type { PermissionAction, PermissionModule, UserRole } from '../../types'
import { RoleFormDialog } from './RoleFormDialog'
import { RoleList } from './RoleList'
import { RolePermissionMatrix } from './RolePermissionMatrix'

/** The role whose permissions must stay intact, or nobody can reach Settings. */
const LOCKED_ROLE_ID = 'role-admin'

export function UserRoleConfig() {
  const { items, create, update, remove } = useMockCollection(USER_ROLES)
  const { notify } = useFeedback()

  const [selectedId, setSelectedId] = useState<string | null>(
    USER_ROLES[0]?.id ?? null,
  )
  const [formTarget, setFormTarget] = useState<UserRole | 'new' | null>(null)
  const [pendingDelete, setPendingDelete] = useState<UserRole | null>(null)

  /*
    Derived rather than stored: deleting the selected role would otherwise
    leave `selectedId` pointing at a record that no longer exists, and the
    matrix would render nothing with no way back.
  */
  const selectedRole = useMemo(
    () => items.find((role) => role.id === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  )

  const isLocked = selectedRole?.id === LOCKED_ROLE_ID

  const handleSave = useCallback(
    (values: RoleFormValues) => {
      const isEditing = formTarget !== null && formTarget !== 'new'

      if (isEditing) {
        update({ ...formTarget, ...values })
        notify(`${values.name} updated`)
      } else {
        const role: UserRole = {
          id: createMockId('role'),
          ...values,
          system: false,
          memberCount: 0,
          permissions: emptyPermissionMatrix(),
        }
        create(role)
        setSelectedId(role.id)
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

  const togglePermission = useCallback(
    (
      module: PermissionModule,
      action: PermissionAction,
      granted: boolean,
    ) => {
      if (!selectedRole) return

      update({
        ...selectedRole,
        permissions: {
          ...selectedRole.permissions,
          [module]: { ...selectedRole.permissions[module], [action]: granted },
        },
      })
    },
    [selectedRole, update],
  )

  const toggleModule = useCallback(
    (module: PermissionModule, granted: boolean) => {
      if (!selectedRole) return

      const actions = Object.fromEntries(
        PERMISSION_ACTIONS.map((action) => [action.value, granted]),
      ) as Record<PermissionAction, boolean>

      update({
        ...selectedRole,
        permissions: { ...selectedRole.permissions, [module]: actions },
      })
    },
    [selectedRole, update],
  )

  const handleEdit = useCallback((role: UserRole) => setFormTarget(role), [])

  const addButton = (
    <Button
      variant="contained"
      startIcon={<AddOutlinedIcon />}
      onClick={() => setFormTarget('new')}
    >
      Add role
    </Button>
  )

  return (
    <>
      <SectionHeader
        title="User Role Configuration"
        description="Roles and what each one may do. Select a role to edit its permissions."
        action={items.length > 0 ? addButton : undefined}
      />

      {items.length === 0 || !selectedRole ? (
        <SettingsEmptyState
          title="No roles defined"
          description="Roles decide what each employee can see and change. Add one to begin granting access."
          action={addButton}
        />
      ) : (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title="Roles"
                slotProps={{ title: { variant: 'subtitle1', fontWeight: 600 } }}
              />
              <Divider />
              <RoleList
                roles={items}
                selectedId={selectedRole.id}
                onSelect={setSelectedId}
                onEdit={handleEdit}
                onDelete={setPendingDelete}
              />
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title={`${selectedRole.name} permissions`}
                subheader={selectedRole.description}
                slotProps={{
                  title: { variant: 'subtitle1', fontWeight: 600 },
                  subheader: { variant: 'body2' },
                }}
              />
              <Divider />

              {isLocked ? (
                <Alert severity="info" square>
                  The Administrator role always has full access, so that nobody
                  can be locked out of Settings.
                </Alert>
              ) : null}

              <RolePermissionMatrix
                role={selectedRole}
                readOnly={isLocked}
                onToggle={togglePermission}
                onToggleModule={toggleModule}
              />
            </Card>
          </Grid>
        </Grid>
      )}

      {formTarget !== null && (
        <RoleFormDialog
          role={formTarget === 'new' ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete role?"
        description={`${pendingDelete?.name ?? 'This role'} will be removed. Its ${pendingDelete?.memberCount ?? 0} member(s) must be reassigned before they can sign in.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
