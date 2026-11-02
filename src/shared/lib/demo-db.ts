import { z } from 'zod'

export const StatusSchema = z.enum(['todo', 'doing', 'done'])
export type Status = z.infer<typeof StatusSchema>

export const TaskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string(),
  status: StatusSchema,
  position: z.number(),
  assigneeId: z.enum(['alex', 'sam']).nullable(),
})
export type Task = z.infer<typeof TaskSchema>

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  color: z.string(),
})
export type Project = z.infer<typeof ProjectSchema>

const DatabaseSchema = z.object({
  projects: z.array(ProjectSchema),
  tasks: z.array(TaskSchema),
})
type Database = z.infer<typeof DatabaseSchema>

export const DATABASE_KEY = 'taskflow-demo-data'

const initialDatabase: Database = {
  projects: [
    {
      id: 'website',
      name: 'Website redesign',
      description: 'Refresh the marketing site and improve conversion.',
      color: '#b8a1ff',
    },
    {
      id: 'mobile',
      name: 'Mobile app',
      description: 'Ship a faster, more focused mobile experience.',
      color: '#79d9bd',
    },
  ],
  tasks: [
    {
      id: 'task-1',
      projectId: 'website',
      title: 'Audit the current landing page',
      description: 'Capture the biggest friction points in the signup flow.',
      status: 'todo',
      position: 1,
      assigneeId: 'alex',
    },
    {
      id: 'task-2',
      projectId: 'website',
      title: 'Explore a new visual direction',
      description: 'Collect references and put together a moodboard.',
      status: 'doing',
      position: 1,
      assigneeId: 'sam',
    },
    {
      id: 'task-3',
      projectId: 'website',
      title: 'Set up the component library',
      description: 'Build the shared foundations for the new site.',
      status: 'done',
      position: 1,
      assigneeId: 'alex',
    },
    {
      id: 'task-4',
      projectId: 'mobile',
      title: 'Map the onboarding journey',
      description: 'Document the first-run experience from install to value.',
      status: 'todo',
      position: 1,
      assigneeId: 'sam',
    },
    {
      id: 'task-5',
      projectId: 'mobile',
      title: 'Review navigation patterns',
      description: 'Compare the current tabs with the new information model.',
      status: 'doing',
      position: 1,
      assigneeId: null,
    },
  ],
}

function saveDatabase(database: Database) {
  localStorage.setItem(DATABASE_KEY, JSON.stringify(database))
}

export function readDatabase(): Database {
  const saved = localStorage.getItem(DATABASE_KEY)
  if (saved === null) {
    saveDatabase(initialDatabase)
    return initialDatabase
  }

  let value: unknown
  try {
    value = JSON.parse(saved)
  } catch (error) {
    throw new Error('TaskFlow demo data is invalid. Clear the saved demo data to continue.', {
      cause: error,
    })
  }
  const parsed = DatabaseSchema.safeParse(value)
  if (!parsed.success) {
    throw new Error('TaskFlow demo data has an unexpected shape. Clear the saved demo data to continue.', {
      cause: parsed.error,
    })
  }
  return parsed.data
}

export function updateDatabase(
  update: (database: Database) => Database,
): Database {
  const next = update(readDatabase())
  saveDatabase(next)
  return next
}

export function createId() {
  return crypto.randomUUID()
}
