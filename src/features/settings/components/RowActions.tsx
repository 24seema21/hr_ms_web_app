import { memo } from 'react'
import { IconButton, Stack, Tooltip } from '@mui/material'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'

interface RowActionsProps {
  /** Names the record, so the buttons read as "Edit Pune HQ" to a screen reader. */
  label: string
  onEdit: () => void
  onDelete: () => void
  /** Set for records the API will refuse to remove, e.g. built-in roles. */
  deleteDisabled?: boolean
  deleteDisabledReason?: string
}

/**
 * The edit/delete pair at the end of a settings row.
 *
 * A disabled delete keeps its tooltip by wrapping the button in a span — MUI
 * tooltips need an element that still fires pointer events, and a disabled
 * button does not.
 */
export const RowActions = memo(function RowActions({
  label,
  onEdit,
  onDelete,
  deleteDisabled = false,
  deleteDisabledReason,
}: RowActionsProps) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
      <Tooltip title={`Edit ${label}`}>
        <IconButton size="small" onClick={onEdit} aria-label={`Edit ${label}`}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip
        title={
          deleteDisabled
            ? (deleteDisabledReason ?? 'This record cannot be deleted')
            : `Delete ${label}`
        }
      >
        <span>
          <IconButton
            size="small"
            color="error"
            onClick={onDelete}
            disabled={deleteDisabled}
            aria-label={`Delete ${label}`}
          >
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  )
})
