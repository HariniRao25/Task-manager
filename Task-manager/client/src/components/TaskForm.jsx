import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const toDateInputValue = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

export default function TaskForm({ initial, projectId, projectMembers = [], onSuccess, onCancel }) {
  const toast = useToast()
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const defaultValues = useMemo(
    () => ({
      title: initial?.title || '',
      description: initial?.description || '',
      assignedTo: initial?.assignedTo?._id || initial?.assignedTo || '',
      priority: initial?.priority || 'Medium',
      status: initial?.status || 'Todo',
      deadline: toDateInputValue(initial?.deadline),
      project: initial?.project?._id || projectId || '',
    }),
    [initial, projectId]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        title: data.title.trim(),
        description: (data.description || '').trim(),
        assignedTo: data.assignedTo || undefined,
        deadline: data.deadline || undefined,
        project: data.project || projectId,
      }

      const response = initial?._id
        ? await api.put(`/tasks/${initial._id}`, payload)
        : await api.post('/tasks', payload)

      toast.success(initial?._id ? 'Task updated' : 'Task created')
      onSuccess?.(response.data)
      if (!initial?._id) {
        reset({ title: '', description: '', assignedTo: '', priority: 'Medium', status: 'Todo', deadline: '', project: projectId || '' })
      }
    } catch (err) {
      if (err.response?.status === 401) return
      toast.error(err.response?.data?.message || 'Failed to save task')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">Task title</label>
        <input {...register('title', { required: 'Task title is required' })} readOnly={!isAdmin && Boolean(initial)} className={`w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 ${!isAdmin && initial ? 'bg-slate-50 text-slate-500' : ''}`} placeholder="Design login page" />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea {...register('description')} rows={3} readOnly={!isAdmin && Boolean(initial)} className={`w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 ${!isAdmin && initial ? 'bg-slate-50 text-slate-500' : ''}`} placeholder="Add task context, acceptance criteria, and notes." />
      </div>

      {isAdmin ? (
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Assignee</label>
            <select {...register('assignedTo')} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500">
              <option value="">Unassigned</option>
              {projectMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
            <select {...register('priority')} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <select {...register('status')} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500">
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Deadline</label>
            <input {...register('deadline')} type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500" />
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <select {...register('status')} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500">
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      )}

      <input type="hidden" {...register('project')} />

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? 'Saving...' : initial?._id ? 'Update Task' : 'Create Task'}
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
