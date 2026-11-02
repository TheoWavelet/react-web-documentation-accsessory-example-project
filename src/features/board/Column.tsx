import type { DragEvent } from 'react'
import type { Status, Task } from './api'
import { TaskCard } from './TaskCard'

const labels: Record<Status, string> = {
  todo: 'To do',
  doing: 'In progress',
  done: 'Done',
}

type ColumnProps = {
  projectId: string
  status: Status
  tasks: Task[]
  onMove: (taskId: string, status: Status, position: number) => void
  onDropTask: (taskId: string, status: Status, index: number) => void
  onDragStart: (taskId: string) => void
}

export function Column({
  projectId,
  status,
  tasks,
  onMove,
  onDropTask,
  onDragStart,
}: ColumnProps) {
  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/taskflow-task')
    if (taskId) onDropTask(taskId, status, tasks.length)
  }

  return (
    <section
      aria-label={`${labels[status]} tasks`}
      className={`board-column column-${status}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <header className="column-heading">
        <div className="column-title">
          <span className={`status-dot dot-${status}`} />
          <h2>{labels[status]}</h2>
          <span className="column-count">{tasks.length}</span>
        </div>
        <button
          aria-label={`Add task to ${labels[status]}`}
          className="icon-button"
          onClick={() => window.dispatchEvent(new CustomEvent('taskflow:new-task'))}
          type="button"
        >
          +
        </button>
      </header>
      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            onDragStart={onDragStart}
            onMove={onMove}
            projectId={projectId}
            task={task}
          />
        ))}
        {tasks.length === 0 && <p className="column-empty">Drop a task here</p>}
      </div>
    </section>
  )
}
