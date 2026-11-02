import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { sessionQuery, sessionQueryKey, signOut } from '../features/auth/api'
import { usePreferences } from '../features/prefs/store'
import { projectListQuery } from '../features/projects/api'

export function AppShell() {
  const { data: session } = useQuery(sessionQuery)
  const { data: projects = [] } = useQuery(projectListQuery())
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const theme = usePreferences((state) => state.theme)
  const toggleTheme = usePreferences((state) => state.toggleTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function handleSignOut() {
    signOut()
    queryClient.setQueryData(sessionQueryKey, null)
    void navigate('/login', { replace: true })
  }

  const displayName = session?.email.split('@')[0] ?? 'Teammate'
  const initial = displayName[0]?.toUpperCase() ?? 'T'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink aria-label="TaskFlow home" className="brand" to="/projects">
          <span className="brand-mark">T</span>
          <span>taskflow</span>
        </NavLink>
        <div className="workspace-switcher">
          <span className="workspace-icon">S</span>
          <span className="workspace-name">Studio North<small>Free workspace</small></span>
          <span className="switcher-chevron" aria-hidden="true">⌄</span>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/projects">
            <span className="nav-icon">▦</span> Projects
            <span className="nav-count">{projects.length}</span>
          </NavLink>
          <span className="nav-link nav-link-muted"><span className="nav-icon">▤</span> My tasks</span>
          <span className="nav-link nav-link-muted"><span className="nav-icon">◷</span> Activity</span>
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-banner">
            <span className="demo-dot" />
            <div><strong>Demo mode</strong><small>Changes stay in this browser</small></div>
          </div>
          <button className="nav-link theme-toggle" onClick={toggleTheme}>
            <span className="nav-icon">{theme === 'light' ? '☾' : '☀'}</span>
            {theme === 'light' ? 'Dark appearance' : 'Light appearance'}
          </button>
          <div className="profile">
            <span className="avatar avatar-lavender">{initial}</span>
            <span className="profile-name">{displayName}<small>{session?.email}</small></span>
            <button aria-label="Sign out" className="icon-button" onClick={handleSignOut} title="Sign out">
              ↗
            </button>
          </div>
        </div>
      </aside>
      <main className="app-main">
        <header className="topbar">
          <div className="topbar-breadcrumb"><span>Studio North</span><span>/</span><strong>Workspace</strong></div>
          <div className="topbar-actions">
            <span className="online-indicator"><i /> All changes saved</span>
            <button aria-label="Notifications" className="icon-button notification-button">♧<span /></button>
            <span className="avatar avatar-mint">{initial}</span>
          </div>
        </header>
        <Outlet />
        <footer className="app-footer">
          <span>Made for thoughtful work <span aria-hidden="true">✳</span></span>
          <span>TaskFlow preview · 2026</span>
        </footer>
      </main>
    </div>
  )
}
