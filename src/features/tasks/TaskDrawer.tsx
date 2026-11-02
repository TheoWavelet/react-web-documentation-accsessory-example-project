import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { boardQuery, boardKeys } from '../board/api'
import { updateTask } from './api'

const TaskFormSchema = z.object({
  title: z.string().trim().min(1, 'Give this task a title.'),
  description: z.string().trim(),
  assigneeId: z.enum(['alex', 'sam']).nullable(),
})
type TaskFormValues = z.infer<typeof TaskFormSchema>

export function TaskDrawer() {
  const { projectId = '', taskId = '' } = useParams()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { data: tasks = [], isPending, error } = useQuery(boardQuery(projectId))
  const task = tasks.find((item) => item.id === taskId)
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      assigneeId: task?.assigneeId ?? null,
    },
  })
  const save = useMutation({
    mutationFn: (values: TaskFormValues) => Promise.resolve(updateTask(taskId, values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: boardKeys.board(projectId) })
      close()
    },
  })

  const close = useCallback(() => {
    void navigate({ pathname: `/projects/${projectId}`, search: location.search })
  }, [location.search, navigate, projectId])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [close])

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [error, isPending, task])

  useEffect(() => {
    if (!task) return
    form.reset({
      title: task.title,
      description: task.description,
      assigneeId: task.assigneeId,
    })
  }, [form, task])

  if (isPending) return <div className="screen-state">Loading task…</div>
  if (error || !task) {
    return (
      <dialog
        aria-labelledby="task-error-title"
        className="modal-backdrop"
        onCancel={(event) => {
          event.preventDefault()
          close()
        }}
        ref={dialogRef}
      >
        <button aria-label="Close task dialog" className="dialog-scrim" onClick={close} type="button" />
        <section className="modal-card">
          <h2 id="task-error-title">Task not found</h2>
          <p className="muted">{error?.message ?? 'This task may have been removed from the board.'}</p>
          <Link className="button button-primary" to={`/projects/${projectId}${location.search}`}>
            Back to board
          </Link>
        </section>
      </dialog>
    )
  }

  return (
    <dialog
      aria-labelledby="task-drawer-title"
      className="modal-backdrop"
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      ref={dialogRef}
    >
      <button aria-label="Close task details" className="dialog-scrim" onClick={close} type="button" />
      <section className="task-drawer">
        <div className="drawer-heading">
          <div>
            <p className="eyebrow">TASK DETAILS</p>
            <h2 id="task-drawer-title">Make it happen</h2>
          </div>
          <button aria-label="Close task details" className="icon-button" onClick={close} type="button">×</button>
        </div>
        <form className="task-form" onSubmit={form.handleSubmit((values) => save.mutate(values))}>
          <label htmlFor="edit-task-title">Task name</label>
          <input id="edit-task-title" {...form.register('title')} />
          {form.formState.errors.title && (
            <p className="form-error">{form.formState.errors.title.message}</p>
          )}
          <label htmlFor="edit-task-description">Description</label>
          <textarea id="edit-task-description" rows={5} {...form.register('description')} />
          <label htmlFor="edit-task-assignee">Assignee</label>
          <select
            id="edit-task-assignee"
            {...form.register('assigneeId', {
              setValueAs: (value: string) => value === '' ? null : value,
            })}
          >
            <option value="">Unassigned</option>
            <option value="alex">Alex Morgan</option>
            <option value="sam">Sam Rivera</option>
          </select>
          {save.error && <p className="form-error" role="alert">{save.error.message}</p>}
          <div className="drawer-meta">
            <span className={`status-pill pill-${task.status}`}>{task.status.replace('doing', 'in progress')}</span>
            <span className="muted">Saved in this browser</span>
          </div>
          <div className="form-actions">
            <button className="button button-quiet" onClick={close} type="button">Cancel</button>
            <button className="button button-primary" disabled={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </dialog>
  )
}
