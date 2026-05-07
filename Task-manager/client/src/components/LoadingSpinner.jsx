import React from 'react'

export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 py-10 text-slate-600">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-blue-600" />
        <span className="text-sm font-medium">{label}...</span>
      </div>
    </div>
  )
}
