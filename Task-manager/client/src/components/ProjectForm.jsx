import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProjectForm({ initial, onSuccess, onCancel }) {
  const { user } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)

  const defaultValues = useMemo(
    () => ({
      title: initial?.title || '',
      description: initial?.description || '',
      members: (initial?.members || []).map((member) => String(member._id || member)),
    }),
    [initial]
  )

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    const loadUsers = async () => {
      try {
        if (user?.role !== 'Admin') {
          setUsers([])
          setLoadingUsers(false)
          return
        }
        const response = await api.get('/users')
        setUsers(response.data)
      } catch (err) {
        if (err.response?.status === 401) return
        toast.error(err.response?.data?.message || 'Unable to load team members')
      } finally {
        setLoadingUsers(false)
      }
    }
    loadUsers()
  }, [toast, user])

  const visibleUsers = users.filter((member) => {
    const term = query.trim().toLowerCase()
    if (!term) return true
    return member.name.toLowerCase().includes(term) || member.email.toLowerCase().includes(term)
  })

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title.trim(),
        description: (data.description || '').trim(),
        members: Array.isArray(data.members) ? data.members : data.members ? [data.members] : [],
      }

      const response = initial?._id
        ? await api.put(`/projects/${initial._id}`, payload)
        : await api.post('/projects', payload)

      toast.success(initial?._id ? 'Project updated' : 'Project created')
      onSuccess?.(response.data)
      if (!initial?._id) {
        reset({ title: '', description: '', members: [] })
      }
    } catch (err) {
      if (err.response?.status === 401) return
      toast.error(err.response?.data?.message || 'Failed to save project')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">Project title</label>
        <input {...register('title', { required: 'Project title is required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 transition focus:border-blue-500" placeholder="Website redesign" />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea {...register('description')} rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500" placeholder="Describe the project goals, scope, and deadline." />
      </div>

      {user?.role === 'Admin' && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-slate-700">Team members</label>
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-48 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-blue-500" placeholder="Search members" />
          </div>

          {loadingUsers ? (
            <LoadingSpinner label="Loading members" />
          ) : (
            <div className="max-h-56 overflow-auto rounded-xl border border-slate-200 p-3">
              <div className="mb-3 text-xs text-slate-500">Select members for this project. Values are stored as user ids.</div>
              <div className="space-y-2">
                {visibleUsers.length === 0 ? (
                  <div className="text-sm text-slate-500">No members found.</div>
                ) : visibleUsers.map((member) => (
                  <label key={member._id} className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-2 transition hover:bg-slate-50">
                    <span>
                      <span className="block text-sm font-medium text-slate-800">{member.name}</span>
                      <span className="block text-xs text-slate-500">{member.email} · {member.role}</span>
                    </span>
                    <input type="checkbox" value={member._id} {...register('members')} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? 'Saving...' : initial?._id ? 'Update Project' : 'Create Project'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
