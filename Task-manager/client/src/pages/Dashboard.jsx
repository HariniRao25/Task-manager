import React, { useEffect, useState } from 'react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../context/ToastContext'

const StatCard = ({ label, value, accent }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className={`mb-3 h-1.5 rounded-full ${accent}`} />
    <div className="text-sm text-slate-500">{label}</div>
    <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
  </div>
)

export default function Dashboard() {
  const toast = useToast()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/stats/summary')
        setSummary(response.data)
      } catch (err) {
        if (err.response?.status === 401) return
        toast.error(err.response?.data?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  if (loading) return <LoadingSpinner label="Loading dashboard" />

  const taskTotal = (summary?.completedTasks || 0) + (summary?.pendingTasks || 0)
  const completionRate = taskTotal ? Math.round(((summary?.completedTasks || 0) / taskTotal) * 100) : 0
  const pendingRate = taskTotal ? Math.round(((summary?.pendingTasks || 0) / taskTotal) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white shadow-sm">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">Team dashboard</h1>
          <p className="mt-2 text-sm text-slate-200">Track projects, task progress, overdue work, and recent activity from one place.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total projects" value={summary?.projects || 0} accent="bg-blue-500" />
        <StatCard label="Completed tasks" value={summary?.completedTasks || 0} accent="bg-emerald-500" />
        <StatCard label="Pending tasks" value={summary?.pendingTasks || 0} accent="bg-amber-500" />
        <StatCard label="Overdue tasks" value={summary?.overdueTasks || 0} accent="bg-rose-500" />
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Task progress</h2>
          <p className="text-sm text-slate-500">A simple chart-like view for completion trends.</p>
          <div className="mt-5 space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                <span>Completed</span>
                <span>{completionRate}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                <span>Pending</span>
                <span>{pendingRate}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-amber-500 transition-all" style={{ width: `${pendingRate}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
          <p className="text-sm text-slate-500">Latest tasks and project updates.</p>
          <div className="mt-5 space-y-3">
            {(summary?.recentTasks || []).map((task) => (
              <div key={task._id} className="rounded-xl border border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-900">{task.title}</div>
                    <div className="text-xs text-slate-500">{task.project?.title || 'No project'} · {task.assignedTo?.name || 'Unassigned'}</div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{task.status}</span>
                </div>
              </div>
            ))}

            {(summary?.recentProjects || []).map((project) => (
              <div key={project._id} className="rounded-xl border border-slate-200 px-4 py-3">
                <div className="font-medium text-slate-900">{project.title}</div>
                <div className="text-xs text-slate-500">{project.members?.length || 0} members</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
