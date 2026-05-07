import React from 'react'
import { NavLink } from 'react-router-dom'

const LinkItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block rounded-lg px-4 py-2 text-sm font-medium transition ${
        isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`
    }
  >
    {children}
  </NavLink>
)

export default function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white/90 backdrop-blur md:sticky md:top-0 md:flex md:h-screen md:flex-col">
      <div className="border-b border-slate-200 p-5">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</div>
        <div className="mt-1 text-lg font-semibold text-slate-900">Task Manager</div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        <LinkItem to="/">Dashboard</LinkItem>
        <LinkItem to="/projects">Projects</LinkItem>
      </nav>
    </aside>
  )
}
