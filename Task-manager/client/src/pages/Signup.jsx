import React from 'react'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'

export default function Signup() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const navigate = useNavigate()
  const toast = useToast()

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/signup', {
        ...data,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      })
      toast.success('Account created. Please sign in.')
      navigate('/login')
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed'
      toast.error(message.includes('Email already in use') ? 'This email is already registered. Please sign in.' : message)
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Join the team workspace and start managing tasks.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
          <select {...register('role')} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500">
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input {...register('name', { required: 'Name is required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500" placeholder="Jordan Lee" />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input {...register('email', { required: 'Email is required' })} autoCapitalize="none" autoComplete="email" className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500" placeholder="you@example.com" />
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
            placeholder="Minimum 6 characters"
          />
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
          <p className="mt-1 text-xs text-slate-500">Use any password with 6 or more characters.</p>
        </div>

        <button disabled={isSubmitting} className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">Sign in</Link>
      </p>
    </div>
  )
}
