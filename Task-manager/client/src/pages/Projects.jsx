import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ProjectForm from '../components/ProjectForm'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

export default function Projects() {
  const toast = useToast()
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [query, setQuery] = useState('')

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await api.get('/projects')
      setProjects(response.data)
    } catch (err) {
      if (err.response?.status !== 401) toast.error(err.response?.data?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const filteredProjects = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return projects
    return projects.filter((project) => {
      return project.title.toLowerCase().includes(term) || (project.description || '').toLowerCase().includes(term)
    })
  }, [projects, query])

  const assignedProjects = useMemo(() => {
    if (!user?._id) return []
    return filteredProjects.filter((project) => {
      const memberIds = (project.members || []).map((member) => String(member._id || member))
      return memberIds.includes(String(user._id)) || String(project.createdBy) === String(user._id)
    })
  }, [filteredProjects, user?._id])

  const visibleProjects = user?.role === 'Admin' ? filteredProjects : assignedProjects

  const handleDelete = async (projectId) => {
    const confirmDelete = window.confirm('Delete this project and all related tasks?')
    if (!confirmDelete) return
    try {
      await api.delete(`/projects/${projectId}`)
      toast.success('Project deleted')
      await loadProjects()
    } catch (err) {
      if (err.response?.status !== 401) toast.error(err.response?.data?.message || 'Failed to delete project')
    }
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingProject(null)
  }

  const handleSave = async () => {
    closeForm()
    await loadProjects()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">Create projects, assign members, and manage workstreams.</p>
          {user?.role !== 'Admin' && (
            <p className="mt-2 text-sm text-blue-700">
              You will only see projects assigned to you. Open a project to view details and work on your tasks.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500" placeholder="Search projects" />
          {user?.role === 'Admin' && (
            <button onClick={() => { setEditingProject(null); setShowForm((current) => !current) }} className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800">
              {showForm ? 'Close form' : 'New project'}
            </button>
          )}
        </div>
      </div>

      {showForm && user?.role === 'Admin' && (
        <ProjectForm
          initial={editingProject}
          onSuccess={handleSave}
          onCancel={closeForm}
        />
      )}

      {user?.role !== 'Admin' && !loading && visibleProjects.length > 0 && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 shadow-sm">
          <span className="font-semibold">Assigned projects:</span> {visibleProjects.length}. Select <span className="font-semibold">Open project</span> on a card to view tasks.
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading projects" />
      ) : visibleProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          {user?.role === 'Admin'
            ? 'No projects found.'
            : 'No projects are assigned to you yet. Ask an admin to add you to a project.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => (
            <article key={project._id} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{project.title}</h2>
                  <p className="text-sm text-slate-500">{project.description || 'No description provided.'}</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {project.members?.length || 0} members
                </div>
              </div>

              {user?.role !== 'Admin' && (
                <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Assigned to you
                </div>
              )}

              <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-1">Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1">Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link to={`/projects/${project._id}`} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                  Open project
                </Link>
                {user?.role === 'Admin' && (
                  <>
                    <button onClick={() => { setEditingProject(project); setShowForm(true) }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(project._id)} className="rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-50">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
