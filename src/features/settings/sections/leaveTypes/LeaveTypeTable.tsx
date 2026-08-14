import { memo } from 'react'
import {
  Box,
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
import { formatApplicability, formatQuota } from '../../lib/formatters'
import type { LeaveTypeSetting } from '../../types'

interface LeaveTypeTableProps {
  leaveTypes: LeaveTypeSetting[]
  onEdit: (leaveType: LeaveTypeSetting) => void
  onDelete: (leaveType: LeaveTypeSetting) => void
}

export const LeaveTypeTable = memo(function LeaveTypeTable({
  leaveTypes,
  onEdit,
  onDelete,
}: LeaveTypeTableProps) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 820 }}>
        <TableHead>
          <TableRow>
            <TableCell>Leave type</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Annual quota</TableCell>
            <TableCell>Carry forward</TableCell>
            <TableCell>Applies to</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {leaveTypes.map((leaveType) => (
            <TableRow key={leaveType.id} hover>
              <TableCell>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  {/*
                    The colour is decoration here — the name beside it already
                    carries the meaning — so it is hidden from assistive tech
                    rather than announced as an unnamed swatch.
                  */}
                  <Box
                    aria-hidden="true"
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: leaveType.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {leaveType.name}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Typography variant="overline" color="text.secondary">
                  {leaveType.shortCode}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  size="small"
                  label={leaveType.paid ? 'Paid' : 'Unpaid'}
                  color={leaveType.paid ? 'primary' : 'default'}
                  variant={leaveType.paid ? 'filled' : 'outlined'}
                />
              </TableCell>

              <TableCell>
                <Typography variant="body2">
                  {formatQuota(leaveType.annualQuota)}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2">
                  {leaveType.carryForward
                    ? `Up to ${leaveType.carryForwardCap} days`
                    : 'Not allowed'}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatApplicability(leaveType.applicability)}
                </Typography>
              </TableCell>

              <TableCell align="right">
                <RowActions
                  label={leaveType.name}
                  onEdit={() => onEdit(leaveType)}
                  onDelete={() => onDelete(leaveType)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
})
