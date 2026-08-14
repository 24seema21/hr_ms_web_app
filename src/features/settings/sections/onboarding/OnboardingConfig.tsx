import { useCallback, useState } from 'react'
import { Button, Stack } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { SectionHeader } from '../../components/SectionHeader'
import { SettingsEmptyState } from '../../components/SettingsEmptyState'
import { useFeedback } from '../../hooks/useFeedback'
import { createMockId, useMockCollection } from '../../hooks/useMockCollection'
import { moveById } from '../../lib/reorder'
import { ONBOARDING_STAGES } from '../../mock/onboardingMock'
import { toOnboardingTask } from '../../schemas/onboardingSchema'
import type {
  StageFormValues,
  TaskFormValues,
} from '../../schemas/onboardingSchema'
import type { OnboardingStage, OnboardingTask } from '../../types'
import { StageCard } from './StageCard'
import { StageFormDialog } from './StageFormDialog'
import { TaskFormDialog } from './TaskFormDialog'

/** Which stage a task dialog belongs to, and whether it is editing or adding. */
interface TaskTarget {
  stage: OnboardingStage
  task: OnboardingTask | null
}

export function OnboardingConfig() {
  const { items, create, update, remove, move } =
    useMockCollection(ONBOARDING_STAGES)
  const { notify } = useFeedback()

  const [stageForm, setStageForm] = useState<OnboardingStage | 'new' | null>(
    null,
  )
  const [taskForm, setTaskForm] = useState<TaskTarget | null>(null)
  const [pendingStageDelete, setPendingStageDelete] =
    useState<OnboardingStage | null>(null)
  const [pendingTaskDelete, setPendingTaskDelete] = useState<TaskTarget | null>(
    null,
  )

  /* ── Stages ───────────────────────────────────────────────────────────── */

  const handleStageSave = useCallback(
    (values: StageFormValues) => {
      const isEditing = stageForm !== null && stageForm !== 'new'

      if (isEditing) {
        update({ ...stageForm, ...values })
        notify(`${values.name} updated`)
      } else {
        create({ id: createMockId('stage'), ...values, tasks: [] })
        notify(`${values.name} added`)
      }

      setStageForm(null)
    },
    [stageForm, create, update, notify],
  )

  const confirmStageDelete = useCallback(() => {
    if (!pendingStageDelete) return

    remove(pendingStageDelete.id)
    notify(`${pendingStageDelete.name} deleted`)
    setPendingStageDelete(null)
  }, [pendingStageDelete, remove, notify])

  /* ── Tasks ────────────────────────────────────────────────────────────── */

  /*
    Tasks are nested inside their stage, so every task mutation is expressed as
    an update of the whole stage. Keeping the tasks on the stage rather than in
    a second flat collection is what makes reordering within a stage — and
    deleting a stage with its tasks — a single operation.
  */
  const handleTaskSave = useCallback(
    (values: TaskFormValues) => {
      if (!taskForm) return

      const { stage, task } = taskForm
      const isEditing = task !== null
      const record = toOnboardingTask(
        isEditing ? task.id : createMockId('task'),
        values,
      )

      update({
        ...stage,
        tasks: isEditing
          ? stage.tasks.map((existing) =>
              existing.id === record.id ? record : existing,
            )
          : [...stage.tasks, record],
      })

      notify(isEditing ? `${record.title} updated` : `${record.title} added`)
      setTaskForm(null)
    },
    [taskForm, update, notify],
  )

  const confirmTaskDelete = useCallback(() => {
    if (!pendingTaskDelete?.task) return

    const { stage, task } = pendingTaskDelete

    update({
      ...stage,
      tasks: stage.tasks.filter((existing) => existing.id !== task.id),
    })

    notify(`${task.title} deleted`)
    setPendingTaskDelete(null)
  }, [pendingTaskDelete, update, notify])

  const handleTaskMove = useCallback(
    (stage: OnboardingStage, taskId: string, delta: number) => {
      update({ ...stage, tasks: moveById(stage.tasks, taskId, delta) })
    },
    [update],
  )

  /*
    Stable identities for everything handed to the memoised StageCard. Each one
    receives the stage it acts on as an argument, so none of them has to close
    over a particular row.
  */
  const handleAddTask = useCallback(
    (stage: OnboardingStage) => setTaskForm({ stage, task: null }),
    [],
  )

  const handleEditTask = useCallback(
    (stage: OnboardingStage, task: OnboardingTask) =>
      setTaskForm({ stage, task }),
    [],
  )

  const handleDeleteTask = useCallback(
    (stage: OnboardingStage, task: OnboardingTask) =>
      setPendingTaskDelete({ stage, task }),
    [],
  )

  const handleEditStage = useCallback(
    (stage: OnboardingStage) => setStageForm(stage),
    [],
  )

  const handleDeleteStage = useCallback(
    (stage: OnboardingStage) => setPendingStageDelete(stage),
    [],
  )

  const addStageButton = (
    <Button
      variant="contained"
      startIcon={<AddOutlinedIcon />}
      onClick={() => setStageForm('new')}
    >
      Add stage
    </Button>
  )

  return (
    <>
      <SectionHeader
        title="Onboarding Management"
        description="The checklist every new joiner is taken through, in order. Each task has an owner and a deadline measured from the joining date."
        action={items.length > 0 ? addStageButton : undefined}
      />

      {items.length === 0 ? (
        <SettingsEmptyState
          title="No onboarding stages yet"
          description="Build the workflow new employees are taken through — documentation, IT setup, orientation — and the tasks within each stage."
          action={addStageButton}
        />
      ) : (
        <Stack spacing={2.5}>
          {items.map((stage, index) => (
            <StageCard
              key={stage.id}
              stage={stage}
              position={index + 1}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              onMoveStage={move}
              onEditStage={handleEditStage}
              onDeleteStage={handleDeleteStage}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onMoveTask={handleTaskMove}
            />
          ))}
        </Stack>
      )}

      {stageForm !== null && (
        <StageFormDialog
          stage={stageForm === 'new' ? null : stageForm}
          onClose={() => setStageForm(null)}
          onSave={handleStageSave}
        />
      )}

      {taskForm !== null && (
        <TaskFormDialog
          task={taskForm.task}
          stageName={taskForm.stage.name}
          onClose={() => setTaskForm(null)}
          onSave={handleTaskSave}
        />
      )}

      <ConfirmDialog
        open={pendingStageDelete !== null}
        title="Delete stage?"
        description={`${pendingStageDelete?.name ?? 'This stage'} and its ${pendingStageDelete?.tasks.length ?? 0} task(s) will be removed from the onboarding workflow.`}
        onConfirm={confirmStageDelete}
        onCancel={() => setPendingStageDelete(null)}
      />

      <ConfirmDialog
        open={pendingTaskDelete !== null}
        title="Delete task?"
        description={`${pendingTaskDelete?.task?.title ?? 'This task'} will be removed from ${pendingTaskDelete?.stage.name ?? 'the stage'}.`}
        onConfirm={confirmTaskDelete}
        onCancel={() => setPendingTaskDelete(null)}
      />
    </>
  )
}
