import { memo } from 'react'
import {
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { RowActions } from '../../components/RowActions'
import { formatWorkingDays } from '../../lib/formatters'
import type { OfficeLocation } from '../../types'

interface LocationTableProps {
  locations: OfficeLocation[]
  onEdit: (location: OfficeLocation) => void
  onDelete: (location: OfficeLocation) => void
}

export const LocationTable = memo(function LocationTable({
  locations,
  onEdit,
  onDelete,
}: LocationTableProps) {
  return (
    // The horizontal scroll lives on the table's own container, so a narrow
    // screen never scrolls the whole settings page sideways.
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell>Location</TableCell>
            <TableCell>City</TableCell>
            <TableCell>Timezone</TableCell>
            <TableCell>Working days</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {locations.map((location) => (
            <TableRow key={location.id} hover>
              <TableCell>
                <Stack spacing={0.25}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {location.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {location.addressLine}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Typography variant="body2">{location.city}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {location.state}, {location.country}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                >
                  {location.timezone}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2">
                  {formatWorkingDays(location.workingDays)}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  size="small"
                  label={location.status === 'active' ? 'Active' : 'Inactive'}
                  color={location.status === 'active' ? 'success' : 'default'}
                  variant={
                    location.status === 'active' ? 'filled' : 'outlined'
                  }
                />
              </TableCell>

              <TableCell align="right">
                <RowActions
                  label={location.name}
                  onEdit={() => onEdit(location)}
                  onDelete={() => onDelete(location)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
})
