import { useQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useRef } from 'react'
import { Link, Outlet, useParams, useSearchParams } from 'react-router'
import { z } from 'zod'
import { projectDetailQuery } from '../projects/api'
import { createTask } from '../tasks/api'
import { boardKeys, boardQuery, type Status } from './api'
import { Column } from './Column'
import { useBoardEvents } from './useBoardEvents'
import { useMoveTask } from './useMoveTask'

const COLUMNS: Status[] = ['todo', 'doing', 'done']

export function BoardPage() {
  const { projectId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const [showNewTask, setShowNewTask] = useState(false)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const {
    data: project,
    isPending: projectPending,
    error: projectError,
  } = useQuery(projectDetailQuery(projectId))
  const { data: tasks = [], isPending, error } = useQuery(boardQuery(projectId))
  const move = useMoveTask(projectId)
  const assignee = params.get('assignee') ?? 'all'
  useBoardEvents(projectId)

  useEffect(() => {
    const openForm = () => setShowNewTask(true)
    window.addEventListener('taskflow:new-task', openForm)
    return () => window.removeEventListener('taskflow:new-task', openForm)
  }, [])

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (assignee === 'all') return true
        if (assignee === 'unassigned') return task.assigneeId === null
        return task.assigneeId === assignee
      }),
    [assignee, tasks],
  )

  function onMove(taskId: string, status: Status, position: number) {
    move.mutate({ id: taskId, status, position })
  }

  function onDropTask(taskId: string, status: Status, index: number) {
    const targetTasks = visibleTasks
      .filter((task) => task.status === status && task.id !== taskId)
      .toSorted((a, b) => a.position - b.position)
    const before = targetTasks[index - 1]?.position ?? 0
    const after = targetTasks[index]?.position ?? before + 2
    onMove(taskId, status, (before + after) / 2)
    setDraggedTask(null)
  }

  if (projectPending || isPending) {
    return <div className="screen-state">Loading your board…</div>
  }
  if (projectError || error) {
    return (
      <div className="screen-state" role="alert">
        <h1>We couldn’t load this board.</h1>
        <p>{projectError?.message ?? error?.message}</p>
        <Link className="button button-secondary" to="/projects">Back to projects</Link>
      </div>
    )
  }
  if (!project) {
    return (
      <div className="screen-state">
        <h1>Project not found</h1>
        <Link className="button button-secondary" to="/projects">Back to projects</Link>
      </div>
    )
  }

  return (
    <div className="page-content board-page">
      <div className="breadcrumbs">
        <Link to="/projects">Projects</Link><span>/</span><span>{project.name}</span>
      </div>
      <header className="page-heading board-heading">
        <div>
          <p className="eyebrow">PROJECT BOARD</p>
          <h1>{project.name}</h1>
          <p className="muted">{project.description}</p>
        </div>
        <div className="heading-actions">
          <label className="filter-select">
            <span className="visually-hidden">Filter tasks by assignee</span>
            <select
              onChange={(event) => {
                const next = new URLSearchParams(params)
                if (event.target.value === 'all') next.delete('assignee')
                else next.set('assignee', event.target.value)
                setParams(next, { replace: true })
              }}
              value={assignee}
            >
              <option value="all">Everyone</option>
              <option value="alex">Alex Morgan</option>
              <option value="sam">Sam Rivera</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </label>
          <button className="button button-primary" onClick={() => setShowNewTask(true)}>
            <span aria-hidden="true">＋</span> Add task
          </button>
        </div>
      </header>
      {move.error && <div className="inline-error" role="alert">{move.error.message}</div>}
      {showNewTask && (
        <NewTaskForm
          onClose={() => setShowNewTask(false)}
          onCreated={() => setShowNewTask(false)}
          projectId={projectId}
        />
      )}
      <div className="board-grid">
        {COLUMNS.map((status) => (
          <Column
            key={status}
            onDragStart={setDraggedTask}
            onDropTask={onDropTask}
            onMove={onMove}
            projectId={projectId}
            status={status}
            tasks={visibleTasks
              .filter((task) => task.status === status)
              .toSorted((a, b) => a.position - b.position)}
          />
        ))}
      </div>
      {draggedTask && <span className="visually-hidden" aria-live="polite">Task selected for moving.</span>}
      <Outlet />
    </div>
  )
}

const NewTaskSchema = z.object({
  title: z.string().trim().min(1, 'Enter a task name.'),
  description: z.string().trim(),
})

function NewTaskForm({
  projectId,
  onClose,
  onCreated,
}: {
  projectId: string
  onClose: () => void
  onCreated: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')
  const create = useMutation({
    mutationFn: (input: z.infer<typeof NewTaskSchema>) =>
      Promise.resolve(createTask(projectId, { ...input, assigneeId: null })),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: boardKeys.board(projectId) })
      onCreated()
    },
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = NewTaskSchema.safeParse({ title, description })
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Check the task details.')
      return
    }
    setFormError('')
    create.mutate(parsed.data)
  }

  return (
    <dialog
      aria-labelledby="new-task-title"
      className="modal-backdrop"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      ref={dialogRef}
    >
      <button aria-label="Close task dialog" className="dialog-scrim" onClick={onClose} type="button" />
      <form aria-labelledby="new-task-title" className="modal-card" onSubmit={submit}>
        <div className="form-heading">
          <div>
            <p className="eyebrow">NEW TASK</p>
            <h2 id="new-task-title">Add to your board</h2>
          </div>
          <button aria-label="Close dialog" className="icon-button" onClick={onClose} type="button">×</button>
        </div>
        <label htmlFor="task-title">Task name</label>
        <input id="task-title" onChange={(event) => setTitle(event.target.value)} value={title} />
        <label htmlFor="task-description">Details</label>
        <textarea id="task-description" onChange={(event) => setDescription(event.target.value)} rows={3} value={description} />
        {(formError || create.error) && (
          <p className="form-error" role="alert">{formError || create.error?.message}</p>
        )}
        <div className="form-actions">
          <button className="button button-quiet" onClick={onClose} type="button">Cancel</button>
          <button className="button button-primary" disabled={create.isPending}>
            {create.isPending ? 'Adding…' : 'Add task'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
