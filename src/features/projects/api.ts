import { queryOptions } from '@tanstack/react-query'
import type { z } from 'zod'
import {
  createId,
  ProjectSchema,
  readDatabase,
  updateDatabase,
  type Project,
} from '../../shared/lib/demo-db'

export const projectKeys = {
  all: ['projects'] as const,
  list: (search: string) => ['projects', 'list', search] as const,
  detail: (projectId: string) => ['projects', 'detail', projectId] as const,
}

export const projectDetailQuery = (projectId: string) =>
  queryOptions<Project | null, Error>({
    queryKey: projectKeys.detail(projectId),
    queryFn: () =>
      readDatabase().projects.find((project) => project.id === projectId) ?? null,
  })

export const projectListQuery = (search = '') =>
  queryOptions<Project[], Error>({
    queryKey: projectKeys.list(search),
    queryFn: () => {
      const normalized = search.trim().toLowerCase()
      return readDatabase().projects.filter((project) =>
        `${project.name} ${project.description}`.toLowerCase().includes(normalized),
      )
    },
  })

const NewProjectSchema = ProjectSchema.omit({ id: true })

export function createProject(input: z.infer<typeof NewProjectSchema>): Project {
  const project = ProjectSchema.parse({ ...NewProjectSchema.parse(input), id: createId() })
  updateDatabase((database) => ({
    ...database,
    projects: [project, ...database.projects],
  }))
  return project
}
