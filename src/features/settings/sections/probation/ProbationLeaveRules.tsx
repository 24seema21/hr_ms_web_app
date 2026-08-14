import { memo } from 'react'
import {
  Box,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { LEAVE_TYPE_SETTINGS } from '../../mock/leaveTypeMock'
import { formatQuota } from '../../lib/formatters'
import type { ProbationLeaveRule } from '../../types'

interface ProbationLeaveRulesProps {
  rules: ProbationLeaveRule[]
  onToggle: (leaveTypeId: string, allowed: boolean) => void
  onQuotaChange: (leaveTypeId: string, quota: string) => void
}

/*
  Leave types are read from the same mock the Leave Type section edits, so the
  two screens cannot disagree about which types exist. A type added there shows
  up here without a rule until one is set — hence the `?? ` fallbacks below.
*/
export const ProbationLeaveRules = memo(function ProbationLeaveRules({
  rules,
  onToggle,
  onQuotaChange,
}: ProbationLeaveRulesProps) {
  const ruleFor = new Map(rules.map((rule) => [rule.leaveTypeId, rule]))

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 620 }}>
        <TableHead>
          <TableRow>
            <TableCell>Leave type</TableCell>
            <TableCell>Standard quota</TableCell>
            <TableCell>Available on probation</TableCell>
            <TableCell>Quota during probation</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {LEAVE_TYPE_SETTINGS.map((leaveType) => {
            const rule = ruleFor.get(leaveType.id)
            const allowed = rule?.allowed ?? false

            return (
              <TableRow key={leaveType.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: leaveType.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2">{leaveType.name}</Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatQuota(leaveType.annualQuota)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Switch
                    checked={allowed}
                    onChange={(event) =>
                      onToggle(leaveType.id, event.target.checked)
                    }
                    slotProps={{
                      input: {
                        'aria-label': `${leaveType.name} available during probation`,
                      },
                    }}
                  />
                </TableCell>

                <TableCell sx={{ width: 200 }}>
                  {/*
                    Named with `aria-label` rather than a visible `label`: the
                    column header carries the meaning for sighted users, and a
                    label hidden with `display:none` would be dropped from the
                    accessibility tree as well, leaving the input unnamed.
                  */}
                  <TextField
                    size="small"
                    disabled={!allowed}
                    value={rule?.quotaDuringProbation?.toString() ?? ''}
                    placeholder={allowed ? 'Uncapped' : '—'}
                    onChange={(event) =>
                      onQuotaChange(leaveType.id, event.target.value)
                    }
                    slotProps={{
                      htmlInput: {
                        'aria-label': `${leaveType.name} quota during probation, in days`,
                        inputMode: 'numeric',
                      },
                    }}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
})
