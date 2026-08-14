import { memo } from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import { RowActions } from '../../components/RowActions'
import { formatDueIn } from '../../lib/formatters'
import type { OnboardingStage, OnboardingTask } from '../../types'

/*
  Every callback takes the stage (or task) it acts on, rather than being a
  closure the parent builds per row. That is what lets the parent hand down
  `useCallback`-stable functions and makes the `memo` below actually hold —
  with inline arrows, editing one stage would re-render all of them.
*/
interface StageCardProps {
  stage: OnboardingStage
  position: number
  isFirst: boolean
  isLast: boolean
  onMoveStage: (stageId: string, delta: number) => void
  onEditStage: (stage: OnboardingStage) => void
  onDeleteStage: (stage: OnboardingStage) => void
  onAddTask: (stage: OnboardingStage) => void
  onEditTask: (stage: OnboardingStage, task: OnboardingTask) => void
  onDeleteTask: (stage: OnboardingStage, task: OnboardingTask) => void
  onMoveTask: (stage: OnboardingStage, taskId: string, delta: number) => void
}

/**
 * One onboarding stage and the tasks inside it.
 *
 * Reordering is a pair of arrow buttons rather than drag-and-drop: it is
 * keyboard-operable and screen-reader-announceable for free, which a bare
 * pointer-driven drag is not.
 */
export const StageCard = memo(function StageCard({
  stage,
  position,
  isFirst,
  isLast,
  onMoveStage,
  onEditStage,
  onDeleteStage,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
}: StageCardProps) {
  const mandatoryCount = stage.tasks.filter((task) => task.mandatory).length

  return (
    <Card>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ p: 2.5, alignItems: { sm: 'flex-start' } }}
      >
        <Box
          aria-hidden="true"
          sx={{
            width: 32,
            height: 32,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            bgcolor: 'action.selected',
            color: 'primary.main',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          {position}
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {stage.name}
            </Typography>
            <Chip
              size="small"
              variant="outlined"
              label={`${stage.tasks.length} ${stage.tasks.length === 1 ? 'task' : 'tasks'}, ${mandatoryCount} mandatory`}
            />
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {stage.description}
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Tooltip title="Move stage earlier">
            <span>
              <IconButton
                size="small"
                disabled={isFirst}
                onClick={() => onMoveStage(stage.id, -1)}
                aria-label={`Move ${stage.name} earlier`}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Move stage later">
            <span>
              <IconButton
                size="small"
                disabled={isLast}
                onClick={() => onMoveStage(stage.id, 1)}
                aria-label={`Move ${stage.name} later`}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <RowActions
            label={stage.name}
            onEdit={() => onEditStage(stage)}
            onDelete={() => onDeleteStage(stage)}
          />
        </Stack>
      </Stack>

      <Divider />

      {stage.tasks.length === 0 ? (
        <Box sx={{ px: 2.5, py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No tasks in this stage yet.
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableBody>
              {stage.tasks.map((task, index) => (
                <TableRow key={task.id} hover>
                  <TableCell sx={{ width: 96 }}>
                    <Stack direction="row" spacing={0}>
                      <IconButton
                        size="small"
                        disabled={index === 0}
                        onClick={() => onMoveTask(stage, task.id, -1)}
                        aria-label={`Move ${task.title} earlier`}
                      >
                        <ArrowUpwardIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        size="small"
                        disabled={index === stage.tasks.length - 1}
                        onClick={() => onMoveTask(stage, task.id, 1)}
                        aria-label={`Move ${task.title} later`}
                      >
                        <ArrowDownwardIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{task.title}</Typography>
                    {task.mandatory ? null : (
                      <Typography variant="caption" color="text.secondary">
                        Optional
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ width: 130 }}>
                    <Chip size="small" label={task.ownerRole} variant="outlined" />
                  </TableCell>

                  <TableCell sx={{ width: 160 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDueIn(task.dueWithinDays)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right" sx={{ width: 110 }}>
                    <RowActions
                      label={task.title}
                      onEdit={() => onEditTask(stage, task)}
                      onDelete={() => onDeleteTask(stage, task)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Divider />

      <Box sx={{ p: 1.5 }}>
        <Button
          size="small"
          startIcon={<AddOutlinedIcon />}
          onClick={() => onAddTask(stage)}
        >
          Add task
        </Button>
      </Box>
    </Card>
  )
})
