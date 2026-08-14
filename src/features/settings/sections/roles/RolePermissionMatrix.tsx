import { memo } from 'react'
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from '../../types'
import type { PermissionAction, PermissionModule, UserRole } from '../../types'

interface RolePermissionMatrixProps {
  role: UserRole
  readOnly: boolean
  onToggle: (
    module: PermissionModule,
    action: PermissionAction,
    granted: boolean,
  ) => void
  onToggleModule: (module: PermissionModule, granted: boolean) => void
}

/**
 * Modules down the side, actions across the top — the shape of the question an
 * administrator is actually asking ("what can this role do, and where?").
 *
 * The leading checkbox on each row grants or revokes the whole module, and
 * shows an indeterminate state when only some actions are granted, so the row
 * always reports the truth rather than rounding it to on or off.
 */
export const RolePermissionMatrix = memo(function RolePermissionMatrix({
  role,
  readOnly,
  onToggle,
  onToggleModule,
}: RolePermissionMatrixProps) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 560 }}>
        <TableHead>
          <TableRow>
            <TableCell>Module</TableCell>
            {PERMISSION_ACTIONS.map((action) => (
              <TableCell key={action.value} align="center">
                {action.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {PERMISSION_MODULES.map((module) => {
            const granted = role.permissions[module.value]
            const grantedCount = PERMISSION_ACTIONS.filter(
              (action) => granted[action.value],
            ).length

            const allGranted = grantedCount === PERMISSION_ACTIONS.length
            const someGranted = grantedCount > 0 && !allGranted

            return (
              <TableRow key={module.value} hover>
                <TableCell>
                  <Checkbox
                    size="small"
                    checked={allGranted}
                    indeterminate={someGranted}
                    disabled={readOnly}
                    onChange={(event) =>
                      onToggleModule(module.value, event.target.checked)
                    }
                    slotProps={{
                      input: {
                        'aria-label': `All ${module.label} permissions for ${role.name}`,
                      },
                    }}
                  />
                  <Typography component="span" variant="body2">
                    {module.label}
                  </Typography>
                </TableCell>

                {PERMISSION_ACTIONS.map((action) => (
                  <TableCell key={action.value} align="center">
                    <Checkbox
                      size="small"
                      checked={granted[action.value]}
                      disabled={readOnly}
                      onChange={(event) =>
                        onToggle(
                          module.value,
                          action.value,
                          event.target.checked,
                        )
                      }
                      slotProps={{
                        input: {
                          'aria-label': `${action.label} ${module.label} — ${role.name}`,
                        },
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
})
