import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type CSSProperties, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import type { z } from 'zod'
import { ProjectSchema, type Project } from '../../shared/lib/demo-db'
import { createProject, projectKeys, projectListQuery } from './api'

const NewProjectSchema = ProjectSchema.omit({ id: true })

export function ProjectsPage() {
  const [params, setParams] = useSearchParams()
  const search = params.get('q') ?? ''
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')
  const queryClient = useQueryClient()
  const { data: projects = [], isPending, error } = useQuery(projectListQuery(search))
  const create = useMutation<Project, Error, z.infer<typeof NewProjectSchema>>({
    mutationFn: (input) => Promise.resolve(createProject(input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.all })
      setName('')
      setDescription('')
      setShowForm(false)
    },
  })

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = NewProjectSchema.safeParse({
      name: name.trim(),
      description: description.trim(),
      color: '#b8a1ff',
    })
    if (!parsed.success) {
      setFormError('Add a project name to continue.')
      return
    }
    setFormError('')
    create.mutate(parsed.data)
  }

  return (
    <div className="page-content">
      <header className="page-heading">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>Projects</h1>
          <p className="muted">A little structure for your big ideas.</p>
        </div>
        <button className="button button-primary" onClick={() => setShowForm((open) => !open)}>
          <span aria-hidden="true">＋</span> New project
        </button>
      </header>

      {showForm && (
        <form className="project-form panel" onSubmit={submitProject}>
          <div className="form-heading">
            <div>
              <h2>Start something new</h2>
              <p className="muted">Give this project a name and a little context.</p>
            </div>
            <button
              aria-label="Close project form"
              className="icon-button"
              onClick={() => setShowForm(false)}
              type="button"
            >
              ×
            </button>
          </div>
          <label htmlFor="project-name">Project name</label>
          <input
            id="project-name"
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Spring launch"
            value={name}
          />
          <label htmlFor="project-description">What’s this project about?</label>
          <textarea
            id="project-description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="A short description (optional)"
            rows={2}
            value={description}
          />
          {formError && <p className="form-error" role="alert">{formError}</p>}
          {create.error && <p className="form-error" role="alert">{create.error.message}</p>}
          <div className="form-actions">
            <button className="button button-quiet" onClick={() => setShowForm(false)} type="button">
              Cancel
            </button>
            <button className="button button-primary" disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      )}

      <div className="toolbar">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <span className="visually-hidden">Search projects</span>
          <input
            onChange={(event) => {
              const next = new URLSearchParams(params)
              if (event.target.value) next.set('q', event.target.value)
              else next.delete('q')
              setParams(next, { replace: true })
            }}
            placeholder="Find a project"
            type="search"
            value={search}
          />
          <kbd>⌘ K</kbd>
        </label>
        <span className="result-count">{projects.length} projects</span>
      </div>

      {isPending && <div className="screen-state">Loading projects…</div>}
      {error && <div className="inline-error" role="alert">{error.message}</div>}
      {!isPending && !error && projects.length === 0 && (
        <div className="empty-state panel">
          <span className="empty-icon">✳</span>
          <h2>{search ? 'Nothing found' : 'Your next big thing starts here'}</h2>
          <p className="muted">
            {search ? 'Try another search, or clear the filter.' : 'Create a project to give your team a place to work.'}
          </p>
          {!search && (
            <button className="button button-primary" onClick={() => setShowForm(true)}>
              Create your first project
            </button>
          )}
        </div>
      )}
      <div className="project-grid">
        {projects.map((project, index) => (
          <Link
            className="project-card panel"
            key={project.id}
            style={{ '--project-color': project.color } as CSSProperties}
            to={`/projects/${project.id}`}
          >
            <div className="project-card-top">
              <span className="project-symbol" aria-hidden="true">{index % 2 ? '◈' : '✳'}</span>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </div>
            <h2>{project.name}</h2>
            <p className="muted">{project.description || 'No description yet.'}</p>
            <div className="project-card-footer">
              <span className="avatar-stack" aria-label="Two teammates">
                <span className="avatar avatar-lavender">A</span>
                <span className="avatar avatar-mint">S</span>
              </span>
              <span className="open-board">Open board <span aria-hidden="true">→</span></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
