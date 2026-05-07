import React from 'react'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const navigate = useNavigate()
  const { login } = useAuth()
  const toast = useToast()

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      })
      login(response.data)
      toast.success('Welcome back')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-500">Access your projects and tasks securely.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input {...register('email', { required: 'Email is required' })} autoCapitalize="none" autoComplete="email" className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500" placeholder="you@example.com" />
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input type="password" {...register('password', { required: 'Password is required' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500" placeholder="••••••••" />
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
        </div>

        <button disabled={isSubmitting} className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Need an account? <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">Create one</Link>
      </p>
    </div>
  )
}
