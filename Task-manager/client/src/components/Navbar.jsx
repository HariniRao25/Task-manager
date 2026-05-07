import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const toast = useToast()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="text-lg font-semibold tracking-tight text-slate-900">Team Task Manager</div>
      <div className="flex items-center gap-3">
        {user && <div className="hidden text-sm text-slate-600 sm:block">{user.name} ({user.role})</div>}
        {user ? <button onClick={handleLogout} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-rose-700 transition hover:bg-rose-50">Logout</button> : null}
      </div>
    </div>
  )
}
