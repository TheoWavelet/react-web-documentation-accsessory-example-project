import { beforeEach, describe, expect, it } from 'vitest'
import { readDatabase, updateDatabase } from './demo-db'

describe('demo database', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with projects and tasks and persists them', () => {
    const database = readDatabase()

    expect(database.projects).toHaveLength(2)
    expect(database.tasks.length).toBeGreaterThan(0)
    expect(JSON.parse(localStorage.getItem('taskflow-demo-data') ?? '{}')).toEqual(database)
  })

  it('rejects malformed saved data instead of hiding corruption', () => {
    localStorage.setItem('taskflow-demo-data', '{invalid')

    expect(() => readDatabase()).toThrow('TaskFlow demo data is invalid')
  })

  it('persists database updates', () => {
    updateDatabase((database) => ({
      ...database,
      projects: [
        ...database.projects,
        {
          id: 'test',
          name: 'Test',
          description: '',
          color: '#ffffff',
        },
      ],
    }))

    expect(readDatabase().projects.at(-1)?.name).toBe('Test')
  })
})
