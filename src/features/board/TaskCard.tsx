import { Link, useLocation } from 'react-router'
import type { DragEvent } from 'react'
import type { Status, Task } from './api'

const assignees: Record<string, { name: string; initial: string }> = {
  alex: { name: 'Alex Morgan', initial: 'A' },
  sam: { name: 'Sam Rivera', initial: 'S' },
}

type TaskCardProps = {
  projectId: string
  task: Task
  onMove: (taskId: string, status: Status, position: number) => void
  onDragStart: (taskId: string) => void
}

export function TaskCard({ projectId, task, onMove, onDragStart }: TaskCardProps) {
  const location = useLocation()
  const assignee = task.assigneeId ? assignees[task.assigneeId] : undefined

  return (
    <article
      className="task-card"
      draggable
      onDragStart={(event: DragEvent<HTMLElement>) => {
        event.dataTransfer.setData('text/taskflow-task', task.id)
        onDragStart(task.id)
      }}
    >
      <div className="task-card-top">
        <span className="task-tag">{task.status === 'doing' ? 'IN PROGRESS' : 'TASK'}</span>
        <button aria-label={`More options for ${task.title}`} className="icon-button" type="button">
          ···
        </button>
      </div>
      <Link
        className="task-title"
        state={{ backgroundLocation: location }}
        to={`/projects/${projectId}/tasks/${task.id}${location.search}`}
      >
        {task.title}
      </Link>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-card-bottom">
        {assignee ? (
          <span className={`avatar avatar-${assignee.initial.toLowerCase()}`} title={assignee.name}>
            {assignee.initial}
          </span>
        ) : (
          <span className="unassigned-avatar" title="Unassigned">＋</span>
        )}
        <label className="move-select">
          <span className="visually-hidden">Move {task.title} to</span>
          <select
            aria-label={`Move ${task.title} to`}
            onChange={(event) =>
              onMove(task.id, event.target.value as Status, task.position)
            }
            value={task.status}
          >
            <option value="todo">To do</option>
            <option value="doing">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>
    </article>
  )
}
