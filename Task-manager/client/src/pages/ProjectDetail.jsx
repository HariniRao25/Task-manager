import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import ProjectForm from '../components/ProjectForm'
import TaskForm from '../components/TaskForm'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

export default function ProjectDetail() {
  const { id } = useParams()
  const toast = useToast()
  const { user } = useAuth()
  const [projectData, setProjectData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEditProject, setShowEditProject] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [priority, setPriority] = useState('All')
  const [assignee, setAssignee] = useState('All')

  const loadProject = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/projects/${id}`)
      setProjectData(response.data)
    } catch (err) {
        if (err.response?.status !== 401) toast.error(err.response?.data?.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProject()
  }, [id])

  const project = projectData?.project
  const tasks = projectData?.tasks || []

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase()
    return tasks.filter((task) => {
      const matchesSearch = !term || task.title.toLowerCase().includes(term) || (task.description || '').toLowerCase().includes(term)
      const matchesStatus = status === 'All' || task.status === status
      const matchesPriority = priority === 'All' || task.priority === priority
      const matchesAssignee = assignee === 'All' || (assignee === 'Unassigned' ? !task.assignedTo : task.assignedTo?._id === assignee)
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
    })
  }, [tasks, search, status, priority, assignee])

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm('Delete this task?')
    if (!confirmDelete) return
    try {
      await api.delete(`/tasks/${taskId}`)
      toast.success('Task deleted')
      await loadProject()
    } catch (err) {
        if (err.response?.status !== 401) toast.error(err.response?.data?.message || 'Failed to delete task')
    }
  }

  const closeForms = () => {
    setShowEditProject(false)
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const openTaskCreate = () => {
    setEditingTask(null)
    setShowTaskForm(true)
    setShowEditProject(false)
  }

  if (loading) return <LoadingSpinner label="Loading project" />
  if (!project) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">Project not found.</div>

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{project.title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">{project.description || 'No description provided.'}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-1">Members: {project.members?.length || 0}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">Tasks: {tasks.length}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {user?.role === 'Admin' && (
              <>
                <button onClick={() => { setShowEditProject((current) => !current); setShowTaskForm(false); setEditingTask(null) }} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50">
                  {showEditProject ? 'Close project form' : 'Edit project'}
                </button>
                <button onClick={openTaskCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                  New task
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showEditProject && user?.role === 'Admin' && (
        <ProjectForm
          initial={project}
          onSuccess={() => {
            toast.success('Project updated')
            closeForms()
            loadProject()
          }}
          onCancel={closeForms}
        />
      )}

      {showTaskForm && (
        <TaskForm
          initial={editingTask}
          projectId={project._id}
          projectMembers={project.members || []}
          onSuccess={() => {
            closeForms()
            loadProject()
          }}
          onCancel={closeForms}
        />
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 grid gap-3 lg:grid-cols-4">
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500" placeholder="Search tasks" />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500">
            <option value="All">All statuses</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <select value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500">
            <option value="All">All priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select value={assignee} onChange={(event) => setAssignee(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500">
            <option value="All">All assignees</option>
            <option value="Unassigned">Unassigned</option>
            {project.members?.map((member) => (
              <option key={member._id} value={member._id}>{member.name}</option>
            ))}
          </select>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">No tasks match the current filters.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredTasks.map((task) => (
              <article key={task._id} className="rounded-xl border border-slate-200 p-4 transition hover:shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{task.description || 'No task description.'}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{task.status}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
                  <div><span className="block text-xs uppercase text-slate-400">Priority</span>{task.priority}</div>
                  <div><span className="block text-xs uppercase text-slate-400">Assignee</span>{task.assignedTo?.name || 'Unassigned'}</div>
                  <div><span className="block text-xs uppercase text-slate-400">Deadline</span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'None'}</div>
                  <div><span className="block text-xs uppercase text-slate-400">Updated</span>{new Date(task.updatedAt).toLocaleDateString()}</div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(user?.role === 'Admin' || task.assignedTo?._id === user?._id) && (
                    <button onClick={() => { setEditingTask(task); setShowTaskForm(true); setShowEditProject(false) }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                      Edit
                    </button>
                  )}
                  {user?.role === 'Admin' && (
                    <button onClick={() => handleDeleteTask(task._id)} className="rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-50">
                      Delete
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
